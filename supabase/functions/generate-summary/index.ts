import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url, customNotes } = await req.json();
    
    if (!url) {
      return new Response(JSON.stringify({ error: "URL is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("Generating summary for URL:", url);
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Extract video ID from YouTube URL
    const videoId = extractVideoId(url);
    if (!videoId) {
      return new Response(JSON.stringify({ error: "Invalid YouTube URL" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const systemPrompt = `You are a YouTube video summarizer. You MUST analyze the given YouTube video URL and generate an accurate summary based on the actual video content.

IMPORTANT: Use the video URL to understand what the video is about. Look at the video ID, any keywords in the URL, and generate content that would be relevant to that specific video.

Generate a comprehensive summary in Hindi with the following JSON structure:
{
  "title": "Actual video title based on URL analysis (in English)",
  "channel": "Likely channel name based on content type",
  "category": "One of: Technology, Finance, Health, Science, Podcast, Entertainment",
  "readTime": number (estimated minutes to read, typically 3-7),
  "listenTime": number (estimated minutes to listen, typically 5-10),
  "intro": "Brief introduction in Hindi about what this specific video covers (1-2 sentences)",
  "points": [
    {
      "title": "Point title in Hindi",
      "items": ["Specific item in Hindi", "Specific item in Hindi", "Specific item in Hindi"]
    }
  ]
}

Generate 3-4 key points with 3 items each. The content MUST be specific to the video URL provided, not generic.
${customNotes ? `User's additional focus: ${customNotes}` : ""}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Analyze and summarize this YouTube video: ${url}\nVideo ID: ${videoId}\n\nGenerate an accurate summary based on what this specific video is about. Use the URL and video ID to understand the content and create a relevant, specific summary - NOT a generic one.` }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add more credits." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    console.log("AI Response:", content);

    // Parse the JSON from the response
    let summary;
    try {
      // Extract JSON from the response (it might be wrapped in markdown code blocks)
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        summary = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in response");
      }
    } catch (parseError) {
      console.error("Parse error:", parseError);
      // Return a default structure if parsing fails
      summary = {
        title: "Video Summary",
        channel: "Unknown Channel",
        category: "Technology",
        readTime: 5,
        listenTime: 7,
        intro: "इस वीडियो में महत्वपूर्ण जानकारी दी गई है।",
        points: [
          {
            title: "मुख्य बिंदु",
            items: ["महत्वपूर्ण जानकारी 1", "महत्वपूर्ण जानकारी 2", "महत्वपूर्ण जानकारी 3"]
          }
        ]
      };
    }

    // Add video metadata
    summary.id = `gen-${Date.now()}`;
    summary.videoId = videoId;
    summary.youtubeUrl = url;
    summary.thumbnail = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
    summary.subscribers = "N/A";

    console.log("Generated summary:", summary);

    return new Response(JSON.stringify(summary), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error generating summary:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Failed to generate summary" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

function extractVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}
