const Stripe = require("stripe");

const stripeSecret = process.env.STRIPE_SECRET_KEY || "";
const stripe = stripeSecret ? new Stripe(stripeSecret) : null;

async function createPaymentIntent({ amount, currency = "inr", metadata = {} }) {
  if (!stripe) {
    return {
      mock: true,
      clientSecret: "mock_client_secret",
      amount,
      currency,
      metadata
    };
  }

  const intent = await stripe.paymentIntents.create({
    amount,
    currency,
    metadata
  });

  return {
    mock: false,
    clientSecret: intent.client_secret,
    amount: intent.amount,
    currency: intent.currency,
    id: intent.id
  };
}

module.exports = { createPaymentIntent };
