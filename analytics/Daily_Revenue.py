import pandas as pd
import matplotlib.pyplot as plt
from database import engine

query = """
SELECT
    DATE(p.created_at) AS fecha,
    SUM(p.total_amount) AS total_revenue
FROM
    payments AS p
WHERE p.status='completed'
GROUP BY DATE(p.created_at)
ORDER BY fecha DESC;
"""

with engine.connect() as connection:
    df = pd.read_sql(query, connection, parse_dates=["fecha"], index_col="fecha").sort_index()

print(df)

df.plot.line(
    #x="fecha", puesto que la columna fecha se la esta considerando como indice no se la declara en el plot.line
    y="total_revenue",
    figsize=(10, 5),
    marker="o",
    linewidth=2,
    color="#27E0F5",
    title="RESIDENTE POS - Daily Revenue"
)

plt.xlabel("Date")
plt.ylabel("Revenue ($)")
plt.grid(True)
plt.tight_layout()
plt.show()