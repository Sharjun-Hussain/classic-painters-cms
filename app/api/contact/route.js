import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req) {
    try {
        const { name, email, phone, service, message } = await req.json();

        // Validate input
        if (!name || !email || !message) {
            return NextResponse.json(
                { error: 'Name, email, and message are required' },
                { status: 400 }
            );
        }

        // Create a transporter
        // NOTE: You need to configure these environment variables in your .env file
        const transporter = nodemailer.createTransport({
            host: process.env.EMAIL_SERVER_HOST,
            port: process.env.EMAIL_SERVER_PORT,
            auth: {
                user: process.env.EMAIL_SERVER_USER,
                pass: process.env.EMAIL_SERVER_PASSWORD,
            },
            secure: process.env.EMAIL_SERVER_PORT == 465, // true for 465, false for other ports
        });

        const mailOptions = {
            from: process.env.EMAIL_FROM || `"Classic Painters Contact" <${process.env.EMAIL_SERVER_USER}>`,
            to: process.env.CONTACT_EMAIL || process.env.EMAIL_SERVER_USER,
            subject: `New Quote Request from ${name} - ${service}`,
            text: `
                New Quote Request Details:
                -------------------------
                Name: ${name}
                Email: ${email}
                Phone: ${phone || 'N/A'}
                Service: ${service}
                
                Message:
                ${message}
            `,
            html: `
                <h3>New Quote Request Details</h3>
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Phone:</strong> ${phone || 'N/A'}</p>
                <p><strong>Service:</strong> ${service}</p>
                <br>
                <p><strong>Message:</strong></p>
                <p>${message.replace(/\n/g, '<br>')}</p>
            `,
        };

        // Send email
        await transporter.sendMail(mailOptions);

        return NextResponse.json({ message: 'Email sent successfully' }, { status: 200 });
    } catch (error) {
        console.error('Failed to send email:', error);
        return NextResponse.json(
            { error: 'Failed to send email', details: error.message },
            { status: 500 }
        );
    }
}
