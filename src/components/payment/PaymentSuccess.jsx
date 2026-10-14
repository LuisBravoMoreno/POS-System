import { CheckCircle2, Printer, Check, ArrowLeft } from "lucide-react";
import "./PaymentSuccess.css";

export default function PaymentSuccess({
  paymentResult,
  orderNumber,
  tableNumber,
  onDone,
  onPrintReceipt,
}) {
  if (!paymentResult) return null;

  const {
    amount_paid,
    amount_received,
    change_amount,
    remaining_balance,
    order_status,
  } = paymentResult;

  const isOrderClosed = order_status === "closed";

  const money = (value) => {
    return `$${Number(value || 0).toFixed(2)}`;
  };

  return (
    <div className="led-success-overlay">
      <div className="led-success-modal">

        {/* HEADER */}
        <div className="led-success-header">
          <span>▣ L-ED System</span>
        </div>

        {/* CONTENT */}
        <div className="led-success-content">

          <div className="led-success-icon">
            <CheckCircle2 size={48} />
          </div>

          <h2>Payment Successful!</h2>

          <p className="led-success-order">
            Order #{orderNumber} · Table {tableNumber}
          </p>

          <span className="led-success-status">
            Payment completed
          </span>

          {/* PAYMENT DETAILS */}
          <div className="led-success-details">

            <div className="led-success-row">
              <span>Payment Method</span>
              <strong>Cash</strong>
            </div>

            <div className="led-success-row">
              <span>Amount Paid</span>
              <strong>{money(amount_paid)}</strong>
            </div>

            <div className="led-success-row">
              <span>Amount Received</span>
              <strong>{money(amount_received)}</strong>
            </div>

            <div className="led-success-divider" />

            <div className="led-success-row">
              <strong>Change</strong>
              <strong className="led-success-change">
                {money(change_amount)}
              </strong>
            </div>

          </div>

          {/* REMAINING BALANCE */}
          <div className="led-success-balance">
            <strong>Remaining Balance</strong>
            <strong>{money(remaining_balance)}</strong>
          </div>

          {/* ACTIONS */}
          <div className="led-success-actions">

            <button
              type="button"
              className="led-success-print"
              onClick={onPrintReceipt}
              disabled={!onPrintReceipt}
            >
              <Printer size={18} />
              Print Receipt
            </button>

            <button
              type="button"
              className="led-success-done"
              onClick={onDone}
            >
              {isOrderClosed ? (
                <>
                  <Check size={18} />
                  Done
                </>
              ) : (
                <>
                  <ArrowLeft size={18} />
                  Continue Order
                </>
              )}
            </button>

          </div>

        </div>
      </div>
    </div>
  );
}