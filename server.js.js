const express = require('express');
const { Resend } = require('resend');
const twilio = require('twilio');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const resend = new Resend('re_gbw3YP1G_NumSTNtiNeJTBierQJZkEXmp');
const twilioClient = twilio('AC54fbc40f67b2ef22ed9e16b11980004e', 'ec9588fcb5f8a93cacde71c8f8856147');

// ─── Contact form endpoint ───────────────────────────────────────
app.post('/api/contact', async (req, res) => {
    const { name, phone, email, message } = req.body;

    if (!name || !phone || !email || !message) {
        return res.status(400).json({ error: 'All fields are required.' });
    }

    try {
        // Send email via Resend
        await resend.emails.send({
            from: 'GoTop Systems <onboarding@resend.dev>',
            to: 'kyllonenjake3@gmail.com',
            subject: `New Inquiry from ${name} — GoTop Systems Website`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
                    <h2 style="color: #0f172a; border-bottom: 3px solid #14b8a6; padding-bottom: 10px;">New Website Inquiry</h2>
                    <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
                        <tr style="background: #f8fafc;">
                            <td style="padding: 12px; font-weight: bold; color: #334155; width: 30%;">Name</td>
                            <td style="padding: 12px; color: #1e293b;">${name}</td>
                        </tr>
                        <tr>
                            <td style="padding: 12px; font-weight: bold; color: #334155;">Phone</td>
                            <td style="padding: 12px; color: #1e293b;"><a href="tel:${phone}" style="color: #14b8a6;">${phone}</a></td>
                        </tr>
                        <tr style="background: #f8fafc;">
                            <td style="padding: 12px; font-weight: bold; color: #334155;">Email</td>
                            <td style="padding: 12px; color: #1e293b;"><a href="mailto:${email}" style="color: #14b8a6;">${email}</a></td>
                        </tr>
                        <tr>
                            <td style="padding: 12px; font-weight: bold; color: #334155; vertical-align: top;">Message</td>
                            <td style="padding: 12px; color: #1e293b;">${message.replace(/\n/g, '<br>')}</td>
                        </tr>
                    </table>
                    <p style="margin-top: 24px; padding: 12px; background: #f0fdf4; border-left: 4px solid #14b8a6; color: #334155; border-radius: 4px;">
                        Submitted on ${new Date().toLocaleString('en-US', { timeZone: 'America/Chicago' })} (Chicago time)
                    </p>
                </div>
            `
        });

        // Send SMS via Twilio
        await twilioClient.messages.create({
            body: `📩 New GoTop inquiry!\nName: ${name}\nPhone: ${phone}\nEmail: ${email}\nMessage: ${message}`,
            from: '+16304267482',
            to: '+16303793695'
        });

        console.log(`[${new Date().toISOString()}] Form submitted by ${name} (${email}, ${phone})`);
        res.status(200).json({ success: true });
    } catch (err) {
        console.error('Error:', err.message);
        res.status(500).json({ error: 'Failed to send notification.' });
    }
});

// ─── Serve index.html for all other routes ───────────────────────
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`GoTop Systems server running on port ${PORT}`);
});
