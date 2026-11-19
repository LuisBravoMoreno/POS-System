
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const COLORS = {
  cash: "#16A34A",
  card: "#2563EB",
};

export default function PaymentMethodsChart({ data = [] }) {
  const totalRevenue = data.reduce(
    (sum, item) => sum + Number(item.total_revenue),
    0
  );

  const chartData = data.map((item) => ({
    name:
      item.method === "cash"
        ? "Cash"
        : item.method === "card"
        ? "Card"
        : item.method,
    method: item.method,
    value: Number(item.total_revenue),
  }));

  return (
    <div style={{ width: "100%", height: 260 }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="45%"
            innerRadius={65}
            outerRadius={90}
            paddingAngle={chartData.length > 1 ? 3 : 0}
          >
            {chartData.map((entry) => (
              <Cell
                key={entry.method}
                fill={COLORS[entry.method] || "#64748B"}
              />
            ))}
          </Pie>

          <Tooltip
            formatter={(value) =>
              `$${Number(value).toFixed(2)}`
            }
          />

          <Legend />
        </PieChart>
      </ResponsiveContainer>

      <p
        style={{
          textAlign: "center",
          fontSize: "12px",
          color: "#64748b",
          marginTop: "-5px",
        }}
      >
        Total: ${totalRevenue.toFixed(2)}
      </p>
    </div>
  );
}