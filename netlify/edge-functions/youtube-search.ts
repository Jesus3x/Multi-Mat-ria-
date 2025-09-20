
    //netlify/edge-functions/youtube-search.ts


import type { Context } from "https://edge.netlify.com/";

// A função de borda que faz a chamada à API do YouTube de forma segura.
export default async (request: Request, context: Context) => {
  try {
    // Pega a chave de API da variável de ambiente, garantindo que ela não seja exposta.
    const apiKey = Deno.env.get("YOUTUBE_API_KEY");

    // Verifica se a chave de API existe.
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "Chave da API do YouTube não configurada." }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Pega o parâmetro de busca "q" da URL.
    const url = new URL(request.url);
    const query = url.searchParams.get("q");

    // Verifica se o termo de busca foi fornecido.
    if (!query) {
      return new Response(JSON.stringify({ error: "Parâmetro de busca 'q' é obrigatório." }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Monta a URL da API do YouTube.
    const youtubeApiUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=5&q=${encodeURIComponent(query)}&type=video&key=${apiKey}`;

    // Faz a chamada à API.
    const response = await fetch(youtubeApiUrl);
    const data = await response.json();

    // Retorna a resposta da API do YouTube.
    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: { "Content-Type": "application/json" },
    });

 } catch (error) {
    console.error("Erro na Edge Function:", error);
    return new Response(JSON.stringify({ error: "Erro interno do servidor." }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

