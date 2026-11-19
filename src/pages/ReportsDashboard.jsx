import { useEffect, useState } from "react";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

import TopProductsChart from "../components/reports/TopProductsChart";
import PaymentMethodsChart from "../components/reports/PaymentMethodsChart";
import SalesSummary from "../components/reports/SalesSummary";

import "./ReportsDashboard.css";

const API_URL = "http://127.0.0.1:8000";

// ==========================================
// DATE HELPERS
// ==========================================

function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getDateRange(period) {
  const today = new Date();

  if (period === "all") {
    return { startDate: "", endDate: "" };
  }

  if (period === "today") {
    const date = formatDate(today);

    return { startDate: date, endDate: date };
  }

  if (period === "7days" || period === "30days") {
    const days = period === "7days" ? 7 : 30;

    const start = new Date(today);
    start.setDate(start.getDate() - (days - 1));

    return {
      startDate: formatDate(start),
      endDate: formatDate(today),
    };
  }

  return { startDate: "", endDate: "" };
}

// ==========================================
// DASHBOARD
// ==========================================

export default function ReportsDashboard() {
  // DATA
  const [dailyRevenue, setDailyRevenue] = useState([]);
  const [summary, setSummary] = useState(null);
  const [topProducts, setTopProducts] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [salesSummary, setSalesSummary] = useState(null);

  // FILTERS
  const [selectedPeriod, setSelectedPeriod] = useState("all");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");

  // LOADING AND ERRORS
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ==========================================
  // DATE FILTER
  // ==========================================

  const dateRange =
    selectedPeriod === "custom"
      ? {
          startDate: customStartDate,
          endDate: customEndDate,
        }
      : getDateRange(selectedPeriod);

  const invalidCustomRange =
    selectedPeriod === "custom" &&
    (!customStartDate ||
      !customEndDate ||
      customStartDate > customEndDate);

  // ==========================================
  // FETCH ALL REPORTS
  // ==========================================

  useEffect(() => {
    if (invalidCustomRange) {
      return;
    }

    const controller = new AbortController();

    async function fetchReports() {
      setLoading(true);
      setError("");

      const params = new URLSearchParams();

      if (dateRange.startDate) {
        params.set("start_date", dateRange.startDate);
      }

      if (dateRange.endDate) {
        params.set("end_date", dateRange.endDate);
      }

      const queryString = params.toString();
      const suffix = queryString ? `?${queryString}` : "";

      const endpoints = [
        "/reports/daily-revenue",
        "/reports/summary",
        "/reports/top-products",
        "/reports/payment-methods",
        "/reports/sales-summary",
      ];

      try {
        const responses = await Promise.all(
          endpoints.map((endpoint) =>
            fetch(`${API_URL}${endpoint}${suffix}`, {
              signal: controller.signal,
            })
          )
        );

        for (const response of responses) {
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
          }
        }

        const [
          dailyData,
          summaryData,
          productsData,
          paymentData,
          salesData,
        ] = await Promise.all(
          responses.map((response) => response.json())
        );

        if (controller.signal.aborted) {
          return;
        }

        setDailyRevenue(dailyData);
        setSummary(summaryData);
        setTopProducts(productsData.slice(0, 5));
        setPaymentMethods(paymentData);
        setSalesSummary(salesData);
      } catch (err) {
        if (controller.signal.aborted) {
          return;
        }

        console.error("Error loading reports:", err);
        setError("Unable to load reports.");
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    fetchReports();

    return () => controller.abort();
  }, [
    dateRange.startDate,
    dateRange.endDate,
    invalidCustomRange,
  ]);

  // ==========================================
  // FILTER BUTTONS
  // ==========================================

  const periods = [
    { value: "all", label: "All Time" },
    { value: "today", label: "Today" },
    { value: "7days", label: "Last 7 Days" },
    { value: "30days", label: "Last 30 Days" },
    { value: "custom", label: "Custom Range" },
  ];

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <section className="reports-dashboard">

      {/* HEADER */}
      <header className="reports-header">
        <h1>
          <span className="reports-title-dark">
            Sales Analytics
          </span>{" "}
          <span className="reports-title-blue">
            Dashboard
          </span>
        </h1>

        <p>
          Monitor sales performance, revenue,
          and restaurant operations.
        </p>
      </header>

      {/* =====================================
          DATE FILTERS
      ===================================== */}

      <div className="reports-filters">
        <div className="reports-filter-buttons">
          {periods.map((period) => (
            <button
              key={period.value}
              type="button"
              className={`reports-filter-btn ${
                selectedPeriod === period.value
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                setSelectedPeriod(period.value)
              }
            >
              {period.label}
            </button>
          ))}
        </div>

        {selectedPeriod === "custom" && (
          <div className="reports-custom-range">
            <label>
              Start Date
              <input
                type="date"
                value={customStartDate}
                max={customEndDate || undefined}
                onChange={(event) =>
                  setCustomStartDate(event.target.value)
                }
              />
            </label>

            <label>
              End Date
              <input
                type="date"
                value={customEndDate}
                min={customStartDate || undefined}
                onChange={(event) =>
                  setCustomEndDate(event.target.value)
                }
              />
            </label>
          </div>
        )}
      </div>

      {invalidCustomRange && (
        <p className="reports-filter-message">
          Select a valid start date and end date.
        </p>
      )}

      {error && (
        <p role="alert" className="reports-error">
          {error}
        </p>
      )}

      {/* =====================================
          KPI CARDS
      ===================================== */}

      <div className="reports-kpis">

        <div className="reports-kpi-card">
          <span className="kpi-label">
            Total Revenue
          </span>

          <h2>
            {!loading && !error && summary
              ? `$${Number(
                  summary.total_revenue
                ).toFixed(2)}`
              : "—"}
          </h2>

          <p>Completed payments</p>
        </div>

        <div className="reports-kpi-card">
          <span className="kpi-label">
            Paid Orders
          </span>

          <h2>
            {!loading && !error && summary
              ? summary.paid_orders
              : "—"}
          </h2>

          <p>Orders with completed payments</p>
        </div>

        <div className="reports-kpi-card">
          <span className="kpi-label">
            Average Order Value
          </span>

          <h2>
            {!loading && !error && summary
              ? `$${Number(
                  summary.average_order_value
                ).toFixed(2)}`
              : "—"}
          </h2>

          <p>Collected revenue per order</p>
        </div>

      </div>

      {/* =====================================
          MAIN CHARTS
      ===================================== */}

      <div className="reports-charts-grid">

        {/* DAILY REVENUE */}
        <div className="reports-content">
          <h2>Daily Revenue</h2>

          {loading ? (
            <p>Loading revenue data...</p>
          ) : error ? (
            <p>Unable to load revenue data.</p>
          ) : dailyRevenue.length === 0 ? (
            <p>No revenue data available.</p>
          ) : (
            <div className="revenue-chart">
              <ResponsiveContainer
                width="100%"
                height={240}
              >
                <LineChart
                  data={dailyRevenue}
                  margin={{
                    top: 10,
                    right: 10,
                    left: 0,
                    bottom: 15,
                  }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                  />

                  <XAxis
                    dataKey="date"
                    tickFormatter={(date) =>
                      date.slice(5)
                    }
                  />

                  <YAxis
                    tickFormatter={(value) =>
                      `$${value}`
                    }
                  />

                  <Tooltip
                    formatter={(value) => [
                      `$${Number(value).toFixed(2)}`,
                      "Revenue",
                    ]}
                  />

                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#2563EB"
                    strokeWidth={3}
                    dot={{ r: 5 }}
                    activeDot={{ r: 7 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* TOP 5 PRODUCTS */}
        <div className="reports-content">
          <h2>Top 5 Selling Products</h2>

          {loading ? (
            <p>Loading top products...</p>
          ) : error ? (
            <p>Unable to load top products.</p>
          ) : topProducts.length === 0 ? (
            <p>No product data available.</p>
          ) : (
            <TopProductsChart data={topProducts} />
          )}
        </div>

      </div>

      {/* =====================================
          SECONDARY CHARTS
      ===================================== */}

      <div className="reports-secondary-grid">

        {/* PAYMENT METHODS */}
        <div className="reports-content">
          <h2>Revenue by Payment Method</h2>

          {loading ? (
            <p>Loading payment methods...</p>
          ) : error ? (
            <p>Unable to load payment methods.</p>
          ) : paymentMethods.length === 0 ? (
            <p>No payment data available.</p>
          ) : (
            <PaymentMethodsChart
              data={paymentMethods}
            />
          )}
        </div>

        {/* SALES SUMMARY */}
        <div className="reports-content">
          <h2>Sales Summary</h2>

          {loading ? (
            <p>Loading sales summary...</p>
          ) : error ? (
            <p>Unable to load sales summary.</p>
          ) : (
            <SalesSummary data={salesSummary} />
          )}
        </div>

      </div>

    </section>
  );
}