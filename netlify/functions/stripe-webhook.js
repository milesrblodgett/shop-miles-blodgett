/* ================================================
   STRIPE WEBHOOK HANDLER
   Listens for "checkout.session.completed" events
   and emails the order details to the store owner.
   ================================================ */

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// TODO: Replace with your Resend API key in Netlify env vars (RESEND_API_KEY)
// Sign up at https://resend.com — free tier gives 100 emails/day
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const OWNER_EMAIL = 'milesrblodgett@gmail.com';

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' };
  }

  const sig = event.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let stripeEvent;

  try {
    // Verify the webhook signature to make sure it's really from Stripe
    stripeEvent = stripe.webhooks.constructEvent(event.body, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return { statusCode: 400, body: `Webhook Error: ${err.message}` };
  }

  // Only handle completed checkout sessions
  if (stripeEvent.type === 'checkout.session.completed') {
    const session = stripeEvent.data.object;

    // Pull out the order details
    const customerName = session.customer_details?.name || 'N/A';
    const customerEmail = session.customer_details?.email || 'N/A';
    const shipping = session.shipping_details?.address || {};
    const metadata = session.metadata || {};
    const amountTotal = (session.amount_total / 100).toFixed(2);

    const shippingAddress = [
      shipping.line1,
      shipping.line2,
      `${shipping.city}, ${shipping.state} ${shipping.postal_code}`,
      shipping.country,
    ].filter(Boolean).join('\n');

    // Build the email
    const emailBody = `
New Order from Shop Miles Blodgett!

CUSTOMER
Name: ${customerName}
Email: ${customerEmail}

ITEM
Product: ${metadata.product_name || 'N/A'}
Size: ${metadata.size || 'N/A'}
Amount Paid: $${amountTotal}

SHIPPING ADDRESS
${shippingAddress || 'No shipping address provided'}

---
Fulfill this order via Vistaprint and ship to the address above.
Stripe Payment ID: ${session.payment_intent}
    `.trim();

    // Send the email via Resend
    try {
      const emailResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          // TODO: Once you verify your domain in Resend, change the "from" to your domain
          // For now, use Resend's default onboarding sender
          from: 'Shop Miles Blodgett <onboarding@resend.dev>',
          to: [OWNER_EMAIL],
          subject: `New Order: ${metadata.product_name} (${metadata.size}) — $${amountTotal}`,
          text: emailBody,
        }),
      });

      if (!emailResponse.ok) {
        const errorData = await emailResponse.text();
        console.error('Resend API error:', errorData);
      } else {
        console.log('Order notification email sent successfully');
      }
    } catch (emailErr) {
      // Log but don't fail — the payment already went through
      console.error('Failed to send email:', emailErr);
    }
  }

  // Always return 200 to Stripe so it doesn't retry
  return { statusCode: 200, body: JSON.stringify({ received: true }) };
};
