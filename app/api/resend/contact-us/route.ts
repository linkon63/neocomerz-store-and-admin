import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY || 're_dummy_key');
const fromEmail = process.env.RESEND_FROM_EMAIL;
const toEmail = process.env.RESEND_TO_EMAIL;

const requiredFields = ['firstName', 'lastName', 'phoneNumber', 'message'];

export async function POST(request: Request) {
    try {
        const body = await request.json();

        if (!fromEmail || !toEmail || !process.env.RESEND_API_KEY) {
            return NextResponse.json({ success: false, message: 'Configuration Error' }, { status: 500 });
        }

        for (const field of requiredFields) {
            if (!body[field] || !String(body[field]).trim()) {
                return NextResponse.json({ success: false, message: `${field} is required` }, { status: 400 });
            }
        }

        const { error } = await resend.emails.send({
            from: `London Tea Exchange <${fromEmail}>`,
            to: [toEmail],
            subject: 'New Contact Inquiry From London Tea Exchange Website',
            html: `
                <div style="font-family: sans-serif; line-height: 1.6; color: #333;">
                    <h1 style="color: #000;">New Contact Inquiry From London Tea Exchange Website</h1>
                    <p>Someone just submitted a contact inquiry!</p>
                    <table style="border-collapse: collapse; width: 100%;">
                        <tr><td style="padding: 6px 12px; border: 1px solid #ddd;"><b>First Name</b></td><td style="padding: 6px 12px; border: 1px solid #ddd;">${body.firstName}</td></tr>
                        <tr><td style="padding: 6px 12px; border: 1px solid #ddd;"><b>Last Name</b></td><td style="padding: 6px 12px; border: 1px solid #ddd;">${body.lastName}</td></tr>
                        <tr><td style="padding: 6px 12px; border: 1px solid #ddd;"><b>Phone</b></td><td style="padding: 6px 12px; border: 1px solid #ddd;">${body.countryCode || ''}${body.phoneNumber}</td></tr>
                        <tr><td style="padding: 6px 12px; border: 1px solid #ddd;"><b>Message</b></td><td style="padding: 6px 12px; border: 1px solid #ddd;">${body.message}</td></tr>
                    </table>
                </div>
            `,
        });

        if (error) {
            return NextResponse.json({ success: false, message: error.message }, { status: 400 });
        }

        return NextResponse.json({ success: true, message: 'Contact inquiry submitted successfully!' }, { status: 200 });

    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
