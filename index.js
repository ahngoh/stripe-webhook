import express from "express";
import Stripe from "stripe";

const app = express();

/**
 * IMPORTANT RULES FOR STRIPE WEBHOOKS:
 * 1. Do NOT use express.json() before the webhook route
 * 2. Use express.raw() ONLY for /webhook
 * 3. Read secrets ONLY at runtime
 */

// Health check (GET is fine)
app.get("/", (req, res) => {
  res.status(200).send("Webhook server running");
});

// Webhook route — RAW body required
app.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  (req, res) => {
    let event;

    try {
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
        apiVersion: "2023-10-16",
      });

      const signature = req.headers["stripe-signature"];

      event = stripe.webhooks.constructEvent(
        req.body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.error("❌ Webhook verification failed:", err.message);
      return res.status(400).send("Webhook Error");
    }

    console.log("✅ Stripe event received:", event.type);

    // You can add logic here later
    // if (event.type === "checkout.session.completed") {}

    return res.sendStatus(200);
  }
);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server listening on port ${PORT}`);
});
