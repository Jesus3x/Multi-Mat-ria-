// netlify/functions/youtube-search.js
export default async (request) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Responder requisições OPTIONS (preflight)
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers });
  }

  if (request.method !== 'GET') {
    return new Response(JSON.stringify({ error: 'Método não permitido' }), {
      status: 405,
      headers
    });
  }

  try {
    const url = new URL(request.url);
    const params = url.searchParams;

    // Teste rápido
    if (params.get('test')) {
      return new Response(JSON.stringify({ status: 'ok', message: 'YouTube Edge Function funcionando' }), {
        status: 200,
        headers
      });
    }

    const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
    if (!YOUTUBE_API_KEY) {
      return new Response(JSON.stringify({ error: 'YOUTUBE_API_KEY não configurada no Netlify' }), {
        status: 500,
        headers
      });
    }

    const query = params.get('q');
    const maxResults = params.get('maxResults') || '3';
    const regionCode = params.get('regionCode') || 'BR';
    const relevanceLanguage = params.get('relevanceLanguage') || 'pt';

    if (!query) {
      return new Response(JSON.stringify({ error: 'Parâmetro q (query) é obrigatório' }), {
        status: 400,
        headers
      });
    }

    const youtubeUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=${maxResults}&q=${encodeURIComponent(query)}&type=video&regionCode=${regionCode}&relevanceLanguage=${relevanceLanguage}&key=${YOUTUBE_API_KEY}`;

    const response = await fetch(youtubeUrl);
    if (!response.ok) {
      const errorData = await response.json();
      return new Response(JSON.stringify({
        error: `Erro YouTube API: ${response.status}`,
        details: errorData.error?.message || 'Erro desconhecido'
      }), { status: response.status, headers });
    }

    const data = await response.json();
    return new Response(JSON.stringify({
      items: data.items || [],
      totalResults: data.pageInfo?.totalResults || 0
    }), { status: 200, headers });

  } catch (error) {
    return new Response(JSON.stringify({
      error: 'Erro interno da Edge Function',
      details: error.message
    }), { status: 500, headers });
  }
};

export const config = {
  path: "/youtube-search"
};
                          
