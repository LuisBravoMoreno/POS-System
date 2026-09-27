from fastapi import FastAPI
from sqlalchemy import text
from app.database import Base, engine
from app import models

from fastapi import Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Category, Product
from fastapi.middleware.cors import CORSMiddleware



Base.metadata.create_all(bind=engine)


app = FastAPI(
    title="Residente POS API",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {
        "message": "Residente POS API is running"
    }


@app.get("/db-test")
def db_test():
    with engine.connect() as connection:
        result = connection.execute(
            text("SELECT current_database();")
        )

        return {
            "database": result.scalar_one(),
            "status": "connected"
        }

@app.get("/categories")
def get_categories(db: Session = Depends(get_db)):

    categories = (
        db.query(Category)
        .filter(Category.is_active == True)
        .order_by(Category.display_order)
        .all()
    )

    return categories

@app.get("/categories/{category_id}/products")
def get_products_by_category(
    category_id: int,
    db: Session = Depends(get_db),
):

    products = (
        db.query(Product)
        .filter(
            Product.category_id == category_id,
            Product.is_active == True,
        )
        .order_by(Product.id)
        .all()
    )

    return products