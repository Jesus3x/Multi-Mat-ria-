
    //netlify/edge-functions/youtube-search.ts

// Configuração para a função de borda
export default async (request) => {
  // Configuração de CORS para permitir requisições do seu domínio
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

  // Define a chave da API do YouTube como uma variável de ambiente no Netlify
  const YOUTUBE_API_KEY = Deno.env.get("YOUTUBE_API_KEY");

  // Se a chave não estiver configurada, retorne um erro
  if (!YOUTUBE_API_KEY) {
    return new Response(JSON.stringify({ error: "API key for YouTube is not configured." }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const { query } = await request.json();

    // Endereço da API do YouTube
    const apiUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=10&q=${encodeURIComponent(query)}&type=video&key=${YOUTUBE_API_KEY}`;

    const youtubeResponse = await fetch(apiUrl);
    const youtubeData = await youtubeResponse.json();

    // Retorna a resposta da API do YouTube para o cliente, com cabeçalhos CORS
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
