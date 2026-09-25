export default function CategoryGrid({
  categories,
  onCategoryClick,
}) {
  return (
    <>
      <h1 className="menu-title">
        <span className="menu-dark">
          MEN
        </span>

        <span className="menu-blue">
          U
        </span>
      </h1>

      <div className="options-grid">

        {categories.map((category) => (

          <button
            key={category.id}
            className="menu-option"
            onClick={() =>
              onCategoryClick(category)
            }
          >
            {category.name}
          </button>

        ))}

      </div>
    </>
  );
}