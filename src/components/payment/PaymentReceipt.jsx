import { Printer, ArrowLeft } from "lucide-react";
import "./PaymentReceipt.css";

export default function PaymentReceipt({
  paymentResult,
  orderNumber,
  tableNumber,
  restaurantName = "RESIDENTE",
  onBack,
}) {
  if (!paymentResult) return null;

  const money = (value) =>
    `$${Number(value ?? 0).toFixed(2)}`;

  const {
    payment_id,
    amount_paid,
    amount_received,
    change_amount,
    remaining_balance,
    payment_method,
  } = paymentResult;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="led-receipt-overlay">
      <div className="led-receipt-modal">

        <div className="led-receipt-header">
          <h2>Payment Receipt</h2>
        </div>

        <div className="led-receipt-paper" id="payment-receipt">

          <div className="led-receipt-brand">
            <h2>L-ED System</h2>
            <strong>{restaurantName}</strong>
            <p>Payment Receipt</p>
          </div>

          <div className="led-receipt-divider" />

          <div className="led-receipt-row">
            <span>Order</span>
            <strong>#{orderNumber}</strong>
          </div>

          <div className="led-receipt-row">
            <span>Table</span>
            <strong>{tableNumber}</strong>
          </div>

          <div className="led-receipt-row">
            <span>Transaction</span>
            <strong>#{payment_id}</strong>
          </div>

          <div className="led-receipt-row">
            <span>Payment Method</span>
            <strong>
              {payment_method === "cash" ? "Cash" : "Card"}
            </strong>
          </div>

          <div className="led-receipt-divider" />

          <div className="led-receipt-row">
            <span>Amount Paid</span>
            <strong>{money(amount_paid)}</strong>
          </div>

          <div className="led-receipt-row">
            <span>Amount Received</span>
            <strong>{money(amount_received)}</strong>
          </div>

          <div className="led-receipt-row">
            <span>Change</span>
            <strong>{money(change_amount)}</strong>
          </div>

          <div className="led-receipt-divider" />

          <div className="led-receipt-row led-receipt-total">
            <span>Remaining Balance</span>
            <strong>{money(remaining_balance)}</strong>
          </div>

          <p className="led-receipt-thanks">
            Thank you for your visit!
          </p>

        </div>

        <div className="led-receipt-actions">
          <button
            type="button"
            className="led-receipt-back"
            onClick={onBack}
          >
            <ArrowLeft size={18} />
            Back
          </button>

          <button
            type="button"
            className="led-receipt-print"
            onClick={handlePrint}
          >
            <Printer size={18} />
            Print Receipt
          </button>
        </div>

      </div>
    </div>
  );
}