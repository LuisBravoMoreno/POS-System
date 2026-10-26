import { useState } from "react";
import { ShoppingBag, X } from "lucide-react";
import "./TakeoutOrderModal.css";

export default function TakeoutOrderModal({
  onClose,
  onContinue,
}) {
  const [customerName, setCustomerName] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();

    const name = customerName.trim();

    if (!name) {
      setError("Please enter the customer's name.");
      return;
    }

    setError("");
    onContinue(name);
  };

  return (
    <div className="takeout-modal-overlay">
      <div
        className="takeout-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="takeout-modal-title"
      >

        {/* CLOSE BUTTON */}
        <button
          type="button"
          className="takeout-modal-close"
          onClick={onClose}
          aria-label="Close modal"
        >
          <X size={22} />
        </button>

        {/* TAKEOUT ICON */}
        <div className="takeout-modal-icon">
          <ShoppingBag size={36} strokeWidth={1.8} />
        </div>

        {/* TITLE */}
        <h2 id="takeout-modal-title">
          New To Go Order
        </h2>

        <p className="takeout-modal-subtitle">
          Enter customer name
        </p>

        {/* CUSTOMER FORM */}
        <form onSubmit={handleSubmit}>

          <label
            className="takeout-modal-label"
            htmlFor="takeout-customer-name"
          >
            Customer Name
          </label>

          <input
            id="takeout-customer-name"
            type="text"
            value={customerName}
            onChange={(event) => {
              setCustomerName(event.target.value);
              setError("");
            }}
            placeholder="e.g. John Smith"
            maxLength={100}
            autoFocus
            aria-invalid={Boolean(error)}
          />

          {error && (
            <p className="takeout-modal-error">
              {error}
            </p>
          )}

          {/* ACTION BUTTONS */}
          <div className="takeout-modal-actions">

            <button
              type="button"
              className="takeout-cancel-button"
              onClick={onClose}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="takeout-continue-button"
            >
              Continue
            </button>

          </div>
        </form>

      </div>
    </div>
  );
}