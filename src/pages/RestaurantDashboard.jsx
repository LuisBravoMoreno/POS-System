import { useState } from "react";
import "./RestaurantDashboard.css";
import Sidebar from "../components/Sidebar";
import TableCard from "../components/TableCard";
import GuestModal from "../components/GuestModal";
import MenuScreen from "./MenuScreen";

export default function RestaurantDashboard() {
  const [tables, setTables] = useState(
    Array.from({ length: 10 }, (_, i) => ({
      id: i + 1,
      occupied: false,
      guests: 0,
    }))
  );

  const [selectedTable, setSelectedTable] = useState(null);
  const [guestCount, setGuestCount] = useState("");

  // Controla qué pantalla mostrar
  const [view, setView] = useState("tables");

  // Mesa que actualmente está siendo atendida
  const [activeTable, setActiveTable] = useState(null);

  const handleTableClick = (id) => {
    const table = tables.find((t) => t.id === id);

    if (!table.occupied) {
      setSelectedTable(id);
      setGuestCount("");
      return;
    }

    const closeTable = window.confirm(
      `Would you like to close Table ${id}?`
    );

    if (closeTable) {
      setTables(
        tables.map((t) =>
          t.id === id
            ? {
                ...t,
                occupied: false,
                guests: 0,
              }
            : t
        )
      );
    }
  };

  const confirmGuests = () => {
    if (!guestCount || !selectedTable) return;

    const guests = Number(guestCount);

    setTables(
      tables.map((table) =>
        table.id === selectedTable
          ? {
              ...table,
              occupied: true,
              guests,
            }
          : table
      )
    );

    // Guardamos la mesa que está trabajando
    setActiveTable({
      id: selectedTable,
      guests,
    });

    setSelectedTable(null);
    setGuestCount("");

    // Cambiamos a la pantalla del menú
    setView("menu");
  };

  const addDigit = (digit) => {
    setGuestCount((prev) => prev + digit);
  };

  const clearGuests = () => {
    setGuestCount("");
  };

  // --------------------------------
  // MENU SCREEN
  // --------------------------------
  if (view === "menu" && activeTable) {
    return (
      <MenuScreen
        table={activeTable}
        onBack={() => setView("tables")}
      />
    );
  }

  // --------------------------------
  // TABLE SCREEN
  // --------------------------------
  return (
    <div className="dashboard-container">

      <Sidebar />

      <main className="dashboard-main">

        <h1 className="page-title">
          TABLES
        </h1>

        <div className="tables-container">

          {tables.map((table) => (
            <TableCard
              key={table.id}
              table={table}
              onClick={handleTableClick}
            />
          ))}

        </div>

      </main>

      {selectedTable && (
        <GuestModal
          selectedTable={selectedTable}
          guestCount={guestCount}
          addDigit={addDigit}
          clearGuests={clearGuests}
          confirmGuests={confirmGuests}
        />
      )}

    </div>
  );
}