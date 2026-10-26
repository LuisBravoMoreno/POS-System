import pandas as pd
import matplotlib.pyplot as plt

data = {
    "product": ["Burger", "Pizza", "Fries"],
    "quantity": [15, 10, 20]
}

df = pd.DataFrame(data)

print(df)

plt.bar(df["product"], df["quantity"])
plt.title("RESIDENTE POS - Test Analytics")
plt.show()