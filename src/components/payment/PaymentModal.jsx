import { useRef, useState } from "react";

import {
  X,
  Users,
  Banknote,
  CreditCard,
  ArrowLeft,
  CheckCircle2,
  Delete,
} from "lucide-react";

import "./PaymentModal.css";

const API_URL = "http://127.0.0.1:8000";

const cents = (value) => Math.round(Number(value) * 100);

const money = (value) => `$${Number(value).toFixed(2)}`;

export default function PaymentModal({
  orderData,
  onClose,
  onPaymentSuccess,
}) {
  const [tipPercent, setTipPercent] = useState(0);
  const [customTip, setCustomTip] = useState("");
  const [paymentMethod, setPaymentMethod] = useState(null);

  const [amountToPay, setAmountToPay] = useState(() =>
    Number(
      orderData.remaining_balance ?? orderData.total ?? 0
    ).toFixed(2)
  );

  const [amountReceived, setAmountReceived] = useState("");
  const [activeField, setActiveField] = useState("received");

  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentError, setPaymentError] = useState("");

  const submittedRef = useRef(false);

  // ==========================================
  // ORDER INFORMATION
  // ==========================================

  const order = orderData.order;
  const guests = orderData.guests || [];

  const subtotal = Number(orderData.subtotal || 0);
  const tax = Number(orderData.tax || 0);
  const backendTip = Number(orderData.tip || 0);
  const backendTotal = Number(orderData.total || 0);

  const paidAmount = Number(orderData.paid_amount || 0);

  const remainingBalance = Number(
    orderData.remaining_balance ?? backendTotal
  );

  // ==========================================
  // TIP SELECTION
  // Visual only until backend integration
  // ==========================================

  const selectedTip =
    tipPercent === "custom"
      ? Math.max(0, Number(customTip) || 0)
      : Math.round(subtotal * Number(tipPercent)) / 100;

  // ==========================================
  // CASH PAYMENT CALCULATIONS
  // ==========================================

  const payCents = cents(amountToPay);
  const receivedCents = cents(amountReceived);
  const balanceCents = cents(remainingBalance);

  const change =
    Math.max(0, receivedCents - payCents) / 100;

  const validPayment =
    amountToPay.trim() !== "" &&
    amountReceived.trim() !== "" &&
    Number.isFinite(Number(amountToPay)) &&
    Number.isFinite(Number(amountReceived)) &&
    payCents > 0 &&
    payCents <= balanceCents &&
    receivedCents >= payCents &&
    selectedTip === 0;

  // ==========================================
  // GUEST TOTAL
  // ==========================================

  const guestTotal = (guest) =>
    (guest.items || [])
      .filter((item) => item.status === "sent")
      .reduce(
        (sum, item) =>
          sum +
          Number(item.unit_price) *
            Number(item.quantity),
        0
      );

  // ==========================================
  // PAYMENT METHOD
  // ==========================================

  const chooseMethod = (method) => {
    setPaymentMethod(method);
    setAmountReceived("");
    setPaymentError("");
    setActiveField("received");
  };

  // ==========================================
  // NUMERIC KEYPAD
  // ==========================================

  const handleKeypad = (key) => {
    if (paymentLoading || submittedRef.current) return;

    const value =
      activeField === "pay"
        ? amountToPay
        : amountReceived;

    const setter =
      activeField === "pay"
        ? setAmountToPay
        : setAmountReceived;

    if (key === "clear") {
      setter("");
      return;
    }

    if (key === "delete") {
      setter(value.slice(0, -1));
      return;
    }

    if (key === ".") {
      if (!value.includes(".")) {
        setter(`${value || "0"}.`);
      }
      return;
    }

    if (!/^\d$/.test(key)) return;

    if (
      value.includes(".") &&
      value.split(".")[1].length >= 2
    ) {
      return;
    }

    setter(value === "0" ? key : value + key);
  };

  // ==========================================
  // CONFIRM CASH PAYMENT
  // ==========================================

  const confirmCashPayment = async () => {
    if (
      !validPayment ||
      paymentLoading ||
      submittedRef.current
    ) {
      return;
    }

    submittedRef.current = true;
    setPaymentLoading(true);
    setPaymentError("");

    let requestStarted = false;
    let paymentConfirmed = false;

    try {
      requestStarted = true;

      const response = await fetch(
        `${API_URL}/orders/${order.id}/payments/cash`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            amount_to_pay: payCents / 100,
            amount_received: receivedCents / 100,
          }),
        }
      );

      if (!response.ok) {
        const payload = await response
          .json()
          .catch(() => ({}));

        throw new Error(
          typeof payload.detail === "string"
            ? payload.detail
            : `Payment failed (HTTP ${response.status}).`
        );
      }

      const result = await response.json();

      paymentConfirmed = true;

      // Payment is already recorded in PostgreSQL.
      // MenuScreen handles refreshing or closing the order.
      await onPaymentSuccess(result);

    } catch (error) {
      console.error("Cash payment:", error);

      if (paymentConfirmed) {
        setPaymentError(
          "Payment was recorded, but the screen could not be refreshed. Check the order before continuing."
        );

      } else if (requestStarted && error instanceof TypeError) {
        setPaymentError(
          "Connection interrupted. Verify the order's payments before attempting another charge."
        );

      } else {
        setPaymentError(
          error.message ||
          "Could not confirm payment. Verify the order before retrying."
        );

        // Explicit server rejection can be corrected and retried.
        if (
          !requestStarted ||
          !(error instanceof TypeError)
        ) {
          submittedRef.current = false;
        }
      }

    } finally {
      setPaymentLoading(false);
    }
  };

  // ==========================================
  // PAYMENT MODAL
  // ==========================================

  return (
    <div className="led-payment-overlay">
      <div
        className="led-payment-modal"
        role="dialog"
        aria-modal="true"
        aria-label="Order payment"
      >
        {/* HEADER */}
        <header className="led-payment-header">
          <div className="led-payment-brand">
            <CreditCard size={21} />
            <strong>L-ED System</strong>
          </div>

          <button
            type="button"
            className="led-icon-button"
            onClick={onClose}
            disabled={paymentLoading}
            aria-label="Close payment"
          >
            <X size={22} />
          </button>
        </header>

        <div className="led-payment-content">
          {/* TITLE */}
          <div className="led-payment-title">
            <h2>Payment · Order #{order.id}</h2>

            <p>
              Table {order.table_number} ·{" "}
              {order.guest_count} Guests
            </p>
          </div>

          <div className="led-payment-columns">
            {/* =====================================
                LEFT COLUMN - ORDER DETAILS
            ===================================== */}

            <section className="led-payment-guests">
              <h3>Order Details</h3>

              <div className="led-guest-scroll">
                {guests.map((guest) => (
                  <div
                    className="led-guest-card"
                    key={guest.id}
                  >
                    <div className="led-guest-heading">
                      <strong>
                        Guest {guest.guest_number}
                      </strong>

                      <strong>
                        {money(guestTotal(guest))}
                      </strong>
                    </div>

                    {(guest.items || [])
                      .filter(
                        (item) => item.status === "sent"
                      )
                      .map((item) => (
                        <div
                          className="led-item-row"
                          key={item.id}
                        >
                          <span>
                            {item.quantity} ×{" "}
                            {item.product_name}
                          </span>

                          <span>
                            {money(
                              Number(item.quantity) *
                                Number(item.unit_price)
                            )}
                          </span>
                        </div>
                      ))}
                  </div>
                ))}
              </div>
            </section>

            {/* =====================================
                RIGHT COLUMN - PAYMENT
            ===================================== */}

            <section className="led-payment-right">
              {/* PAYMENT SUMMARY */}
              <div className="led-payment-summary">
                <h3>Payment Summary</h3>

                <div className="led-summary-row">
                  <span>Subtotal</span>
                  <strong>{money(subtotal)}</strong>
                </div>

                <div className="led-summary-row">
                  <span>Tax</span>
                  <strong>{money(tax)}</strong>
                </div>

                <div className="led-summary-row">
                  <span>Tip (included)</span>
                  <strong>{money(backendTip)}</strong>
                </div>

                {/* TIP OPTIONS */}
                {!paymentMethod && (
                  <>
                    <h4>Add a Tip (optional)</h4>

                    <div className="led-tip-options">
                      {[0, 10, 15, 20, "custom"].map(
                        (value) => (
                          <button
                            type="button"
                            key={value}
                            className={
                              tipPercent === value
                                ? "selected"
                                : ""
                            }
                            onClick={() =>
                              setTipPercent(value)
                            }
                          >
                            {value === "custom"
                              ? "Custom"
                              : `${value}%`}
                          </button>
                        )
                      )}
                    </div>

                    {tipPercent === "custom" && (
                      <label className="led-custom-tip">
                        Tip amount ($)

                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={customTip}
                          onChange={(e) =>
                            setCustomTip(e.target.value)
                          }
                        />
                      </label>
                    )}

                    <div className="led-summary-row">
                      <span>Tip (selected)</span>
                      <strong>
                        {money(selectedTip)}
                      </strong>
                    </div>

                    {selectedTip !== backendTip && (
                      <p className="led-card-notice">
                        Tip selection is not included
                        in the payment total yet.
                      </p>
                    )}
                  </>
                )}

                {/* TOTAL */}
                <div className="led-summary-total">
                  <strong>Total</strong>
                  <strong>
                    {money(backendTotal)}
                  </strong>
                </div>

                {/* PAID */}
                <div className="led-summary-row">
                  <span>Paid</span>
                  <strong>
                    {money(paidAmount)}
                  </strong>
                </div>

                {/* REMAINING */}
                <div className="led-summary-total led-remaining">
                  <strong>Remaining Balance</strong>
                  <strong>
                    {money(remainingBalance)}
                  </strong>
                </div>
              </div>

              {/* =====================================
                  PAYMENT METHOD SELECTION
              ===================================== */}

              {!paymentMethod ? (
                <div className="led-payment-actions">
                  <button
                    type="button"
                    className="led-split-button"
                    disabled
                    title="Coming soon"
                  >
                    <Users size={18} />
                    Split Check
                  </button>

                  <button
                    type="button"
                    className="led-cash-button"
                    onClick={() =>
                      chooseMethod("cash")
                    }
                  >
                    <Banknote size={18} />
                    Cash
                  </button>

                  <button
                    type="button"
                    className="led-card-button"
                    onClick={() =>
                      chooseMethod("card")
                    }
                  >
                    <CreditCard size={18} />
                    Card
                  </button>
                </div>
              ) : (
                <div className="led-cash-panel">
                  {/* BACK BUTTON */}
                  <button
                    type="button"
                    className="led-back-method"
                    onClick={() =>
                      setPaymentMethod(null)
                    }
                    disabled={
                      paymentLoading ||
                      submittedRef.current
                    }
                  >
                    <ArrowLeft size={17} />
                    Back to Payment
                  </button>

                  {/* =====================================
                      CASH PAYMENT
                  ===================================== */}

                  {paymentMethod === "cash" ? (
                    <>
                      <h3>
                        <Banknote size={18} />
                        {" "}Cash Payment
                      </h3>

                      <div className="led-cash-layout">
                        {/* CASH FIELDS */}
                        <div className="led-cash-fields">
                          {/* AMOUNT TO PAY */}
                          <div className="led-cash-field">
                            <label htmlFor="led-amount-to-pay">
                              Amount to Pay ($)
                            </label>

                            <input
                              id="led-amount-to-pay"
                              type="number"
                              min="0.01"
                              step="0.01"
                              value={amountToPay}
                              onFocus={() =>
                                setActiveField("pay")
                              }
                              onChange={(e) =>
                                setAmountToPay(
                                  e.target.value
                                )
                              }
                              disabled={
                                paymentLoading ||
                                submittedRef.current
                              }
                            />
                          </div>

                          {/* AMOUNT RECEIVED */}
                          <div className="led-cash-field">
                            <label htmlFor="led-amount-received">
                              Amount Received ($)
                            </label>

                            <input
                              id="led-amount-received"
                              type="number"
                              min="0"
                              step="0.01"
                              value={amountReceived}
                              placeholder="0.00"
                              onFocus={() =>
                                setActiveField("received")
                              }
                              onChange={(e) =>
                                setAmountReceived(
                                  e.target.value
                                )
                              }
                              disabled={
                                paymentLoading ||
                                submittedRef.current
                              }
                            />
                          </div>

                          {/* CHANGE */}
                          <div className="led-cash-change">
                            <span>Change</span>
                            <strong>
                              {money(change)}
                            </strong>
                          </div>
                        </div>

                        {/* =====================================
                            NUMERIC KEYPAD
                        ===================================== */}

                        <div
                          className="led-cash-keypad"
                          aria-label="Numeric keypad"
                        >
                          {[
                            "1", "2", "3",
                            "4", "5", "6",
                            "7", "8", "9",
                            "clear", "0", "delete",
                            ".",
                          ].map((key) => (
                            <button
                              type="button"
                              key={key}
                              disabled={
                                paymentLoading ||
                                submittedRef.current
                              }
                              onClick={() =>
                                handleKeypad(key)
                              }
                            >
                              {key === "clear"
                                ? "C"
                                : key === "delete"
                                ? <Delete size={16} />
                                : key}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* =====================================
                          VALIDATION MESSAGES
                      ===================================== */}

                      {selectedTip > 0 && (
                        <p className="led-warning">
                          Set the tip to 0% before
                          confirming. Tips are not
                          connected to the backend yet.
                        </p>
                      )}

                      {amountReceived !== "" &&
                        !validPayment &&
                        selectedTip === 0 && (
                          <p className="led-warning">
                            Amount to Pay must be
                            positive and no greater
                            than the remaining balance.
                            Amount Received must cover
                            Amount to Pay.
                          </p>
                        )}

                      {paymentError && (
                        <p
                          className="led-warning"
                          role="alert"
                        >
                          {paymentError}
                        </p>
                      )}

                      {/* CONFIRM CASH PAYMENT */}
                      <button
                        type="button"
                        className="led-confirm-cash"
                        disabled={
                          !validPayment ||
                          paymentLoading ||
                          submittedRef.current
                        }
                        onClick={
                          confirmCashPayment
                        }
                      >
                        <CheckCircle2 size={18} />

                        {paymentLoading
                          ? "Processing..."
                          : "Confirm Cash Payment"}
                      </button>
                    </>
                  ) : (
                    /* =====================================
                       CARD PAYMENT
                    ===================================== */

                    <p className="led-card-notice">
                      Card processing will be
                      connected to a payment
                      terminal in a future step.
                    </p>
                  )}
                </div>
              )}
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}