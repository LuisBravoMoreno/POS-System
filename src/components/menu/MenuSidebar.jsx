import Logo from "../Logo";
import { ReceiptText } from "lucide-react";

export default function MenuSidebar({
  table,
  selectedGuest,
  setSelectedGuest,
  guestOrders,
}) {
  return (
    <aside className="menu-sidebar">

      <div className="menu-logo">
        <Logo />
      </div>

      <div className="order-info">

        <div className="check-header">
          <ReceiptText
            className="check-bill-icon"
            size={19}
          />

          <span>Check</span>
        </div>

        <div className="order-details">

          <div className="detail-item">
            <span className="detail-label">
              Table
            </span>

            <span className="detail-value">
              {table.id}
            </span>
          </div>

          <div className="detail-divider"></div>

          <div className="detail-item">
            <span className="detail-label">
              {table.guests === 1
                ? "Guest"
                : "Guests"}
            </span>

            <span className="detail-value">
              {table.guests}
            </span>
          </div>

        </div>

      </div>


      {/* GUESTS */}

      <div className="guest-list">

        {Array.from(
          { length: table.guests },
          (_, index) => {

            const guestNumber = index + 1;

            const guestItems =
              guestOrders[guestNumber] || [];

            return (
              <div
                key={guestNumber}
                className="guest-check"
              >

                <button
                  className={`guest-row ${
                    selectedGuest === guestNumber
                      ? "guest-row-selected"
                      : ""
                  }`}
                  onClick={() =>
                    setSelectedGuest(guestNumber)
                  }
                >
                  Guest {guestNumber}
                </button>


                {guestItems.length > 0 && (

                  <div className="guest-items">

                    {guestItems.map(
                      (item, itemIndex) => (

                        <div
                          key={`${item.id}-${itemIndex}`}
                          className="guest-item"
                        >

                          <span>
                            {item.name}
                          </span>

                          <span>
                            ${item.price.toFixed(2)}
                          </span>

                        </div>

                      )
                    )}

                  </div>

                )}

              </div>
            );
          }
        )}

      </div>

    </aside>
  );
}