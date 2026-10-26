import "./GuestModal.css";
import { X, Delete, Check } from "lucide-react";

export default function GuestModal({
  selectedTable,
  guestCount,
  addDigit,
  clearGuests,
  confirmGuests,
  onClose,
}) {
  return (
    <div className="modal-overlay">
      <div className="guest-modal">

        {/* CLOSE BUTTON */}
        <button
          type="button"
          className="guest-modal-close"
          onClick={onClose}
          aria-label="Close guest modal"
        >
          <X size={22} />
        </button>

        {/* TABLE NUMBER */}
        <h2>Table {selectedTable}</h2>

        <p>Number of Guests</p>

        {/* GUEST COUNTER */}
        <div className="guest-display">
          {guestCount || 0}
        </div>

        {/* NUMERIC KEYPAD */}
        <div className="keyboard">

          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button
              key={num}
              type="button"
              onClick={() => addDigit(num.toString())}
            >
              {num}
            </button>
          ))}

          {/* DELETE BUTTON */}
          <button
            type="button"
            className="key-delete"
            onClick={clearGuests}
            aria-label="Clear guests"
          >
            <Delete size={26} />
          </button>

          {/* ZERO BUTTON */}
          <button
            type="button"
            onClick={() => addDigit("0")}
          >
            0
          </button>

          {/* CONFIRM BUTTON */}
          <button
            type="button"
            className="key-confirm"
            onClick={confirmGuests}
            aria-label="Confirm guests"
          >
            <Check size={28} />
          </button>

        </div>

      </div>
    </div>
  );
}