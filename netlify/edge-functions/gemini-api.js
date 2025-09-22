//netlify/functions/gemini-api.js
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
  // Verificar se é uma requisição de teste
  if (event.httpMethod === 'POST') {
    try {
      const body = JSON.parse(event.body);
      
      // Requisição de teste
      if (body.test) {
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ status: 'ok', message: 'Gemini Edge Function funcionando' })
        };
      }
      // Obter API Key das variáveis de ambiente
      const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
      
      if (!GEMINI_API_KEY) {
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: 'GEMINI_API_KEY não configurada no Netlify' })
        };
      }
            // Construir prompt baseado no tipo de consulta
      let prompt = body.prompt;
      
      if (body.type === 'symptom_analysis') {
        prompt = body.prompt;
      } else if (body.roomType) {
        prompt = body.prompt;
      } else if (body.type === 'nutrition_consultation' || body.type === 'nutrition_consultation_with_profile') {
        prompt = body.prompt;
      } else if (body.type === 'psychology_consultation' || body.type === 'psychology_consultation_with_profile') {
        prompt = body.prompt;
      }
            // netlify/functions/gemini-api.js
exports.handler = async (event, context) => {
  // Configurar CORS
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Content-Type": "application/json"
  };

  // Preflight (OPTIONS)
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  if (event.httpMethod === "POST") {
    try {
      const body = JSON.parse(event.body);

      // Teste rápido
      if (body.test) {
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ status: "ok", message: "Gemini Function funcionando" })
        };
      }

      // API key
      const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
      if (!GEMINI_API_KEY) {
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: "GEMINI_API_KEY não configurada no Netlify" })
        };
      }

      // Prompt recebido
      const prompt = body.prompt || "Digite uma mensagem";

      // Corpo da requisição Gemini
      const requestBody = {
        contents: [
          { parts: [{ text: prompt }] }
        ],
        generationConfig: body.generationConfig || {
          maxOutputTokens: 250,
          temperature: 0.3,
          topP: 0.8,
          topK: 40
        }
      };

      // Chamada à Gemini API
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestBody)
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Erro Gemini API:", errorData);
        return {
          statusCode: response.status,
          headers,
          body: JSON.stringify({
            error: `Erro Gemini API: ${response.status}`,
            details: errorData.error?.message || "Erro desconhecido"
          })
        };
      }

      const data = await response.json();
      const aiResponse =
        data?.candidates?.[0]?.content?.parts?.[0]?.text || "Sem resposta da IA";

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          response: aiResponse,
          type: body.type || "general",
          specialist: body.specialist || "general"
        })
      };
    } catch (error) {
      console.error("Erro na Function:", error);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          error: "Erro interno da Function",
          details: error.message
        })
      };
    }
  }

  // Método não permitido
  return {
    statusCode: 405,
    headers,
    body: JSON.stringify({ error: "Método não permitido" })
  };
};
