export default async (request) => {
  // CORS pré-vôo
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  }

  // Permite apenas POST
  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }

  const YOUTUBE_API_KEY = Deno.env.get("YOUTUBE_API_KEY");

  if (!YOUTUBE_API_KEY) {
    return new Response(JSON.stringify({ error: "API key for YouTube is not configured." }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const { query } = await request.json();

    const apiUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=10&q=${encodeURIComponent(query)}&type=video&key=${YOUTUBE_API_KEY}`;

    const youtubeResponse = await fetch(apiUrl);
    const youtubeData = await youtubeResponse.json();

    return new Response(JSON.stringify(youtubeData), {
      status: youtubeResponse.status,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error) {
    console.error("Erro na função de borda do YouTube:", error);
    return new Response(JSON.stringify({ error: "Internal server error." }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

export const config = {
  path: "/youtube-api",
};
      
