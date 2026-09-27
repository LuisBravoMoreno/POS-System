from decimal import Decimal
from pathlib import Path

from openpyxl import load_workbook

from app.database import SessionLocal
from app.models import Category, Product


EXCEL_FILE = Path(__file__).parent / "MenuResidente.xlsx"


def seed_products():
    db = SessionLocal()

    try:
        workbook = load_workbook(EXCEL_FILE, data_only=True)
        sheet = workbook.active

        products_added = 0
        products_skipped = 0

        # min_row=2 skips the Excel header
        for row in sheet.iter_rows(min_row=2, values_only=True):
            category_name, product_name, price, is_active = row

            # Skip completely empty rows
            if not product_name:
                continue

            category_name = str(category_name).strip()
            product_name = str(product_name).strip()

            # Find category in PostgreSQL
            category = (
                db.query(Category)
                .filter(Category.name == category_name)
                .first()
            )

            if not category:
                print(
                    f"Category not found: {category_name} "
                    f"for product {product_name}"
                )
                continue

            # Check if product already exists in this category
            existing_product = (
                db.query(Product)
                .filter(
                    Product.name == product_name,
                    Product.category_id == category.id,
                )
                .first()
            )

            if existing_product:
                print(f"Skipping duplicate: {product_name}")
                products_skipped += 1
                continue

            product = Product(
                category_id=category.id,
                name=product_name,
                price=Decimal(str(price)),
                is_active=bool(is_active),
            )

            db.add(product)
            products_added += 1

        db.commit()

        print()
        print("Seed completed successfully!")
        print(f"Products added: {products_added}")
        print(f"Products skipped: {products_skipped}")

    except Exception as error:
        db.rollback()
        print(f"Error: {error}")

    finally:
        db.close()


if __name__ == "__main__":
    seed_products()