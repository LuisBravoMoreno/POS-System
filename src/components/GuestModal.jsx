import "./GuestModal.css";
export default function GuestModal({
  selectedTable,
  guestCount,
  addDigit,
  clearGuests,
  confirmGuests,
}) {
  return (
    <div className="modal-overlay">
      <div className="guest-modal">
        <h2>Table {selectedTable}</h2>

        <p>Number of Guests</p>

        <div className="guest-display">
          {guestCount || 0}
        </div>

        <div className="keyboard">
          {[1,2,3,4,5,6,7,8,9].map((num) => (
            <button
              key={num}
              onClick={() =>
                addDigit(num.toString())
              }
            >
              {num}
            </button>
          ))}

          <button onClick={clearGuests}>
            C
          </button>

          <button
            onClick={() => addDigit("0")}
          >
            0
          </button>

          <button onClick={confirmGuests}>
            ✓
          </button>
        </div>
      </div>
    </div>
  );
}