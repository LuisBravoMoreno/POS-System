export default function TopProductsChart({ data = [] }) {
  // Find the highest quantity to calculate bar widths
  const maxQuantity = Math.max(
    ...data.map((product) => product.total_quantity),
    1
  );

  return (
    <div className="top-products-chart">
      {data.map((product) => {
        const percentage =
          (product.total_quantity / maxQuantity) * 100;

        return (
          <div
            className="top-product-item"
            key={product.product_id}
          >
            <div className="top-product-info">
              <span className="top-product-name">
                {product.product_name}
              </span>

              <span className="top-product-quantity">
                {product.total_quantity}
              </span>
            </div>

            <div className="top-product-track">
              <div
                className="top-product-bar"
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}