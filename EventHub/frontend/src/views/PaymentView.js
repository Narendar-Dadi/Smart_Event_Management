import React, { useState } from "react";
import { motion } from "framer-motion";
import { Activity, CreditCard, Shield } from "lucide-react";
import { api, loadRazorpayScript } from "../api/client";

export default function PaymentView({
  event,
  user,
  paymentConfig,
  onSuccess,
  onCancel,
  showToast
}) {
  const [processing, setProcessing] = useState(false);
  const platformFee = paymentConfig?.platformFee ?? 20;
  const totalAmount = event.fee > 0 ? event.fee + platformFee : 0;

  const handleFreeRegistration = async () => {
    setProcessing(true);
    try {
      const data = await api.registerFree(event.id);
      showToast("Registration successful!", "success");
      onSuccess(data.ticket);
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setProcessing(false);
    }
  };

  const handlePaidRegistration = async () => {
    if (!paymentConfig?.configured) {
      showToast(
        "Razorpay is not configured. Add keys to backend/.env or Payment Settings.",
        "error"
      );
      return;
    }

    setProcessing(true);
    try {
      const scriptOk = await loadRazorpayScript();
      if (!scriptOk || !window.Razorpay) {
        showToast("Could not load Razorpay checkout.", "error");
        return;
      }

      const order = await api.createPaymentOrder({ eventId: event.id });

      const options = {
        key: order.keyId,
        amount: order.amount * 100,
        currency: order.currency,
        name: "EventHub",
        description: event.title,
        order_id: order.orderId,
        handler: async (response) => {
          try {
            const verified = await api.verifyPayment({
              eventId: event.id,
              paymentId: response.razorpay_payment_id,
              orderId: response.razorpay_order_id,
              signature: response.razorpay_signature
            });
            showToast("Payment verified & ticket generated.", "success");
            onSuccess(verified.ticket);
          } catch (err) {
            showToast(err.message, "error");
          }
        },
        modal: {
          ondismiss: () => setProcessing(false)
        },
        theme: { color: "#2563eb" }
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", () => {
        showToast("Payment failed. Please try again.", "error");
        setProcessing(false);
      });
      rzp.open();
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setProcessing(false);
    }
  };

  const handlePayment = () => {
    if (totalAmount === 0) handleFreeRegistration();
    else handlePaidRegistration();
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-20">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden"
      >
        {processing && (
          <div className="absolute inset-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              className="mb-4"
            >
              <Activity size={40} className="text-blue-600" />
            </motion.div>
            <h3 className="text-lg font-bold">Processing...</h3>
            <p className="text-sm text-slate-500">Please do not close this window.</p>
          </div>
        )}

        <div className="text-center mb-8">
          <div className="inline-flex w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full items-center justify-center mb-4">
            <CreditCard size={32} className="text-blue-600 dark:text-blue-400" />
          </div>
          <h2 className="text-2xl font-bold">Complete Registration</h2>
          <p className="text-slate-500">Secure checkout for {event.title}</p>
        </div>

        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 mb-8 border border-slate-100 dark:border-slate-800">
          <div className="flex justify-between mb-4 pb-4 border-b border-slate-200 dark:border-slate-700">
            <span className="text-slate-500">Ticket Price</span>
            <span className="font-semibold">₹{event.fee}</span>
          </div>
          <div className="flex justify-between mb-4 pb-4 border-b border-slate-200 dark:border-slate-700">
            <span className="text-slate-500">Platform Fee</span>
            <span className="font-semibold">₹{event.fee > 0 ? platformFee : 0}</span>
          </div>
          <div className="flex justify-between text-xl font-bold">
            <span>Total Pay</span>
            <span>₹{totalAmount}</span>
          </div>
        </div>

        {!paymentConfig?.configured && totalAmount > 0 && (
          <p className="text-amber-600 dark:text-amber-400 text-sm mb-4 text-center">
            Razorpay keys are not set yet. Add them in backend/.env or Admin → Payment Settings.
          </p>
        )}

        <div className="space-y-4">
          <button
            onClick={handlePayment}
            disabled={processing || (totalAmount > 0 && !paymentConfig?.configured)}
            className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold text-lg hover:bg-blue-700 transition-colors flex justify-center items-center gap-2 shadow-lg shadow-blue-500/30 disabled:opacity-50"
          >
            {totalAmount === 0
              ? "Confirm Free Registration"
              : `Pay ${paymentConfig?.currency || "INR"} ${totalAmount} with Razorpay`}
          </button>
          <button
            onClick={onCancel}
            disabled={processing}
            className="w-full py-4 bg-transparent text-slate-500 hover:text-slate-800 dark:hover:text-white font-medium rounded-xl transition-colors"
          >
            Cancel
          </button>
        </div>

        <div className="mt-8 text-center flex items-center justify-center gap-2 text-xs text-slate-400">
          <Shield size={14} /> Secured by Razorpay
        </div>
      </motion.div>
    </div>
  );
}
