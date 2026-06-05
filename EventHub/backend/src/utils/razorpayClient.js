const Razorpay = require("razorpay");
const crypto = require("crypto");
const PaymentSettings = require("../models/paymentSettingsModel");

const PLATFORM_FEE = 20;

async function getPaymentConfig() {
  const fromEnv = {
    keyId: process.env.RAZORPAY_KEY_ID || "",
    secretKey: process.env.RAZORPAY_KEY_SECRET || "",
    currency: process.env.RAZORPAY_CURRENCY || "INR",
    mode: process.env.RAZORPAY_MODE || "test"
  };

  if (fromEnv.keyId && fromEnv.secretKey) {
    return fromEnv;
  }

  const doc = await PaymentSettings.findOne().sort({ updatedAt: -1 }).lean();
  if (!doc) return fromEnv;

  return {
    keyId: doc.keyId || fromEnv.keyId,
    secretKey: doc.secretKey || fromEnv.secretKey,
    currency: doc.currency || fromEnv.currency,
    mode: doc.mode || fromEnv.mode
  };
}

async function getRazorpayInstance() {
  const config = await getPaymentConfig();
  if (!config.keyId || !config.secretKey) {
    return { instance: null, config };
  }

  const instance = new Razorpay({
    key_id: config.keyId,
    key_secret: config.secretKey
  });

  return { instance, config };
}

function computeTotal(fee) {
  return fee > 0 ? fee + PLATFORM_FEE : 0;
}

function verifyPaymentSignature({ orderId, paymentId, signature, secretKey }) {
  const body = `${orderId}|${paymentId}`;
  const expected = crypto.createHmac("sha256", secretKey).update(body).digest("hex");
  return expected === signature;
}

module.exports = {
  PLATFORM_FEE,
  getPaymentConfig,
  getRazorpayInstance,
  computeTotal,
  verifyPaymentSignature
};
