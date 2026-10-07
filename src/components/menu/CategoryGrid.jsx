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
            key={category.id}/* el id indica la posicion en el array de cada categoria */
            className="menu-option"
            onClick={() =>
              onCategoryClick(category) /* cuando el usuario haga click en ese button  */
            }
          >
            {category.name}
          </button>

        ))}

      </div>
    </>
  );
}