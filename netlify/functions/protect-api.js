// netlify/functions/protect-api.js

const GEMINI_PRO_FLASH_API_KEY = process.env.GEMINI_PRO_FLASH_API_KEY;
const YOUTUBE_V3_API_KEY = process.env.YOUTUBE_V3_API_KEY;
const AUTH_TOKEN = process.env.AUTH_TOKEN;

const API_CONFIG = {
  'gemini-pro-flash': {
    url: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent',
    key: GEMINI_PRO_FLASH_API_KEY
  },
  'youtube-v3': {
    url: 'https://youtube.googleapis.com/youtube/v3/videos', // Exemplo de endpoint
    key: YOUTUBE_V3_API_KEY
  }
};

/**
 * Netlify Function para rotear e proteger requisições para APIs do Google.
 * @param {object} event - O objeto do evento que contém a requisição HTTP.
 * @returns {Promise<object>} - Uma promessa que resolve para o objeto de resposta.
 */
exports.handler = async (event) => {
  const request = event;

  if (request.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: 'Método não permitido.'
    };
  }

  const authHeader = request.headers['authorization'];
  if (!authHeader || authHeader !== `Bearer ${AUTH_TOKEN}`) {
    return {
      statusCode: 401,
      body: 'Acesso não autorizado.'
    };
  }

  const queryParams = new URLSearchParams(request.queryStringParameters);
  const apiTarget = queryParams.get('api');

  if (!apiTarget || !API_CONFIG[apiTarget]) {
    return {
      statusCode: 400,
      body: 'API de destino inválida ou não especificada.'
    };
  }

  const target = API_CONFIG[apiTarget];

  const apiUrl = new URL(target.url);
  apiUrl.searchParams.set('key', target.key);

  const body = JSON.parse(request.body);

  try {
    const apiResponse = await fetch(apiUrl.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    const responseBody = await apiResponse.text();

    return {
      statusCode: apiResponse.status,
      body: responseBody
    };
    
  } catch (error) {
    console.error('Erro ao chamar a API do Google:', error);
    return {
      statusCode: 500,
      body: 'Erro interno do servidor.'
    };
  }
};
