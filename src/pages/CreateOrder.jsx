import {
  Utensils,
  ShoppingBag,
  ArrowRight,
} from "lucide-react";

import "./CreateOrder.css";

export default function CreateOrder({
  onSelectTables,
  onSelectTakeout,
}) {
  return (
    <div className="create-order-page">

      <div className="create-order-header">
        <h1>
            <span className="orders-title-dark">ORD</span>
            <span className="orders-title-blue">ERS</span>
        </h1>
        <p>Select the order type to continue</p>
      </div>

      <div className="order-type-container">

        {/* TABLES CARD */}
        <button
          type="button"
          className="order-type-card tables-card"
          onClick={onSelectTables}
        >
          <div className="order-type-icon">
            <Utensils size={54} strokeWidth={1.8} />
          </div>

          <h2>TABLES</h2>

          <p>Dine-in orders</p>

          <span className="order-type-action">
            Open Tables
            <ArrowRight size={18} />
          </span>
        </button>

        {/* TAKEOUT CARD */}
        <button
          type="button"
          className="order-type-card takeout-card"
          onClick={onSelectTakeout}
        >
          <div className="order-type-icon">
            <ShoppingBag size={54} strokeWidth={1.8} />
          </div>

          <h2>ORDERS TO GO</h2>

          <p>Takeout / Pickup orders</p>

          <span className="order-type-action">
            Create To Go Order
            <ArrowRight size={18} />
          </span>
        </button>

      </div>

    </div>
  );
}