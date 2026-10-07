import "./TableCard.css";
import { Armchair } from "lucide-react";


export default function TableCard({
  table,
  onClick,
}) {

  return (
    <button
      className={`table-card ${
        table.occupied
          ? "occupied"
          : "available"
      }`}
      onClick={() => onClick(table.id)}
    >

      {/* TABLE ICON */}

      <Armchair
        className="table-icon"
        size={32}
      />


      {/* TABLE NUMBER */}

      <div className="table-number">
        Table {table.id}
      </div>


      {/* GUESTS */}

      {table.occupied && (
        <small className="table-guests">
          {table.guests} Guests
        </small>
      )}


      {/* STATUS */}

      <div className="table-status">

        <span className="status-dot" />

        {table.occupied
          ? "Occupied"
          : "Available"}

      </div>

    </button>
  );
}