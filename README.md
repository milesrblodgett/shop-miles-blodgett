# Shop Miles Blodgett

A single-page clothing brand storefront with Stripe Checkout integration, built for deployment on Netlify.

---

## Setup Guide

### 1. Get Your Stripe Keys

1. Create a free account at [stripe.com](https://stripe.com)
2. Go to **Developers → API keys** in your Stripe Dashboard
3. Copy your **Publishable key** (starts with `pk_test_`) — this goes in `js/main.js` if you ever need it (currently not required since we use server-side checkout)
4. Copy your **Secret key** (starts with `sk_test_`) — this goes in your Netlify environment variables (see step 4)
5. When you're ready to accept real payments, toggle from "Test mode" to "Live mode" and use the live keys

### 2. Set Up Resend for Email Notifications

1. Create a free account at [resend.com](https://resend.com) (100 emails/day on free tier)
2. Go to **API Keys** and create a new key
3. Copy the key (starts with `re_`) — this goes in your Netlify environment variables
4. **Note:** On the free plan, emails send from `onboarding@resend.dev`. To send from your own domain (e.g. `orders@milesblodgett.com`), add and verify your domain in Resend's dashboard, then update the `from` field in `netlify/functions/stripe-webhook.js`

### 3. Deploy to Netlify

1. Push this project to a GitHub repository
2. Go to [netlify.com](https://netlify.com) and click **"Add new site" → "Import an existing project"**
3. Connect your GitHub repo
4. Build settings will be auto-detected from `netlify.toml` — no changes needed
5. Click **Deploy**

### 4. Set Environment Variables in Netlify

1. In your Netlify site dashboard, go to **Site settings → Environment variables**
2. Add these three variables:

   | Key                    | Value                          |
   |------------------------|--------------------------------|
   | `STRIPE_SECRET_KEY`    | `sk_test_...` or `sk_live_...` |
   | `STRIPE_WEBHOOK_SECRET`| `whsec_...` (see step 5)       |
   | `RESEND_API_KEY`       | `re_...`                       |

3. Redeploy the site after adding variables

### 5. Register the Stripe Webhook

1. In your Stripe Dashboard, go to **Developers → Webhooks**
2. Click **"Add endpoint"**
3. Set the endpoint URL to: `https://YOUR-SITE.netlify.app/.netlify/functions/stripe-webhook`
4. Under "Events to send", select **`checkout.session.completed`**
5. Click **Add endpoint**
6. Copy the **Signing secret** (starts with `whsec_`) and add it as `STRIPE_WEBHOOK_SECRET` in Netlify (step 4)

### 6. Swap In Real Product Images

1. Replace the placeholder files in the `/images/` folder:
   - `make-friends-not-enemies-front.jpg` — front photo of the tee
   - `make-friends-not-enemies-back.jpg` — back photo of the tee
2. Use square or near-square images for best results (the card crops to 1:1)
3. Commit and push — Netlify will auto-redeploy

### 7. Connect a Custom Domain (Optional)

1. Buy a domain (Namecheap, Google Domains, Cloudflare, etc.)
2. In Netlify, go to **Site settings → Domain management → Add custom domain**
3. Follow Netlify's instructions to point your DNS to their servers
4. Netlify provides free HTTPS automatically

---

## Adding New Products

1. Open `index.html` and duplicate the `<div class="product-card">` block inside the products grid
2. Change the `data-product` attribute to your new product's slug
3. Update the image paths and text
4. Open `js/main.js` and add a new object to the `PRODUCTS` array with the matching `id`
5. Add front/back images to the `/images/` folder
6. In Stripe, you don't need to create products ahead of time — the checkout session creates them dynamically

---

## File Structure

```
shop-miles-blodgett/
├── index.html                          # Main storefront
├── success.html                        # Post-purchase thank-you page
├── css/styles.css                      # All styles (CSS variables at top)
├── js/main.js                          # Product modal, size selection, checkout
├── images/                             # Product photos
├── netlify/functions/
│   ├── create-checkout.js              # Creates Stripe Checkout session
│   └── stripe-webhook.js              # Handles payment confirmation emails
├── netlify.toml                        # Netlify config
├── package.json                        # Dependencies (stripe)
├── .env.example                        # Environment variable template
└── README.md                           # This file
```

## Testing

- Use Stripe's test card number: `4242 4242 4242 4242` with any future expiry and any CVC
- Check the Stripe Dashboard → Payments to see test transactions
- Check your Netlify function logs to debug webhook issues
