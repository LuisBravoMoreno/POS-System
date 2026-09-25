import "./MenuScreen.css";
import Logo from "../components/Logo";
import { ReceiptText, ArrowLeft } from "lucide-react";

export default function MenuScreen({ table, onBack }) {

  const options = [
    { id: 1, name: "Entradas" },
    { id: 2, name: "Asados" },
    { id: 3, name: "Picamoros" },
    { id: 4, name: "Costillas al Barril" },
    { id: 5, name: "Especialidades" },
    { id: 6, name: "Hamburguesas" },
    { id: 7, name: "Alitas" },
    { id: 8, name: "Guarniciones" },
    { id: 9, name: "Bebidas" },
    { id: 10, name: "Cocteles" },
  ];

  return (
    <div className="menu-container">

      {/* =========================
          SIDEBAR
      ========================= */}
      <aside className="menu-sidebar">

        {/* LOGO */}
        <div className="menu-logo">
          <Logo />
        </div>

        {/* CHECK INFORMATION */}
        <div className="order-info">

          {/* CHECK HEADER */}
          <div className="check-header">
            <ReceiptText
              className="check-bill-icon"
              size={19}
            />

            <span>Check</span>
          </div>

          {/* TABLE + GUEST COUNT */}
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
                {table.guests === 1 ? "Guest" : "Guests"}
              </span>

              <span className="detail-value">
                {table.guests}
              </span>
            </div>

          </div>

        </div>

        {/* =========================
            SCROLLABLE GUEST LIST
        ========================= */}
        <div className="guest-list">

          {Array.from(
            { length: table.guests },
            (_, index) => (

              <button
                key={index}
                className="guest-row"
              >
                Guest {index + 1}
              </button>

            )
          )}

        </div>

      </aside>


      {/* =========================
          MAIN MENU
      ========================= */}
      <main className="menu-main">

        {/* MENU TITLE */}
        <h1 className="menu-title">
          <span className="menu-dark">
            MEN
          </span>

          <span className="menu-blue">
            U
          </span>
        </h1>


        {/* MENU CATEGORIES */}
        <div className="options-grid">

          {options.map((option) => (

            <button
              key={option.id}
              className="menu-option"
            >
              {option.name}
            </button>

          ))}

        </div>


        {/* =========================
            BACK TO TABLES
        ========================= */}
        <button
          className="back-button"
          onClick={onBack}
        >
          <ArrowLeft size={20} />
          Tables
        </button>

      </main>

    </div>
  );
}