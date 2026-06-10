import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import 'dotenv/config';

const resend = new Resend(process.env.RESEND_API_KEY || 're_dummy_key');
const fromEmail = process.env.RESEND_FROM_EMAIL;
const toEmail = process.env.RESEND_TO_EMAIL;

export async function POST(request: Request) {
    try {
        const { email } = await request.json();

        if (!fromEmail || !toEmail || !process.env.RESEND_API_KEY) {
            return NextResponse.json({ success: false, message: "Configuration Error" }, { status: 500 });
        }

        if (!email) {
            return NextResponse.json({ success: false, message: "Email is required" }, { status: 400 });
        }

        const { data, error } = await resend.emails.send({
            from: fromEmail,
            to: [toEmail],
            subject: 'New Newsletter Subscription',
            html: `
                <div style="font-family: sans-serif; line-height: 1.6; color: #333;">
                    <h1 style="color: #000;">New Newsletter Subscriber</h1>
                    <p>Someone just subscribed to the newsletter!</p>
                    <p><b>Subscriber Email:</b> ${email}</p>
                </div>
            `,
        });

        if (error) {
            return NextResponse.json({ success: false, message: error.message }, { status: 400 });
        }

        return NextResponse.json({ success: true, message: "Subscribed Successfully!" }, { status: 200 });

    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}