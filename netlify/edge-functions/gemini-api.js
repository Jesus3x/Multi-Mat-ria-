// netlify/functions/gemini-api.js
        // netlify/edge-functions/gemini-api.js
export default async function handler(request) {
  // Configurar CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Responder requisições OPTIONS (preflight)
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers });
  }

  if (request.method === 'POST') {
    try {
      const body = await request.json();

      // Requisição de teste
      if (body.test) {
        return new Response(
          JSON.stringify({ status: 'ok', message: 'Gemini Edge Function funcionando' }),
          { status: 200, headers }
        );
      }

      // Obter API Key do ambiente
      const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');

      if (!GEMINI_API_KEY) {
        return new Response(
          JSON.stringify({ error: 'GEMINI_API_KEY não configurada no Netlify' }),
          { status: 500, headers }
        );
      }

      // Construir prompt
      const prompt = body.prompt;

      const requestBody = {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: body.generationConfig || {
          maxOutputTokens: 250,
          temperature: 0.3,
          topP: 0.8,
          topK: 40
        }
      };

      // Chamar API Gemini
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody)
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Erro Gemini API:', errorData);
        return new Response(
          JSON.stringify({
            error: `Erro Gemini API: ${response.status}`,
            details: errorData.error?.message || 'Erro desconhecido'
          }),
          { status: response.status, headers }
        );
      }

      const data = await response.json();

      if (data.candidates && data.candidates[0] && data.candidates[0].content) {
        const aiResponse = data.candidates[0].content.parts[0].text;
        return new Response(
          JSON.stringify({ response: aiResponse, type: body.type || 'general', specialist: body.specialist || 'general' }),
          { status: 200, headers }
        );
      } else {
        return new Response(
          JSON.stringify({ error: 'Resposta inválida da Gemini API' }),
          { status: 500, headers }
        );
      }
    } catch (error) {
      console.error('Erro na Edge Function Gemini:', error);
      return new Response(
        JSON.stringify({ error: 'Erro interno da Edge Function', details: error.message }),
        { status: 500, headers }
      );
    }
  }

  return new Response(JSON.stringify({ error: 'Método não permitido' }), { status: 405, headers });
}

// Configuração da Edge Function
export const config = {
  path: '/gemini-api'
};
        
