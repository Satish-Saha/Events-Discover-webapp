const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const Subscriber = require('../models/Subscriber');
const Otp = require('../models/Otp');
const { handleUserMessage } = require('../llm/eventAssistant');
const nodemailer = require('nodemailer');

// Brevo (Sendinblue) Transporter
const transporter = nodemailer.createTransport({
  host: 'smtp-relay.brevo.com',
  port: 587,
  secure: false,
  auth: {
    user: 'apikey',
    pass: process.env.BREVO_PASS
  },
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 10000
});

// Helper to generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// GET /api/events
router.get('/events', async (req, res) => {
  try {
    const events = await Event.find().sort({ scrapedAt: -1 });
    res.json(events);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/send-otp
router.post('/send-otp', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Email is required' });

  try {
    // Generate OTP
    const otp = generateOTP();

    // Save to DB (Update if exists or create new)
    // We delete any existing OTP for this email first to avoid duplicates/confusion
    await Otp.deleteMany({ email });

    const newOtp = new Otp({ email, otp });
    await newOtp.save();

    if (!process.env.BREVO_PASS) {
      throw new Error('Email credentials (BREVO_PASS) missing');
    }

    const mailOptions = {
      from: `"Event App" <${process.env.BREVO_SENDER}>`,
      to: email, // Receiver
      subject: 'Your Verification Code',
      html: `
        <h3>Your Verification Code</h3>
        <p>Use this code to verify your email address:</p>
        <p style="font-size: 24px; font-weight: bold; letter-spacing: 5px; color: #3b82f6;">${otp}</p>
        <p>It expires in 5 minutes.</p>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`OTP sent to ${email} (via Brevo)`);

    res.status(200).json({ message: 'OTP sent successfully' });

  } catch (err) {
    console.error('Send OTP Error:', err);
    // Clean error message for client
    const msg = err.message || 'Internal Server Error';
    res.status(500).json({ message: `Failed to send OTP email: ${msg}` });
  }
});

// POST /api/verify-otp
router.post('/verify-otp', async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) return res.status(400).json({ message: 'Email and OTP are required' });

  try {
    const record = await Otp.findOne({ email, otp });

    if (!record) {
      // Logic for simplicity: If not found, it's invalid or expired.
      return res.status(401).json({ message: 'Invalid or expired OTP' });
    }

    // OTP is valid
    await Otp.deleteOne({ _id: record._id });

    // Check if subscriber exists, if not, create one
    let subscriber = await Subscriber.findOne({ email });
    if (!subscriber) {
      subscriber = new Subscriber({ email });
      await subscriber.save();
    }

    res.status(200).json({ message: 'Verification successful' });

  } catch (err) {
    console.error('Verify OTP Error:', err);
    res.status(500).json({ message: 'Verification failed' });
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