import express from 'express';
import bodyParser from 'body-parser';
import axios from 'axios';
import dotenv from 'dotenv';
import translate from '@vitalets/google-translate-api';

dotenv.config();

const app = express();
app.use(bodyParser.json());

const WOLFRAM_APP_ID = process.env.WOLFRAM_APP_ID;

// Função para chamar a API do Wolfram Alpha
async function consultaWolfram(input) {
    try {
        // Traduz a entrada para o inglês
        const { text: queryInEnglish } = await translate(input, { from: 'pt', to: 'en' });
        console.log('Pergunta traduzida para inglês:', queryInEnglish);

        const url = `http://api.wolframalpha.com/v1/result?i=${encodeURIComponent(queryInEnglish)}&appid=${WOLFRAM_APP_ID}`;
        const response = await axios.get(url);
        return response.data;
    } catch (error) {
        console.error('Erro ao consultar Wolfram Alpha:', error);
        return 'Desculpe, não consegui calcular isso.';
    }
}

// Endpoint para o webhook do Dialogflow
app.post('/webhook', async (req, res) => {
    const query = req.body.queryResult.queryText;

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
