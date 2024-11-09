const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(bodyParser.json());

const WOLFRAM_APP_ID = process.env.WOLFRAM_APP_ID;

// Função para chamar a API do Wolfram Alpha
async function consultaWolfram(query) {
    const url = `http://api.wolframalpha.com/v1/result?i=${encodeURIComponent(query)}&appid=${WOLFRAM_APP_ID}`;
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

    // Consultar o Wolfram Alpha com a pergunta
    const respostaWolfram = await consultaWolfram(query);

    // Responder ao Dialogflow
    return res.json({
        fulfillmentText: respostaWolfram,
    });
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
