const puppeteer = require('puppeteer');
const Event = require('../models/Event');

const EVENTBRITE_URL = 'https://www.eventbrite.com/d/australia--sydney/all-events/';
const MEETUP_URL = 'https://www.meetup.com/find/?location=au--Sydney&source=EVENTS';

const upsertEvents = async (events) => {
    let count = 0;
    for (const eventData of events) {
        if (!eventData.title || !eventData.originalUrl) continue;

        await Event.findOneAndUpdate(
            { originalUrl: eventData.originalUrl },
            eventData,
            { upsert: true, new: true }
        );
        count++;
    }
    return count;
};

const scrapeWithConfig = async ({ url, organizer, evaluatePage }) => {
    let browser;
    try {
        browser = await puppeteer.launch({
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
        });
        const page = await browser.newPage();
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 120000 });

        const rawEvents = await page.evaluate(evaluatePage);

        const events = rawEvents
            .map((e) => ({
                ...e,
                organizer,
            }))
            .filter((e) => e && e.title && e.originalUrl);

        console.log(`Found ${events.length} events on ${organizer}.`);
        const upserted = await upsertEvents(events);
        console.log(`Upserted ${upserted} events from ${organizer}.`);
    } catch (err) {
        console.error(`Scrape job failed for ${organizer}:`, err);
    } finally {
        if (browser) await browser.close();
    }
};

const scrapeEvents = async () => {
    console.log('Starting scrape job for Eventbrite and Meetup...');

    await scrapeWithConfig({
        url: EVENTBRITE_URL,
        organizer: 'Eventbrite',
        evaluatePage: () => {
            const cards = document.querySelectorAll('[data-testid="search-event"]');
            return Array.from(cards).map((card) => {
                const linkEl = card.querySelector('a.event-card-link');
                const imgEl = card.querySelector('[data-testid="event-card-image-container"] img');
                const titleEl = card.querySelector('.event-card-details h3');

                const detailPs = Array.from(card.querySelectorAll('.event-card-details p'));
                const dateEl = detailPs[1] || null; // skip urgency text, take the first date line
                const locationEl = detailPs[2] || null; // usually "City · Venue"

                // Try to infer organizer from the last bold line in the details block
                let organizer = null;
                if (detailPs.length) {
                    const boldPs = detailPs.filter((p) =>
                        p.className.includes('Typography_body-md-bold')
                    );
                    if (boldPs.length) {
                        const lastBold = boldPs[boldPs.length - 1];
                        const text = lastBold.textContent.trim();
                        if (!text.startsWith('From ') && !text.toLowerCase().includes('today')) {
                            organizer = text;
                        }
                    }
                }

                return {
                    title: titleEl ? titleEl.textContent.trim() : null,
                    originalUrl: linkEl ? linkEl.href : null,
                    imageUrl: imgEl ? imgEl.src : null,
                    date: dateEl ? dateEl.textContent.trim() : null,
                    location: locationEl ? locationEl.textContent.trim() : null,
                    description: null,
                    organizer: organizer || 'Eventbrite',
                };
            });
        },
    });

    await scrapeWithConfig({
        url: MEETUP_URL,
        organizer: 'Meetup',
        evaluatePage: () => {
            const cards = document.querySelectorAll('[data-testid="categoryResults-eventCard"]');
            return Array.from(cards).map((card) => {
                const linkEl = card.querySelector('a[data-event-label="Event Card"]');
                const titleEl = card.querySelector('h3[title]');
                const timeEl = card.querySelector('time');
                const imgEl = card.querySelector('img');

                // Organizer line looks like: "by Sydney Business Growth Accelerator"
                const organizerLine = card.querySelector('div.ds2-r14.mt-ds2-2 div.flex-shrink.min-w-0.truncate');
                let organizer = organizerLine ? organizerLine.textContent.trim() : null;
                if (organizer && organizer.toLowerCase().startsWith('by ')) {
                    organizer = organizer.slice(3).trim();
                }

                // Location / online badge (e.g. "Online")
                const badgeEl = card.querySelector('div.inline-flex.rounded-ds2-max span.truncate');
                const location = badgeEl ? badgeEl.textContent.trim() : null;

                // Short description is not explicit in the card; leave null for now

                return {
                    title: titleEl ? titleEl.textContent.trim() : null,
                    originalUrl: linkEl ? linkEl.href : null,
                    imageUrl: imgEl ? imgEl.src : null,
                    date: timeEl ? timeEl.textContent.trim() : null,
                    location,
                    description: null,
                };
            });
        },
    });

    console.log('Scrape job completed for all sources.');
};

module.exports = scrapeEvents;