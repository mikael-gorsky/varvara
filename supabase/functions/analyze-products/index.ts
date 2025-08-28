import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

interface ProductData {
  name: string;
  price: number | null;
  external_id: string | null;
  supplier: string | null;
}

interface AIGroupingRequest {
  category_name: string;
  products: ProductData[];
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');

    if (!openaiApiKey) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'OpenAI API key not configured',
          details: 'Set OPENAI_API_KEY in Supabase Edge Function environment variables',
          instructions: [
            '1. Go to Supabase Dashboard',
            '2. Navigate to Edge Functions settings',
            '3. Add OPENAI_API_KEY environment variable',
            '4. Restart the function'
          ]
        }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const { category_name, products }: AIGroupingRequest = await req.json();

    if (!category_name || !products || products.length === 0) {
      throw new Error('Category_name and products are required');
    }

    // Prepare data for AI analysis
    const productAnalysis = products.map(p => ({
      name: p.name,
      price: p.price,
      supplier: p.supplier,
      external_id: p.external_id
    }));

    // Create AI prompt with price analysis context
    const prompt = `
Analyze these products from category "${category_name}" and group similar/identical products together.</anoltAction>

Products to analyze:
${productAnalysis.map((p, i) => 
  `${i + 1}. "${p.name}" - Price: ${p.price || 'N/A'} - Supplier: ${p.supplier || 'Unknown'} - ID: ${p.external_id || 'N/A'}`
).join('\n')}

Instructions:
1. Group products that represent the same or very similar items
2. Consider price differences - if one product is significantly more expensive than others in a potential group, it might be a different quality/model
3. Ignore minor variations in naming (Russian/English, abbreviations, etc.)
4. Provide confidence score (0.0-1.0) for each group
5. Include price analysis for each group (min, max, average, outliers)

Return ONLY valid JSON in this exact format:
{
  "groups": [
    {
      "group_name": "Descriptive group name",
      "group_description": "Brief description of what these products are",
      "products": ["Product Name 1", "Product Name 2"],
      "confidence_score": 0.95,
      "price_analysis": {
        "min_price": 100,
        "max_price": 120,
        "avg_price": 110,
        "price_variance": "low|medium|high",
        "outliers": ["Product Name if price is significantly different"]
      },
      "vendor_count": 2,
      "vendors": ["Supplier 1", "Supplier 2"]
    }
  ],
  "ungrouped": ["Products that don't fit any group"],
  "total_groups": 1,
  "analysis_confidence": 0.90
}`;

    // Call OpenAI GPT-5-mini API
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-5-mini',  // Using GPT-5-mini as requested
        messages: [
          {
            role: 'system',
            content: 'You are an expert product analyst. Analyze product names and group similar products together. Always respond with valid JSON only.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.1,
        max_tokens: 2000
      })
    });

    if (!openaiResponse.ok) {
      throw new Error(`OpenAI API error: ${openaiResponse.status} ${openaiResponse.statusText}`);
    }

    const aiResult = await openaiResponse.json();
    let parsedGroups;

    try {
      parsedGroups = JSON.parse(aiResult.choices[0].message.content);
    } catch (e) {
      throw new Error(`Failed to parse AI response: ${e.message}`);
    }

    // Store results in database
    const groupRecords = [];
    
    for (const group of parsedGroups.groups) {
      const record = {
        category: category_name,
        group_name: group.group_name,
        group_description: group.group_description,
        product_names: group.products,
        price_analysis: group.price_analysis,
        confidence_score: group.confidence_score,
        vendor_analysis: {
          vendor_count: group.vendor_count,
          vendors: group.vendors
        },
        ai_response: {
          full_response: parsedGroups,
          ungrouped: parsedGroups.ungrouped,
          analysis_confidence: parsedGroups.analysis_confidence
        }
      };
      groupRecords.push(record);
    }

    // Clear existing groups for this category (refresh analysis)
    await supabase
      .from('ai_product_groups')
      .delete()
      .eq('category', category_name);

    // Insert new groups
    const { data: insertedGroups, error: insertError } = await supabase
      .from('ai_product_groups')
      .insert(groupRecords)
      .select();

    if (insertError) {
      throw new Error(`Database error: ${insertError.message}`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        category_name,
        groups_created: insertedGroups.length,
        ungrouped_products: parsedGroups.ungrouped?.length || 0,
        analysis_confidence: parsedGroups.analysis_confidence,
        data: insertedGroups
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );

  } catch (error) {
    console.error('Product analysis error:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        details: 'Check function logs for more information'
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  }
});