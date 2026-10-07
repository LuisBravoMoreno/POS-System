import {
  ArrowLeft,
  Send,
  CreditCard,
  Ban,
} from "lucide-react";

export default function NavigationButtons({
  showCategories,
  onCategories,
  onTables,
  onSendOrder,
  canSendOrder,
  onPayment,
  onCancelOrder,
}) {

  return (
    <div className="navigation-buttons">

      {/* =========================
          SEND ORDER
      ========================= */}

      <button
        className="send-order-button"
        onClick={onSendOrder}
        disabled={!canSendOrder}
      >
        <Send size={19} />
        Send Order
      </button>


      {/* =========================
          PAYMENT
      ========================= */}

      <button
        className="payment-button"
        onClick={onPayment}
      >
        <CreditCard size={19} />
        Payment
      </button>
      
      {/* =========================
          CANCEL ORDER
      ========================= */}

      <button
        className="cancel-order-button"
        onClick={onCancelOrder}
      >
        <Ban size={19} />
        Cancel Order
      </button> 

      {/* =========================
          BACK BUTTON
      ========================= */}

      <button
        className="back-button"
        onClick={
          showCategories
            ? onCategories
            : onTables
        }
      >
        <ArrowLeft size={20} />

        {showCategories
          ? "Categories"
          : "Tables"}
      </button>

    </div>
  );
}