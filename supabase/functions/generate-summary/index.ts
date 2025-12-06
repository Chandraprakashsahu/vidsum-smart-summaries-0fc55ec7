import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Fetch actual video metadata from YouTube oEmbed API
async function fetchVideoMetadata(url: string): Promise<{ title: string; author: string; authorUrl?: string } | null> {
  try {
    const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`;
    const response = await fetch(oembedUrl);
    if (response.ok) {
      const data = await response.json();
      return {
        title: data.title || "Unknown Title",
        author: data.author_name || "Unknown Channel",
        authorUrl: data.author_url || null,
      };
    }
  } catch (error) {
    console.error("Error fetching video metadata:", error);
  }
  return null;
}

// Fetch channel details including logo using YouTube Data API
async function fetchChannelDetails(videoId: string, apiKey: string): Promise<{ channelId: string; channelTitle: string; channelLogo: string | null } | null> {
  try {
    // First, get channel ID from video
    const videoUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${apiKey}`;
    console.log("Fetching video details from YouTube API...");
    
    const videoResponse = await fetch(videoUrl);
    if (!videoResponse.ok) {
      console.error("YouTube API video error:", videoResponse.status, await videoResponse.text());
      return null;
    }
    
    const videoData = await videoResponse.json();
    const snippet = videoData.items?.[0]?.snippet;
    
    if (!snippet) {
      console.log("No video snippet found");
      return null;
    }
    
    const channelId = snippet.channelId;
    const channelTitle = snippet.channelTitle;
    
    console.log("Found channel:", channelTitle, "ID:", channelId);
    
    // Now fetch channel details to get the logo
    const channelUrl = `https://www.googleapis.com/youtube/v3/channels?part=snippet&id=${channelId}&key=${apiKey}`;
    const channelResponse = await fetch(channelUrl);
    
    if (!channelResponse.ok) {
      console.error("YouTube API channel error:", channelResponse.status, await channelResponse.text());
      return { channelId, channelTitle, channelLogo: null };
    }
    
    const channelData = await channelResponse.json();
    const channelSnippet = channelData.items?.[0]?.snippet;
    
    if (!channelSnippet) {
      console.log("No channel snippet found");
      return { channelId, channelTitle, channelLogo: null };
    }
    
    // Get the best quality thumbnail available
    const thumbnails = channelSnippet.thumbnails;
    const channelLogo = thumbnails?.high?.url || thumbnails?.medium?.url || thumbnails?.default?.url || null;
    
    console.log("Channel logo URL:", channelLogo);
    
    return { channelId, channelTitle, channelLogo };
  } catch (error) {
    console.error("Error fetching channel details:", error);
    return null;
  }
}

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
    const YOUTUBE_API_KEY = Deno.env.get("YOUTUBE_API_KEY");
    
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

    // Fetch actual video metadata from YouTube oEmbed
    const metadata = await fetchVideoMetadata(url);
    console.log("Video metadata from oEmbed:", metadata);

    let actualTitle = metadata?.title || "Unknown Video";
    let actualChannel = metadata?.author || "Unknown Channel";
    let channelLogo: string | null = null;
    
    // Try to get real channel logo using YouTube Data API if API key is available
    if (YOUTUBE_API_KEY) {
      console.log("YouTube API key found, fetching channel details...");
      const channelDetails = await fetchChannelDetails(videoId, YOUTUBE_API_KEY);
      if (channelDetails) {
        actualChannel = channelDetails.channelTitle || actualChannel;
        channelLogo = channelDetails.channelLogo;
        console.log("Got channel logo:", channelLogo);
      }
    } else {
      console.log("No YouTube API key configured, using fallback avatar");
    }

    const systemPrompt = `You are a YouTube video summarizer. Generate a comprehensive summary for the video titled "${actualTitle}" by "${actualChannel}".

Generate the summary in Hindi with the following JSON structure:
{
  "category": "One of: Technology, Finance, Health, Science, Podcast, Entertainment",
  "readTime": number (estimated minutes to read, typically 3-7),
  "listenTime": number (estimated minutes to listen, typically 5-10),
  "intro": "Brief introduction in Hindi about this video (1-2 sentences)",
  "points": [
    {
      "title": "Point title in Hindi",
      "items": ["Specific item in Hindi", "Specific item in Hindi", "Specific item in Hindi"]
    }
  ]
}

Generate 3-4 key points with 3 items each. Create content specifically relevant to: "${actualTitle}"
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
          { role: "user", content: `Create a detailed summary for this YouTube video:\nTitle: ${actualTitle}\nChannel: ${actualChannel}\nURL: ${url}` }
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
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        summary = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in response");
      }
    } catch (parseError) {
      console.error("Parse error:", parseError);
      summary = {
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

    // Add actual video metadata
    summary.id = `gen-${Date.now()}`;
    summary.title = actualTitle;
    summary.channel = actualChannel;
    summary.channelLogo = channelLogo; // Real YouTube channel logo or null
    summary.videoId = videoId;
    summary.youtubeUrl = url;
    summary.thumbnail = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
    summary.subscribers = "N/A";

    console.log("Generated summary with channel logo:", summary.channelLogo);

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
