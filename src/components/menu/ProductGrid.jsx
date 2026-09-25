export default function ProductGrid({
  products,
  selectedGuest,
  onProductClick,
}) {
  return (
    <div className="products-grid">

      {products.map((product) => (

        <button
          key={product.id}
          className={`product-card ${
            !selectedGuest
              ? "product-disabled"
              : ""
          }`}
          onClick={() =>
            onProductClick(product)
          }
        >

          <span className="product-name">
            {product.name}
          </span>

          <span className="product-price">
            ${product.price.toFixed(2)}
          </span>

        </button>

      ))}

    </div>
  );
}