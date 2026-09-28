from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    ForeignKey,
    Integer,
    Numeric,
    String,
    func,
)

from sqlalchemy.orm import relationship

from app.database import Base


class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False, unique=True)
    display_order = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)

    products = relationship("Product", back_populates="category")


class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    category_id = Column(
        Integer,
        ForeignKey("categories.id"),
        nullable=False
    )
    name = Column(String(150), nullable=False)
    price = Column(Numeric(10, 2), nullable=False)
    is_active = Column(Boolean, default=True)

    category = relationship("Category", back_populates="products")
    
    order_items = relationship(
        "OrderItem",
        back_populates="product"
    )
    


class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)

    table_number = Column(
        Integer,
        nullable=False
    )

    guest_count = Column(
        Integer,
        nullable=False
    )

    status = Column(
        String(20),
        nullable=False,
        default="open"
    )

    created_at = Column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now()
    )

    guests = relationship(
        "OrderGuest",
        back_populates="order"
    )


class OrderGuest(Base):
    __tablename__ = "order_guests"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    order_id = Column(
        Integer,
        ForeignKey("orders.id"),
        nullable=False
    )

    guest_number = Column(
        Integer,
        nullable=False
    )

    order = relationship(
        "Order",
        back_populates="guests"
    )

    items = relationship(
        "OrderItem",
        back_populates="guest"
    )

class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    guest_id = Column(
        Integer,
        ForeignKey("order_guests.id"),
        nullable=False
    )

    product_id = Column(
        Integer,
        ForeignKey("products.id"),
        nullable=False
    )

    quantity = Column(
        Integer,
        nullable=False,
        default=1
    )

    unit_price = Column(
        Numeric(10, 2),
        nullable=False
    )

    status = Column(
        String(20),
        nullable=False,
        default="sent"
    )

    guest = relationship(
        "OrderGuest",
        back_populates="items"
    )

    product = relationship(
        "Product",
        back_populates="order_items"
    )