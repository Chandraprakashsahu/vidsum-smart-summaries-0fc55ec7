import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { intro, keyPoints, targetLanguage } = await req.json();
    
    console.log('Translating summary to:', targetLanguage);
    
    const languageName = targetLanguage === 'hi' ? 'Hindi' : 'English';
    
    const prompt = `Translate the following video summary content to ${languageName}. 
Keep the same structure and meaning. Return a valid JSON object with "intro" and "keyPoints" fields.

Original content:
Intro: ${intro}

Key Points: ${JSON.stringify(keyPoints)}

Return ONLY valid JSON in this exact format:
{
  "intro": "translated intro text",
  "keyPoints": [
    {
      "title": "translated title",
      "points": ["translated point 1", "translated point 2"]
    }
  ]
}`;

    const response = await fetch('https://api.langbase.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('LANGBASE_API_KEY')}`,
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'user', content: prompt }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', errorText);
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    console.log('Raw AI response:', content);
    
    // Extract JSON from response
    let jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No valid JSON found in response');
    }
    
    const translatedContent = JSON.parse(jsonMatch[0]);
    
    console.log('Translation successful');
    
    return new Response(JSON.stringify(translatedContent), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    console.error('Error in translate-summary function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
