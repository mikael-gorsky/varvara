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

    // Excel format:
    // - Rows 1-2: Reserved/metadata
    // - Rows 3-4: Column headers (array index 2-3)
    // - Row 5+: Data rows (array index 4+)
    const DATA_START_ROW = 4; // 0-indexed, corresponds to Excel row 5

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

    // Start parsing from row 5 (array index 4)
    for (let i = DATA_START_ROW; i < rawData.length; i++) {
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

    // Fetch all existing products in batches to avoid PostgreSQL IN clause limits
    const productCodes = products.map(p => p.code);
    const existingProductMap = new Map();

    const CODE_BATCH_SIZE = 100;
    console.log(`[import-pricelist] Fetching existing products for ${productCodes.length} codes in batches of ${CODE_BATCH_SIZE}`);

    for (let i = 0; i < productCodes.length; i += CODE_BATCH_SIZE) {
      const batchCodes = productCodes.slice(i, i + CODE_BATCH_SIZE);
      const { data: batchProducts, error: fetchError } = await supabase
        .from("pricelist_products")
        .select("id, code")
        .in("code", batchCodes);

      if (fetchError) {
        console.error("[import-pricelist] Error fetching existing products:", fetchError);
        throw new Error(`Failed to fetch existing products batch ${Math.floor(i / CODE_BATCH_SIZE) + 1}: ${fetchError.message}`);
      }

      for (const p of batchProducts || []) {
        existingProductMap.set(p.code, p.id);
      }
    }

    console.log(`[import-pricelist] Found ${existingProductMap.size} existing products`);

    // Separate products into updates and inserts
    const productsToUpdate = [];
    const productsToInsert = [];

    for (const product of products) {
      if (existingProductMap.has(product.code)) {
        productsToUpdate.push(product);
        stats.products_updated++;
      } else {
        productsToInsert.push(product);
        stats.products_inserted++;
      }
    }

    console.log(`[import-pricelist] Will update ${productsToUpdate.length}, insert ${productsToInsert.length}`);

    // Bulk insert new products
    if (productsToInsert.length > 0) {
      console.log(`[import-pricelist] Bulk inserting ${productsToInsert.length} new products`);

      const { data: insertedProducts, error: insertError } = await supabase
        .from("pricelist_products")
        .insert(
          productsToInsert.map(p => ({
            code: p.code,
            article: p.article,
            name: p.name,
            barcode: p.barcode,
            category: p.category,
          }))
        )
        .select("id, code");

      if (insertError) {
        console.error("[import-pricelist] Bulk insert error:", insertError);
        errors.push(`Bulk insert failed: ${insertError.message}`);
      } else {
        // Add newly inserted products to the map
        for (const product of insertedProducts || []) {
          existingProductMap.set(product.code, product.id);
        }
        console.log(`[import-pricelist] Successfully inserted ${insertedProducts?.length || 0} products`);
      }
    }

    // Bulk update existing products
    if (productsToUpdate.length > 0) {
      console.log(`[import-pricelist] Updating ${productsToUpdate.length} existing products`);

      for (const product of productsToUpdate) {
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
          errors.push(`Update ${product.code}: ${updateError.message}`);
        }
      }
    }

    // Now handle prices - collect all prices for bulk operations
    console.log(`[import-pricelist] Processing prices for ${products.length} products`);

    const allPriceRecords = [];
    for (const product of products) {
      const productId = existingProductMap.get(product.code);
      if (!productId) {
        errors.push(`Cannot find product ID for code: ${product.code}`);
        continue;
      }

      for (const priceData of product.prices) {
        allPriceRecords.push({
          product_id: productId,
          supplier: priceData.supplier,
          price: priceData.price,
          currency: priceData.currency,
        });
      }
    }

    console.log(`[import-pricelist] Total price records to upsert: ${allPriceRecords.length}`);

    // Fetch existing prices in batches to avoid PostgreSQL IN clause limits
    const productIds = Array.from(existingProductMap.values());
    const existingPriceMap = new Map();

    const FETCH_BATCH_SIZE = 100;
    console.log(`[import-pricelist] Fetching existing prices for ${productIds.length} products in batches of ${FETCH_BATCH_SIZE}`);

    for (let i = 0; i < productIds.length; i += FETCH_BATCH_SIZE) {
      const batchIds = productIds.slice(i, i + FETCH_BATCH_SIZE);
      const { data: batchPrices, error: pricesFetchError } = await supabase
        .from("pricelist_prices")
        .select("id, product_id, supplier")
        .in("product_id", batchIds);

      if (pricesFetchError) {
        console.error("[import-pricelist] Error fetching existing prices:", pricesFetchError);
        errors.push(`Failed to fetch existing prices batch ${Math.floor(i / FETCH_BATCH_SIZE) + 1}: ${pricesFetchError.message}`);
      } else {
        for (const p of batchPrices || []) {
          existingPriceMap.set(`${p.product_id}_${p.supplier}`, p.id);
        }
      }
    }

    console.log(`[import-pricelist] Found ${existingPriceMap.size} existing price records`);

    // Separate prices into updates and inserts
    const pricesToUpdate = [];
    const pricesToInsert = [];

    for (const priceRecord of allPriceRecords) {
      const key = `${priceRecord.product_id}_${priceRecord.supplier}`;
      if (existingPriceMap.has(key)) {
        pricesToUpdate.push({
          id: existingPriceMap.get(key),
          ...priceRecord,
        });
      } else {
        pricesToInsert.push(priceRecord);
      }
    }

    console.log(`[import-pricelist] Will update ${pricesToUpdate.length} prices, insert ${pricesToInsert.length} prices`);

    // Bulk insert new prices
    if (pricesToInsert.length > 0) {
      const PRICE_BATCH_SIZE = 500;
      for (let i = 0; i < pricesToInsert.length; i += PRICE_BATCH_SIZE) {
        const batch = pricesToInsert.slice(i, i + PRICE_BATCH_SIZE);
        console.log(`[import-pricelist] Inserting price batch ${Math.floor(i / PRICE_BATCH_SIZE) + 1}`);

        const { error: priceInsertError } = await supabase
          .from("pricelist_prices")
          .insert(batch);

        if (priceInsertError) {
          console.error("[import-pricelist] Price insert error:", priceInsertError);
          errors.push(`Price insert batch failed: ${priceInsertError.message}`);
        } else {
          stats.prices_inserted += batch.length;
        }
      }
    }

    // Bulk update existing prices
    if (pricesToUpdate.length > 0) {
      const PRICE_BATCH_SIZE = 500;
      for (let i = 0; i < pricesToUpdate.length; i += PRICE_BATCH_SIZE) {
        const batch = pricesToUpdate.slice(i, i + PRICE_BATCH_SIZE);
        console.log(`[import-pricelist] Updating price batch ${Math.floor(i / PRICE_BATCH_SIZE) + 1}`);

        for (const priceRecord of batch) {
          const { error: priceUpdateError } = await supabase
            .from("pricelist_prices")
            .update({
              price: priceRecord.price,
              currency: priceRecord.currency,
            })
            .eq("id", priceRecord.id);

          if (priceUpdateError) {
            errors.push(`Price update failed: ${priceUpdateError.message}`);
          } else {
            stats.prices_updated++;
          }
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