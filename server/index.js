const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const axios = require('axios');
const { handleUserMessage } = require('./llm/eventAssistant');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Telegram Bot setup
const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_API = TELEGRAM_TOKEN
    ? `https://api.telegram.org/bot${TELEGRAM_TOKEN}`
    : null;

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.error('MongoDB connection error:', err));

// Routes
const apiRoutes = require('./routes/api');
app.use('/api', apiRoutes);

const cron = require('node-cron');
const scrapeEvents = require('./scraper');

// Telegram webhook route
app.post('/telegram/webhook', async (req, res) => {
    try {
        if (!TELEGRAM_API) {
            return res.status(500).send('Telegram bot token not configured');
        }

        const update = req.body;

        if (!update.message) {
            return res.sendStatus(200);
        }

        const chatId = update.message.chat.id;
        const text = update.message.text || '';

        const replyText = await handleUserMessage({
            telegramId: String(chatId),
            text,
        });

        await axios.post(`${TELEGRAM_API}/sendMessage`, {
            chat_id: chatId,
            text: replyText,
        });

        res.sendStatus(200);
    } catch (error) {
        console.error('Telegram webhook error:', error.message);
        res.sendStatus(500);
    }
});

// Schedule scraping to run every hour
cron.schedule('0 * * * *', () => {
    console.log('Running scheduled scrape every hour...');
    scrapeEvents();
});

app.get('/', (req, res) => {
    res.send('Sydney Events API is running');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});