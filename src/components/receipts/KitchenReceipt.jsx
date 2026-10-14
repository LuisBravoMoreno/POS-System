import residenteLogo from "../../assets/residente-logo-bw.png";
import "./Receipt.css";

export default function KitchenReceipt({
  orderData,
}) {
  if (!orderData?.order) return null;

  const { order, guests = [] } = orderData;

  const date = new Date().toLocaleString("es-EC", {
    dateStyle: "short",
    timeStyle: "short",
  });

  return (
    <div className="receipt kitchen-receipt">

      <div className="receipt-header">
        <img
          src={residenteLogo}
          alt="El Residente"
          className="receipt-logo"
        />

        <h1>Residente</h1>
        <h2>— KITCHEN ORDER —</h2>
      </div>

      <div className="receipt-order-info">
        <strong>
          TABLE {String(order.table_number).padStart(2, "0")}
        </strong>

        <strong>ORDER #{order.id}</strong>
      </div>

      <p className="receipt-date">
        Date: {date}
      </p>

      <div className="receipt-divider" />

      {guests.map((guest) => {
        const items = (guest.items || []).filter(
          (item) => item.status === "sent"
        );

        if (items.length === 0) return null;

        return (
          <section
            key={guest.id ?? guest.guest_number}
            className="receipt-guest"
          >
            <h3>GUEST {guest.guest_number}</h3>

            {items.map((item) => (
              <div
                key={item.id}
                className="receipt-item"
              >
                <span>{item.quantity}x</span>
                <span>{item.product_name}</span>
              </div>
            ))}

            <div className="receipt-divider" />
          </section>
        );
      })}

      <div className="receipt-footer">
        NEW ORDER — PREPARE ITEMS
      </div>

    </div>
  );
}