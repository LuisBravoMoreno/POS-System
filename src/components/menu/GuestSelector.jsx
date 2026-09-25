import { UserRound } from "lucide-react";

export default function GuestSelector({
  guestCount,
  selectedGuest,
  onSelectGuest,
}) {
  return (
    <div className="guest-selector-container">

      <div className="guest-selector-title">
        <UserRound size={19} />

        <span>Select Guest</span>
      </div>

      <div className="guest-selector">

        {Array.from(
          { length: guestCount },
          (_, index) => {

            const guestNumber = index + 1;

            return (
              <button
                key={guestNumber}
                className={`guest-selector-button ${
                  selectedGuest === guestNumber
                    ? "selected"
                    : ""
                }`}
                onClick={() =>
                  onSelectGuest(guestNumber)
                }
              >
                {guestNumber}
              </button>
            );
          }
        )}

      </div>

    </div>
  );
}