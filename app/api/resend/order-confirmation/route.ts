import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import 'dotenv/config';

const resend = new Resend(process.env.RESEND_API_KEY || 're_dummy_key');
const fromEmail = process.env.RESEND_FROM_EMAIL;
const toEmail = process.env.RESEND_TO_EMAIL;

export async function POST(request: Request) {
    try {
        const body = await request.json();

        if (!fromEmail || !toEmail || !process.env.RESEND_API_KEY) {
            return NextResponse.json({ success: false, message: "Configuration Error" }, { status: 500 });
        }

        if (!body.orderNumber || !body.address?.fullName || !body.address?.email || !Array.isArray(body.items) || body.items.length === 0) {
            return NextResponse.json({ success: false, message: "Order information is incomplete" }, { status: 400 });
        }

        const { address, items } = body;
        const paymentMethod = body.paymentMethod || 'N/A';
        const orderNote = body.orderNote || 'N/A';

        const itemsHtml = items.map((item: any, index: number) => `
            <tr>
                <td style="padding: 6px 12px; border: 1px solid #ddd;">${index + 1}</td>
                <td style="padding: 6px 12px; border: 1px solid #ddd;">${item.name || 'N/A'}</td>
                <td style="padding: 6px 12px; border: 1px solid #ddd;">${item.quantity}</td>
                <td style="padding: 6px 12px; border: 1px solid #ddd;">৳${Number(item.price ?? 0).toFixed(2)}</td>
            </tr>
        `).join('');

        const { error } = await resend.emails.send({
            from: `London Tea Exchange <${fromEmail}>`,
            to: [toEmail],
            subject: 'New Order Placed From London Tea Exchange Website',
            html: `
                <div style="font-family: sans-serif; line-height: 1.6; color: #333;">
                    <h1 style="color: #000;">New Order Placed From London Tea Exchange Website</h1>
                    <p>Someone just placed a new order!</p>     
                    <h2 style="color: #000; font-size: 16px;">Order Summary</h2>
                    <table style="border-collapse: collapse; width: 100%;">
                        <tr><td style="padding: 6px 12px; border: 1px solid #ddd;"><b>Order Number</b></td><td style="padding: 6px 12px; border: 1px solid #ddd;">${body.orderNumber}</td></tr>
                        <tr><td style="padding: 6px 12px; border: 1px solid #ddd;"><b>Customer Name</b></td><td style="padding: 6px 12px; border: 1px solid #ddd;">${address.fullName}</td></tr>
                        <tr><td style="padding: 6px 12px; border: 1px solid #ddd;"><b>Email</b></td><td style="padding: 6px 12px; border: 1px solid #ddd;">${address.email}</td></tr>
                        <tr><td style="padding: 6px 12px; border: 1px solid #ddd;"><b>Phone</b></td><td style="padding: 6px 12px; border: 1px solid #ddd;">${address.phone || 'N/A'}</td></tr>
                        <tr><td style="padding: 6px 12px; border: 1px solid #ddd;"><b>Address</b></td><td style="padding: 6px 12px; border: 1px solid #ddd;">${address.addressLine1}${address.addressLine2 ? ', ' + address.addressLine2 : ''}, ${address.city}, ${address.state}, ${address.postalCode}, ${address.country}</td></tr>
                        <tr><td style="padding: 6px 12px; border: 1px solid #ddd;"><b>Payment Method</b></td><td style="padding: 6px 12px; border: 1px solid #ddd;">${paymentMethod}</td></tr>
                        <tr><td style="padding: 6px 12px; border: 1px solid #ddd;"><b>Order Note</b></td><td style="padding: 6px 12px; border: 1px solid #ddd;">${orderNote}</td></tr>
                    </table>
                    <h2 style="color: #000; font-size: 16px;">Items</h2>
                    <table style="border-collapse: collapse; width: 100%;">
                        <tr style="background: #f5f5f5;">
                            <th style="padding: 6px 12px; border: 1px solid #ddd; text-align: left;">#</th>
                            <th style="padding: 6px 12px; border: 1px solid #ddd; text-align: left;">Item</th>
                            <th style="padding: 6px 12px; border: 1px solid #ddd; text-align: left;">Qty</th>
                            <th style="padding: 6px 12px; border: 1px solid #ddd; text-align: left;">Price</th>
                        </tr>
                        ${itemsHtml}
                        <tr>
                            <td colspan="3" style="padding: 6px 12px; border: 1px solid #ddd; text-align: right;"><b>Total</b></td>
                            <td style="padding: 6px 12px; border: 1px solid #ddd;"><b>৳${Number(body.total ?? 0).toFixed(2)}</b></td>
                        </tr>
                    </table>
                </div>
            `,
        });

        if (error) {
            return NextResponse.json({ success: false, message: error.message }, { status: 400 });
        }

        return NextResponse.json({ success: true, message: "Order notification sent successfully!" }, { status: 200 });

    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
