const axios = require('axios');
const Event = require('../models/Event');
const Subscriber = require('../models/Subscriber');

/**
 * Calls Google Gemini's generateContent API to generate a reply
 * based on the user's message and the list of events in the database.
 *
 * Configure via env:
 * - GEMINI_API_KEY   (your Google AI Studio / Gemini API key)
 * - GEMINI_MODEL     (e.g. gemini-1.5-flash, gemini-1.5-pro, etc.)
 */
async function callLLM({ userMessage, events }) {
    const apiKey = process.env.GEMINI_API_KEY;
    const model = process.env.GEMINI_MODEL || 'gemini-1.5-flash';

    if (!apiKey) {
        console.warn('GEMINI_API_KEY is not set; falling back to simple echo response');
        return `You said: ${userMessage}\n\n(LLM is not configured yet, please set GEMINI_API_KEY in the backend .env.)`;
    }

    const systemPrompt = `You are an event assistant.
    Given a list of events, recommend appropriate ones to the user.
    
    FORMATTING RULES:
    - Use Markdown for all responses.
    - For each event recommendation, use this EXACT format:
      
      ### [Event Title]
      **Date:** [Date string]
      **Location:** [Location string]
      **Why:** [Short reason]
      [Click for Details]([URL]?eventId=[EVENT_ID])

    - Do NOT use "Title:", "URL:" labels textually. Use the format above.
    - Always include eventId parameter in the URL for proper tracking.
    - If suggesting multiple events, separate them with a horizontal rule (---).
    - Be concise.
    
    Rules:
    - Recommend only from the provided list.
    - If no match found, suggest a close alternative from the list.
    `;

    const eventsForPrompt = events.map((e) => ({
        id: e._id.toString(),
        title: e.title,
        date: e.date,
        location: e.location,
        description: e.description,
        organizer: e.organizer,
        url: e.originalUrl,
    }));

    const promptText =
        systemPrompt +
        '\n\nUser message: ' +
        userMessage +
        '\n\nHere is the list of available events as JSON array:\n' +
        JSON.stringify(eventsForPrompt, null, 2);

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const response = await axios.post(url, {
        contents: [
            {
                role: 'user',
                parts: [{ text: promptText }],
            },
        ],
    });

    const message =
        response.data &&
        response.data.candidates &&
        response.data.candidates[0] &&
        response.data.candidates[0].content &&
        response.data.candidates[0].content.parts &&
        response.data.candidates[0].content.parts[0] &&
        response.data.candidates[0].content.parts[0].text;

    return message || 'I could not generate a response at the moment.';
}

/**
 * Main entry from Telegram webhook.
 * telegramId is available for future personalization, but not yet used.
 */
async function handleUserMessage({ telegramId, text }) {
    // Fetch a reasonable number of recent events to show to the model
    // Here we just take the newest 20 by scrapedAt if available.
    const events = await Event.find({})
        .sort({ scrapedAt: -1 })
        .limit(20)
        .exec();

    if (!events || events.length === 0) {
        return 'I do not have any events in my database yet. Please try again after events have been scraped.';
    }

    try {
        const reply = await callLLM({ userMessage: text, events });
        return reply;
    } catch (err) {
        console.error('Error calling LLM:', err.message);
        return 'Something went wrong while generating a response. Please try again later.';
    }
}

module.exports = {
    handleUserMessage,
};