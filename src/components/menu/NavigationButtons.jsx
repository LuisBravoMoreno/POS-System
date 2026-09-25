import { ArrowLeft } from "lucide-react";

export default function NavigationButtons({
  showCategories,
  onCategories,
  onTables,
}) {
  return (
    <>
      {showCategories && (
        <button
          className="categories-back-button"
          onClick={onCategories}
        >
          <ArrowLeft size={19} />
          Categories
        </button>
      )}

      <button
        className="back-button"
        onClick={onTables}
      >
        <ArrowLeft size={20} />
        Tables
      </button>
    </>
  );
}