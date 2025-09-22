// netlify/functions/youtube-search.js
      // netlify/edge-functions/youtube-search.js
export default async function handler(request) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Responder a requisições OPTIONS (preflight)
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers });
  }

  if (request.method === 'GET') {
    try {
      const url = new URL(request.url);
      const params = Object.fromEntries(url.searchParams.entries());

      // Teste de endpoint
      if (params.test) {
        return new Response(JSON.stringify({ status: 'ok', message: 'YouTube Edge Function funcionando' }), { headers });
      }

      const YOUTUBE_API_KEY = Deno.env.get("YOUTUBE_API_KEY");
      if (!YOUTUBE_API_KEY) {
        return new Response(JSON.stringify({ error: 'YOUTUBE_API_KEY não configurada no Netlify' }), { status: 500, headers });
      }

      const query = params.q;
      if (!query) {
        return new Response(JSON.stringify({ error: 'Parâmetro q (query) é obrigatório' }), { status: 400, headers });
      }

      const maxResults = params.maxResults || '3';
      const regionCode = params.regionCode || 'BR';
      const relevanceLanguage = params.relevanceLanguage || 'pt';

      const youtubeUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=${maxResults}&q=${encodeURIComponent(query)}&type=video&regionCode=${regionCode}&relevanceLanguage=${relevanceLanguage}&key=${YOUTUBE_API_KEY}`;

      const response = await fetch(youtubeUrl);
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Erro YouTube API:', errorData);
        return new Response(JSON.stringify({
          error: `Erro YouTube API: ${response.status}`,
          details: errorData.error?.message || 'Erro desconhecido'
        }), { status: response.status, headers });
      }

      const data = await response.json();
      return new Response(JSON.stringify({
        items: data.items || [],
        totalResults: data.pageInfo?.totalResults || 0
      }), { headers });

    } catch (error) {
      console.error('Erro na função YouTube Edge:', error);
      return new Response(JSON.stringify({
        error: 'Erro interno da função YouTube Edge',
        details: error.message
      }), { status: 500, headers });
    }
  }

  return new Response(JSON.stringify({ error: 'Método não permitido' }), { status: 405, headers });
          }
        
