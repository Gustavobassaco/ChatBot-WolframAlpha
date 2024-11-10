const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(bodyParser.json());

// Função para chamar a API do LibreTranslate localmente
async function consultaLibreTranslate(input) {
    const url = 'http://localhost:5000/translate'; // URL da instância local do Docker

    try {
        const response = await axios.post(url, {
            q: input,
            source: 'auto', // Detecta automaticamente o idioma
            target: 'en',   // Traduz para inglês
            format: 'text'
        });

        return response.data.translatedText;
    } catch (error) {
        console.error('Erro ao consultar o LibreTranslate:', error);
        return 'Desculpe, não consegui traduzir isso.';
    }
}

// Função para chamar a API do Wolfram Alpha
async function consultaWolfram(input) {
    const respostaTraduzida = await consultaLibreTranslate(input); // Traduz a pergunta antes de enviar para Wolfram Alpha
    console.log(`Pergunta traduzida: ${respostaTraduzida}`);

    const url = `http://api.wolframalpha.com/v1/result?i=${encodeURIComponent(input)}&appid=${process.env.WOLFRAM_APP_ID}`;

    try {
        const response = await axios.get(url);
        return response.data;
    } catch (error) {
        console.error('Erro ao consultar Wolfram Alpha:', error);
        return 'Desculpe, não consegui calcular isso.';
    }
}

// Endpoint para o webhook do Dialogflow
app.post('/webhook', async (req, res) => {
    const query = req.body.queryResult.queryText; // Obter a pergunta do usuário

    // Consultar o Wolfram Alpha com a pergunta traduzida
    const respostaWolfram = await consultaWolfram(query);

    // Responder ao Dialogflow
    return res.json({
        fulfillmentText: respostaWolfram,
    });
});

app.get('/', (req, res) => {
    res.send('Bem-vindo ao chatbot do Wolfram Alpha!');
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});