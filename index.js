import express from "express";
import Stripe from "stripe";

const app = express();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

app.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  (req, res) => {
    const sig = req.headers["stripe-signature"];

    let event;
    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.error("❌ Webhook error:", err.message);
      return res.status(400).send("Webhook Error");
    }

    console.log("✅ Event received:", event.type);
    res.status(200).json({ received: true });
  }
);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`🚀 Webhook server listening on ${port}`);
});
