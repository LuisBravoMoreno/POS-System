import { useState } from "react";
import {
  X,
  Users,
  Banknote,
  CreditCard,
  ArrowLeft,
  CheckCircle2,
} from "lucide-react";

import "./PaymentModal.css";

export default function PaymentModal({
  orderData,
  onClose,
}) {
  const [tipPercent, setTipPercent] = useState(0);
  const [customTip, setCustomTip] = useState("");
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [amountReceived, setAmountReceived] = useState("");

  const order = orderData.order;
  const guests = orderData.guests || [];

  const subtotal = Number(orderData.subtotal || 0);
  const tax = Number(orderData.tax || 0);

  const tip = tipPercent === "custom"
    ? Math.max(0, Number(customTip) || 0)
    : Math.round(subtotal * Number(tipPercent)) / 100;

  const total = Math.round((subtotal + tax + tip) * 100) / 100;
  const received = Number(amountReceived || 0);
  const change = Math.max(0, received - total);

  const money = (value) => `$${Number(value).toFixed(2)}`;

  const guestTotal = (guest) =>
    guest.items
      .filter((item) => item.status === "sent")
      .reduce(
        (sum, item) =>
          sum + Number(item.unit_price) * item.quantity,
        0
      );

  const chooseMethod = (method) => {
    setPaymentMethod(method);
    setAmountReceived("");
  };

  return (
    <div className="led-payment-overlay">
      <div
        className="led-payment-modal"
        role="dialog"
        aria-modal="true"
        aria-label="Order payment"
      >
        <header className="led-payment-header">
          <div className="led-payment-brand">
            <CreditCard size={21} />
            <strong>L-ED System</strong>
          </div>
          <button
            className="led-icon-button"
            onClick={onClose}
            aria-label="Close payment"
          >
            <X size={22} />
          </button>
        </header>

        <div className="led-payment-content">
          <div className="led-payment-title">
            <h2>Payment · Order #{order.id}</h2>
            <p>
              Table {order.table_number} · {order.guest_count} Guests
            </p>
          </div>

          {!paymentMethod ? (
            <>
              <div className="led-payment-columns">
                <section className="led-payment-guests">
                  <h3>Order Details</h3>

                  {guests.map((guest) => (
                    <div className="led-guest-card" key={guest.id}>
                      <div className="led-guest-heading">
                        <strong>Guest {guest.guest_number}</strong>
                        <strong>{money(guestTotal(guest))}</strong>
                      </div>

                      {guest.items
                        .filter((item) => item.status === "sent")
                        .map((item) => (
                          <div className="led-item-row" key={item.id}>
                            <span>
                              {item.quantity} × {item.product_name}
                            </span>
                            <span>
                              {money(item.quantity * item.unit_price)}
                            </span>
                          </div>
                        ))}
                    </div>
                  ))}
                </section>

                <section className="led-payment-summary">
                  <h3>Payment Summary</h3>

                  <div className="led-summary-row">
                    <span>Subtotal</span>
                    <strong>{money(subtotal)}</strong>
                  </div>

                  <div className="led-summary-row">
                    <span>Tax</span>
                    <strong>{money(tax)}</strong>
                  </div>

                  <h4>Add a Tip (optional)</h4>

                  <div className="led-tip-options">
                    {[0, 10, 15, 20, "custom"].map((value) => (
                      <button
                        key={value}
                        className={tipPercent === value ? "selected" : ""}
                        onClick={() => setTipPercent(value)}
                      >
                        {value === "custom" ? "Custom" : `${value}%`}
                      </button>
                    ))}
                  </div>

                  {tipPercent === "custom" && (
                    <label className="led-custom-tip">
                      Tip amount ($)
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={customTip}
                        onChange={(e) => setCustomTip(e.target.value)}
                      />
                    </label>
                  )}

                  <div className="led-summary-row">
                    <span>Tip</span>
                    <strong>{money(tip)}</strong>
                  </div>

                  <div className="led-summary-total">
                    <strong>Total</strong>
                    <strong>{money(total)}</strong>
                  </div>
                </section>
              </div>

              <div className="led-payment-actions">
                <button
                  className="led-split-button"
                  disabled
                  title="Coming soon"
                >
                  <Users size={19} />
                  Split Check
                </button>

                <button
                  className="led-cash-button"
                  onClick={() => chooseMethod("cash")}
                >
                  <Banknote size={19} />
                  Cash
                </button>

                <button
                  className="led-card-button"
                  onClick={() => chooseMethod("card")}
                >
                  <CreditCard size={19} />
                  Card
                </button>
              </div>
            </>
          ) : (
            <section className="led-method-panel">
              <button
                className="led-back-method"
                onClick={() => setPaymentMethod(null)}
              >
                <ArrowLeft size={18} />
                Back to Payment
              </button>

              <h3>
                {paymentMethod === "cash"
                  ? "Cash Payment"
                  : "Card Payment"}
              </h3>

              <div className="led-summary-row">
                <span>Subtotal</span>
                <strong>{money(subtotal)}</strong>
              </div>
              <div className="led-summary-row">
                <span>Tax</span>
                <strong>{money(tax)}</strong>
              </div>
              <div className="led-summary-row">
                <span>Tip</span>
                <strong>{money(tip)}</strong>
              </div>
              <div className="led-summary-total">
                <strong>Total</strong>
                <strong>{money(total)}</strong>
              </div>

              {paymentMethod === "cash" ? (
                <>
                  <label className="led-custom-tip">
                    Amount Received ($)
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={amountReceived}
                      onChange={(e) =>
                        setAmountReceived(e.target.value)
                      }
                      placeholder="0.00"
                    />
                  </label>

                  <div className="led-summary-row">
                    <span>Change</span>
                    <strong className="led-change">
                      {money(change)}
                    </strong>
                  </div>
                  {amountReceived !== "" && received < total && (
                    <p className="led-warning">
                      Amount received is less than the total.
                    </p>
                  )}
                </>
              ) : (
                <p className="led-card-notice">
                  Card processing will be connected to a payment
                  terminal in a future step.
                </p>
              )}

              <div className="led-method-footer">
                <CheckCircle2 size={20} />
                <span>
                  Payment confirmation is not enabled yet.
                </span>
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}