import { useState } from "react";
import "./RestaurantDashboard.css";
import Sidebar from "../components/Sidebar";
import TableCard from "../components/TableCard";
import GuestModal from "../components/GuestModal";


export default function RestaurantDashboard() {
 const [tables, setTables] = useState(
  Array.from({ length: 10 }, (_, i) => ({
    id: i + 1,
    occupied: false,
    guests:0,
  }))
);

const [selectedTable, setSelectedTable] = useState(null);
const [guestCount, setGuestCount] = useState("");

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
  if (!guestCount) return;

  setTables(
    tables.map((table) =>
      table.id === selectedTable
        ? {
            ...table,
            occupied: true,
            guests: Number(guestCount),
          }
        : table
    )
  );
  
  setSelectedTable(null);
  setGuestCount("");
}; 

const addDigit = (digit) => {
  setGuestCount((prev) => prev + digit);
};

const clearGuests = () => {
  setGuestCount("");
};
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
 