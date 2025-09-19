// netlify/functions/youtube-search.js

exports.handler = async (event, context) => {
  // Configurar CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Responder a requisições OPTIONS (preflight)
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  if (event.httpMethod === 'GET') {
    try {
      const params = event.queryStringParameters || {};
      
      // Requisição de teste
      if (params.test) {
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ status: 'ok', message: 'YouTube Edge Function funcionando' })
        };
      }

      // Obter API Key das variáveis de ambiente
      const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
      
      if (!YOUTUBE_API_KEY) {
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: 'YOUTUBE_API_KEY não configurada no Netlify' })
        };
      }

      const query = params.q || '';
      const maxResults = params.maxResults || '3';
      const regionCode = params.regionCode || 'BR';
      const relevanceLanguage = params.relevanceLanguage || 'pt';

      if (!query) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Parâmetro q (query) é obrigatório' })
        };
      }

      // Fazer requisição para YouTube API
      const youtubeUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=${maxResults}&q=${encodeURIComponent(query)}&type=video&regionCode=${regionCode}&relevanceLanguage=${relevanceLanguage}&key=${YOUTUBE_API_KEY}`;
      
      const response = await fetch(youtubeUrl);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Erro YouTube API:', errorData);
return {
          statusCode: response.status,
          headers,
          body: JSON.stringify({ 
            error: `Erro YouTube API: ${response.status}`,
            details: errorData.error?.message || 'Erro desconhecido'
          })
        };
      }
const data = await response.json();

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          items: data.items || [],
          totalResults: data.pageInfo?.totalResults || 
details: error.message 
        })
      };
    }
  }

  return {
    statusCode: 405,
    headers,
    body: JSON.stringify({ error: 'Método não permitido' })
  };
};
