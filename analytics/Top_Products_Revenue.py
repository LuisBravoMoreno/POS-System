import pandas as pd
import matplotlib.pyplot as plt
from database import engine

query = """
SELECT
    p.id AS product_id,
    p.name AS product_name,
    SUM(oi.quantity) AS total_quantity,
    SUM(oi.quantity * oi.unit_price) AS total_revenue
FROM products as p
INNER JOIN order_items as oi
ON p. id=oi.product_id
WHERE oi.status='sent'
GROUP BY p.id,p.name
ORDER BY total_revenue DESC LIMIT 10;
"""

with engine.connect() as connection:
    df = pd.read_sql(query, connection, index_col="product_name").sort_values("total_quantity", ascending=True)

print(df)

df.plot.barh(
    #x="fecha", puesto que la columna fecha se la esta considerando como indice no se la declara en el plot.line
    y="total_quantity",
    figsize=(10, 5),
    color="#27E0F5",
    title="RESIDENTE POS - TOP Selling Products",
    legend=False
)

plt.xlabel("Quantity Sold")
plt.ylabel("Products")
plt.grid(True)
plt.tight_layout()
plt.show()