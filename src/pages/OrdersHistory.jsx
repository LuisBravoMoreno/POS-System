import { useCallback, useEffect, useState } from "react";

const API_URL = "http://127.0.0.1:8000";
const money = (value) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(Number(value ?? 0));

export default function OrdersHistory({ onOpenOrder }) {
  const [orders, setOrders] = useState([]);
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openingId, setOpeningId] = useState(null);
  const [details, setDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`${API_URL}/orders/history`);
      if (!response.ok) throw new Error(`Could not load orders (HTTP ${response.status}).`);
      const data = await response.json();
      if (!Array.isArray(data)) throw new Error("Unexpected history response.");
      setOrders(data);
    } catch (err) {
      setError(err.message || "Could not load orders.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadOrders(); }, [loadOrders]);

  const filtered = orders.filter((order) => {
    const payment = order.payment_status === "partially_paid" ? "unpaid" : order.payment_status;
    return (paymentFilter === "all" || payment === paymentFilter) &&
      (typeFilter === "all" || order.order_type === typeFilter);
  });

  const openOrder = async (order) => {
    setOpeningId(order.id);
    setError("");
    try {
      await onOpenOrder(order);
    } catch (err) {
      setError(err.message || "Could not reopen order.");
    } finally {
      setOpeningId(null);
    }
  };

  const viewDetails = async (order) => {
    setDetailsLoading(true);
    setError("");
    try {
      const response = await fetch(`${API_URL}/orders/${order.id}`);
      if (!response.ok) throw new Error(`Could not load order details (HTTP ${response.status}).`);
      const data = await response.json();
      setDetails({ summary: order, data });
    } catch (err) {
      setError(err.message || "Could not load details.");
    } finally {
      setDetailsLoading(false);
    }
  };

  const buttonStyle = (selected) => ({
    padding: "9px 16px", borderRadius: 9, cursor: "pointer", fontWeight: 600,
    border: selected ? "1px solid #2456b8" : "1px solid #d5dfed",
    color: selected ? "#fff" : "#31435b", background: selected ? "#2456b8" : "#fff"
  });

  return (
    <section style={{ padding: "28px", color: "#22334c", maxWidth: 1250, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 28 }}>Orders History</h1>
          <p style={{ color: "#65758a", marginTop: 7 }}>Review payments and reopen outstanding orders.</p>
        </div>
        <button onClick={loadOrders} disabled={loading} style={buttonStyle(false)}>{loading ? "Loading..." : "Refresh"}</button>
      </div>

      <div style={{ background: "#fff", border: "1px solid #e0e7f0", borderRadius: 14, padding: 20, margin: "22px 0" }}>
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontWeight: 700, marginBottom: 9 }}>Payment Status</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {[["all", "All"], ["unpaid", "Unpaid"], ["paid", "Paid"]].map(([value, label]) => (
              <button key={value} onClick={() => setPaymentFilter(value)} style={buttonStyle(paymentFilter === value)}>{label}</button>
            ))}
          </div>
        </div>
        <div>
          <div style={{ fontWeight: 700, marginBottom: 9 }}>Order Type</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {[["all", "All"], ["takeout", "To Go"], ["dine_in", "Tables"]].map(([value, label]) => (
              <button key={value} onClick={() => setTypeFilter(value)} style={buttonStyle(typeFilter === value)}>{label}</button>
            ))}
          </div>
        </div>
      </div>

      {error && <p role="alert" style={{ color: "#b42318", background: "#fff1f0", padding: 12, borderRadius: 8 }}>{error}</p>}
      <p style={{ color: "#65758a" }}>{loading ? "Loading orders..." : `${filtered.length} order(s) found`}</p>
      <div style={{ overflowX: "auto", background: "#fff", border: "1px solid #e0e7f0", borderRadius: 14 }}>
        <table style={{ borderCollapse: "collapse", width: "100%", minWidth: 820, textAlign: "left" }}>
          <thead style={{ background: "#f1f5fa" }}>
            <tr>{["Order", "Type / Customer", "Total", "Paid", "Balance", "Payment", "Action"].map((label) => (
              <th key={label} style={{ padding: "15px 13px", fontSize: 13 }}>{label}</th>
            ))}</tr>
          </thead>
          <tbody>
            {!loading && filtered.length === 0 && <tr><td colSpan={7} style={{ padding: 28, textAlign: "center", color: "#65758a" }}>No matching orders.</td></tr>}
            {filtered.map((order) => {
              const isOpen = order.status === "open";
              const paymentLabel = order.status === "cancelled" ? "Cancelled" : order.payment_status === "paid" ? "Paid" : "Unpaid";
              return (
                <tr key={order.id} style={{ borderTop: "1px solid #e7edf5" }}>
                  <td style={{ padding: 13, fontWeight: 700 }}>#{order.id}</td>
                  <td style={{ padding: 13 }}>
                    <div style={{ fontWeight: 600 }}>{order.order_type === "takeout" ? "To Go" : "Table"}</div>
                    <div style={{ fontSize: 13, color: "#65758a" }}>{order.order_type === "takeout" ? (order.customer_name || "No customer") : `Table ${order.table_number ?? "—"}`}</div>
                  </td>
                  <td style={{ padding: 13 }}>{money(order.total)}</td>
                  <td style={{ padding: 13 }}>{money(order.paid_amount)}</td>
                  <td style={{ padding: 13 }}>{money(order.remaining_balance)}</td>
                  <td style={{ padding: 13 }}><span style={{ fontWeight: 700, color: paymentLabel === "Paid" ? "#18794e" : paymentLabel === "Cancelled" ? "#65758a" : "#ae6b00" }}>{paymentLabel}</span></td>
                  <td style={{ padding: 13 }}>
                    {isOpen && order.payment_status !== "paid" ? (
                      <button disabled={openingId === order.id} onClick={() => openOrder(order)} style={buttonStyle(true)}>{openingId === order.id ? "Opening..." : "Open Order"}</button>
                    ) : (
                      <button disabled={detailsLoading} onClick={() => viewDetails(order)} style={buttonStyle(false)}>View Details</button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {details && (
        <div role="dialog" aria-modal="true" aria-label={`Order ${details.summary.id} details`} style={{ position: "fixed", inset: 0, background: "#0008", display: "grid", placeItems: "center", padding: 16, zIndex: 1000 }} onClick={() => setDetails(null)}>
          <div style={{ background: "white", borderRadius: 16, padding: 24, width: "min(550px, 100%)", maxHeight: "85vh", overflowY: "auto" }} onClick={(event) => event.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><h2>Order #{details.summary.id}</h2><button onClick={() => setDetails(null)} style={buttonStyle(false)}>Close</button></div>
            <p><strong>Status:</strong> {details.summary.status} · {details.summary.payment_status}</p>
            {(details.data.guests || []).map((guest) => (
              <div key={guest.id} style={{ marginBottom: 15 }}><strong>Guest {guest.guest_number}</strong>
                {(guest.items || []).map((item) => <div key={item.id} style={{ padding: "5px 0", color: "#52657b" }}>{item.quantity} × {item.product_name || `Product #${item.product_id}`} — {money(item.unit_price)} ({item.status})</div>)}
              </div>
            ))}
            <hr style={{ border: 0, borderTop: "1px solid #e0e7f0" }}/>
            <p><strong>Total:</strong> {money(details.data.total)}</p>
            <p><strong>Paid:</strong> {money(details.data.paid_amount)}</p>
            <p><strong>Balance:</strong> {money(details.data.remaining_balance)}</p>
          </div>
        </div>
      )}
    </section>
  );
}
