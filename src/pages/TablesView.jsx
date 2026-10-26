import TableCard from "../components/TableCard";

export default function TablesView({
  tables,
  onTableClick,
}) {
  return (
    <>
      <h1 className="page-title">
        TABLES
      </h1>

      <div className="tables-container">
        {tables.map((table) => (
          <TableCard
            key={table.id}
            table={table}
            onClick={onTableClick}
          />
        ))}
      </div>
    </>
  );
}