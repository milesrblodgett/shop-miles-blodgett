/* ================================================
   CREATE STRIPE CHECKOUT SESSION
   This serverless function runs on Netlify.
   It creates a Stripe Checkout session and returns
   the URL so the frontend can redirect the customer.
   ================================================ */

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { PRODUCTS } = require('./lib/products');

exports.handler = async (event) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const { productId, size } = JSON.parse(event.body);

    // Validate the request
    if (!productId || !size) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing required fields' }),
      };
    }

    // Look up the product server-side. The price NEVER comes from the
    // browser — only the productId does — so a tampered request can't
    // change what the customer is charged.
    const product = PRODUCTS[productId];
    if (!product) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Unknown product' }),
      };
    }
    if (!product.sizes.includes(size)) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Invalid size' }),
      };
    }

    const productName = product.name;
    const price = product.price;

    // Build the site URL from the request headers
    const origin = `https://${event.headers.host}`;

    // Create the Stripe Checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      // Collect customer's shipping address (needed for fulfillment)
      shipping_address_collection: {
        allowed_countries: ['US'],
      },
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${productName} — Size ${size}`,
              description: `Shop Miles Blodgett | Size: ${size}`,
              metadata: {
                product_id: productId,
                size: size,
              },
            },
            unit_amount: price * 100, // Stripe uses cents
          },
          quantity: 1,
        },
      ],
      // Store the size and product ID in session metadata for the webhook
      metadata: {
        product_id: productId,
        product_name: productName,
        size: size,
      },
      // Redirect URLs after checkout
      success_url: `${origin}/success.html`,
      cancel_url: `${origin}/`,
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ url: session.url }),
    };
  } catch (err) {
    console.error('Stripe checkout error:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to create checkout session' }),
    };
  }
};
