require('dotenv').config();
const nodemailer = require('nodemailer');

async function verifyEmailConfig() {

    const user = process.env.EMAIL_USER;
    // Mask password for security in logs
    const pass = process.env.EMAIL_PASS ? '********' : '(not set)';

    if (!user || user.includes('your-email') || !process.env.EMAIL_PASS) {
        console.error('ERROR: Credentials look like placeholders or are missing.');
        console.error('Please update .env with real credentials.');
        return;
    }

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    try {
        console.log('Verifying connection...');
        await transporter.verify();
        console.log('SUCCESS: Connection verified! valid credentials.');

        console.log('Attempting to send test email...');
        const info = await transporter.sendMail({
            from: user,
            to: user, // Send to self
            subject: 'Test Email ' + new Date().toISOString(),
            text: 'This is a test email to verify configuration.'
        });
        console.log('SUCCESS: Email sent: ' + info.response);

    } catch (err) {
        console.error('FAILURE: Connection/Send failed.');
        console.error('Error Code:', err.code);
        console.error('Error Message:', err.message);
        if (err.response) console.error('SMTP Response:', err.response);
    }
}

verifyEmailConfig();