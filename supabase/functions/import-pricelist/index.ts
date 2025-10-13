import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import * as XLSX from "npm:xlsx@0.18.5";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface SupplierPrice {
  supplier: string;
  price: number | null;
  currency: string | null;
}

interface ProductData {
  code: string;
  article: string | null;
  name: string;
  barcode: string | null;
  category: string | null;
  prices: SupplierPrice[];
}

interface ImportStats {
  products_processed: number;
  products_inserted: number;
  products_updated: number;
  prices_inserted: number;
  prices_updated: number;
  categories_found: number;
  errors: string[];
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    console.log("[import-pricelist] Function started");
    console.log("[import-pricelist] Request method:", req.method);
    console.log("[import-pricelist] Request URL:", req.url);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("[import-pricelist] Missing environment variables");
      return new Response(
        JSON.stringify({
          success: false,
          error: "Server configuration error: Missing environment variables",
        }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders,
          },
        }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      console.error("[import-pricelist] No file in request");
      return new Response(
        JSON.stringify({
          success: false,
          error: "No file provided",
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders,
          },
        }
      );
    }

    console.log(`[import-pricelist] Processing file: ${file.name}, size: ${file.size} bytes`);

    const arrayBuffer = await file.arrayBuffer();
    console.log(`[import-pricelist] File read, buffer size: ${arrayBuffer.byteLength}`);

    const workbook = XLSX.read(arrayBuffer, { type: "array" });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];

    console.log(`[import-pricelist] Total rows: ${rawData.length}`);

    const supplierMapping = [
      { name: "Реалист", priceCol: 4, currencyCol: 5 },
      { name: "Поставщик 1", priceCol: 6, currencyCol: 7 },
      { name: "Поставщик 2", priceCol: 8, currencyCol: 9 },
      { name: "Поставщик 3", priceCol: 10, currencyCol: 11 },
      { name: "Поставщик 7", priceCol: 12, currencyCol: 13 },
      { name: "Розничные", priceCol: 14, currencyCol: 15 },
      { name: "ВсеИнструменты", priceCol: 17, currencyCol: 18 },
      { name: "ДНС", priceCol: 19, currencyCol: 20 },
      { name: "Компсервис", priceCol: 21, currencyCol: 22 },
      { name: "Комус", priceCol: 23, currencyCol: 24 },
      { name: "Минск", priceCol: 25, currencyCol: 26 },
      { name: "Смартон", priceCol: 27, currencyCol: 28 },
    ];

    const products: ProductData[] = [];
    let currentCategory: string | null = null;
    const categories = new Set<string>();
    const errors: string[] = [];

    for (let i = 4; i < rawData.length; i++) {
      const row = rawData[i];

      if (!row || row.length === 0) {
        continue;
      }

      const code = row[0] ? String(row[0]).trim() : "";
      const nomenclature = row[2] ? String(row[2]).trim() : "";

      if (!code && nomenclature) {
        currentCategory = nomenclature;
        categories.add(nomenclature);
        console.log(`[import-pricelist] Found category: ${currentCategory}`);
        continue;
      }

      if (code) {
        try {
          const article = row[1] ? String(row[1]).trim() : null;
          const barcode = row[3] ? String(row[3]).trim() : null;

          const prices: SupplierPrice[] = [];

          for (const supplier of supplierMapping) {
            const priceValue = row[supplier.priceCol];
            const currencyValue = row[supplier.currencyCol];

            const price = priceValue && !isNaN(Number(priceValue))
              ? Number(priceValue)
              : null;

            const currency = currencyValue ? String(currencyValue).trim() : null;

            if (price !== null || currency !== null) {
              prices.push({
                supplier: supplier.name,
                price,
                currency,
              });
            }
          }

          products.push({
            code,
            article,
            name: nomenclature || "Unnamed Product",
            barcode,
            category: currentCategory,
            prices,
          });
        } catch (error) {
          errors.push(`Row ${i + 1}: ${error instanceof Error ? error.message : "Parse error"}`);
        }
      }
    }

    console.log(`[import-pricelist] Parsed ${products.length} products from ${categories.size} categories`);

    const stats: ImportStats = {
      products_processed: products.length,
      products_inserted: 0,
      products_updated: 0,
      prices_inserted: 0,
      prices_updated: 0,
      categories_found: categories.size,
      errors,
    };

    const BATCH_SIZE = 50;
    for (let i = 0; i < products.length; i += BATCH_SIZE) {
      const batch = products.slice(i, i + BATCH_SIZE);
      console.log(`[import-pricelist] Processing batch ${i / BATCH_SIZE + 1}, products ${i + 1} to ${Math.min(i + BATCH_SIZE, products.length)}`);

      for (const product of batch) {
        try {
          const { data: existingProduct } = await supabase
            .from("pricelist_products")
            .select("id")
            .eq("code", product.code)
            .maybeSingle();

          let productId: string;

          if (existingProduct) {
            const { error: updateError } = await supabase
              .from("pricelist_products")
              .update({
                article: product.article,
                name: product.name,
                barcode: product.barcode,
                category: product.category,
              })
              .eq("code", product.code);

            if (updateError) {
              errors.push(`Product ${product.code}: ${updateError.message}`);
              continue;
            }

            productId = existingProduct.id;
            stats.products_updated++;
          } else {
            const { data: newProduct, error: insertError } = await supabase
              .from("pricelist_products")
              .insert({
                code: product.code,
                article: product.article,
                name: product.name,
                barcode: product.barcode,
                category: product.category,
              })
              .select("id")
              .single();

            if (insertError || !newProduct) {
              errors.push(`Product ${product.code}: ${insertError?.message || "Insert failed"}`);
              continue;
            }

            productId = newProduct.id;
            stats.products_inserted++;
          }

          for (const priceData of product.prices) {
            const { data: existingPrice } = await supabase
              .from("pricelist_prices")
              .select("id")
              .eq("product_id", productId)
              .eq("supplier", priceData.supplier)
              .maybeSingle();

            if (existingPrice) {
              const { error: priceUpdateError } = await supabase
                .from("pricelist_prices")
                .update({
                  price: priceData.price,
                  currency: priceData.currency,
                })
                .eq("id", existingPrice.id);

              if (priceUpdateError) {
                errors.push(`Price ${product.code}/${priceData.supplier}: ${priceUpdateError.message}`);
              } else {
                stats.prices_updated++;
              }
            } else {
              const { error: priceInsertError } = await supabase
                .from("pricelist_prices")
                .insert({
                  product_id: productId,
                  supplier: priceData.supplier,
                  price: priceData.price,
                  currency: priceData.currency,
                });

              if (priceInsertError) {
                errors.push(`Price ${product.code}/${priceData.supplier}: ${priceInsertError.message}`);
              } else {
                stats.prices_inserted++;
              }
            }
          }
        } catch (error) {
          errors.push(`Product ${product.code}: ${error instanceof Error ? error.message : "Unknown error"}`);
        }
      }
    }

    console.log(`[import-pricelist] Import complete:`, stats);

    return new Response(
      JSON.stringify({
        success: true,
        stats,
      }),
      {
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error) {
    console.error("[import-pricelist] Error:", error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        details: "Check function logs for more information",
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  }
});