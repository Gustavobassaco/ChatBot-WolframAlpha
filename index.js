import express from 'express';
import bodyParser from 'body-parser';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(bodyParser.json());

const WOLFRAM_APP_ID = process.env.WOLFRAM_APP_ID;
const TRANSLATE_API_URL = process.env.TRANSLATE_API_URL || 'https://translate-wmjg.onrender.com/translate'; // URL do servidor Flask

// Função para chamar a API do Wolfram Alpha
async function consultaWolfram(input) {
    try {
        // Fazendo a tradução para o inglês via Flask
        const translationResponse = await axios.post(TRANSLATE_API_URL, {
            text: input,
            target_lang: 'en',
        });

        const queryInEnglish = translationResponse.data.translated_text;
        console.log('Pergunta traduzida para inglês:', queryInEnglish);

        // Consultar Wolfram Alpha com a pergunta traduzida
        const url = `http://api.wolframalpha.com/v1/result?i=${encodeURIComponent(queryInEnglish)}&appid=${WOLFRAM_APP_ID}`;
        const response = await axios.get(url);
        return response.data;
    } catch (error) {
        console.error('Erro ao consultar Wolfram Alpha ou ao traduzir:', error);
        return 'Desculpe, não consegui calcular isso.';
    }
}

// Endpoint para o webhook do Dialogflow
app.post('/webhook', async (req, res) => {
    const query = req.body.queryResult.queryText;

    // Consultar o Wolfram Alpha com a pergunta traduzida
    const respostaWolfram = await consultaWolfram(query);

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
