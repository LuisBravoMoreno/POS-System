import pandas as pd
from database import engine

query = """
SELECT
    id,
    name,
    price
FROM products
LIMIT 5;
"""

with engine.connect() as connection:
    df = pd.read_sql(query, connection)

print(df)