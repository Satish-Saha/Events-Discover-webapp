const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const Subscriber = require('../models/Subscriber');
const Otp = require('../models/Otp');
const { handleUserMessage } = require('../llm/eventAssistant');
const nodemailer = require('nodemailer');

// Email Transporter Setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
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

    // Send Email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Your Verification Code',
      text: `Your verification code is: ${otp}. It expires in 5 minutes.`
    };

    try {
      if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
        await transporter.sendMail(mailOptions);
        console.log(`OTP sent to ${email}`);
      } else {
        throw new Error('No email credentials provided');
      }
    } catch (emailErr) {
      console.error('Failed to send email (using console fallback):', emailErr.message);
      // Fallback for demo/dev: Log OTP to console so flow isn't blocked
      console.log(`[DEV FALLBACK] OTP for ${email}: ${otp}`);
    }

    res.status(200).json({ message: 'OTP sent successfully' });

  } catch (err) {
    console.error('Send OTP Error:', err);
    res.status(500).json({ message: 'Failed to send OTP' });
  }
});

// POST /api/verify-otp
router.post('/verify-otp', async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) return res.status(400).json({ message: 'Email and OTP are required' });

  try {
    const record = await Otp.findOne({ email, otp });
    if (!record) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // OTP is valid
    // Ideally, we might want to delete it now so it can't be reused
    await Otp.deleteOne({ _id: record._id });

    // Check if subscriber exists, if not, create one (similar to original subscribe flow)
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