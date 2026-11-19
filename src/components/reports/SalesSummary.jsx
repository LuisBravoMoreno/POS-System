export default function SalesSummary({ data }) {
  if (!data) {
    return <p>No sales summary available.</p>;
  }

  const metrics = [
    {
      label: "Total Orders",
      value: data.total_orders,
      color: "blue",
    },
    {
      label: "Closed Orders",
      value: data.closed_orders,
      color: "green",
    },
    {
      label: "Items Sent",
      value: data.items_sold,
      color: "purple",
    },
    {
      label: "Avg. Items / Order",
      value: Number(
        data.average_items_per_order
      ).toFixed(2),
      color: "navy",
    },
  ];

  return (
    <div className="sales-summary">
      {metrics.map((metric) => (
        <div
          className={`sales-summary-row ${metric.color}`}
          key={metric.label}
        >
          <span className="sales-summary-label">
            {metric.label}
          </span>

          <span className="sales-summary-value">
            {metric.value}
          </span>
        </div>
      ))}
    </div>
  );
}