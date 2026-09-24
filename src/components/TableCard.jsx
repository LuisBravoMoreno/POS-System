import "./TableCard.css";
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
      <div>Table {table.id}</div>

      {table.occupied && (      
        <small>                 
          {table.guests} Guests
        </small>
      )}
    </button>
  );
}

/*muestra informacion que ya viene en la prop table*/
      /*ejemplo si el padre tiene: id:3;occupied:true;guests:4*/