const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const Subscriber = require('../models/Subscriber');
const { handleUserMessage } = require('../llm/eventAssistant');

// GET /api/events
router.get('/events', async (req, res) => {
    try {
        const events = await Event.find().sort({ scrapedAt: -1 });
        res.json(events);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST /api/subscribe
router.post('/subscribe', async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    try {
        const existing = await Subscriber.findOne({ email });
        if (existing) {
            return res.status(200).json({ message: 'Already subscribed' });
        }
        const newSubscriber = new Subscriber({ email });
        await newSubscriber.save();
        res.status(201).json({ message: 'Subscribed successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST /api/chat
router.post('/chat', async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: 'Missing text' });

    const reply = await handleUserMessage({
      telegramId: 'web-ui', // placeholder; not used yet
      text: message,
    });

    res.json({ reply });
  } catch (err) {
    console.error('Chat API error:', err.message);
    res.status(500).json({ error: 'Failed to generate response' });
  }
});

module.exports = router;