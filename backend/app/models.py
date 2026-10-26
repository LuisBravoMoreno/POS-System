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


# =========================
# CATEGORY
# =========================

class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)

    name = Column(
        String(100),
        nullable=False,
        unique=True
    )

    display_order = Column(Integer, default=0)

    is_active = Column(Boolean, default=True)

    products = relationship(
        "Product",
        back_populates="category"
    )


# =========================
# PRODUCT
# =========================

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

    category = relationship(
        "Category",
        back_populates="products"
    )

    order_items = relationship(
        "OrderItem",
        back_populates="product"
    )


# =========================
# ORDER
# =========================

class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)

    restaurant_id = Column(
        Integer,
        ForeignKey("restaurant_settings.id"),
        nullable=False
    )

    order_type = Column(
        String(20),
        nullable=False,
        default="dine_in",
        server_default="dine_in"
    )

    table_number = Column(
        Integer,
        nullable=True
    )

    guest_count = Column(
        Integer,
        nullable=False
    )

    customer_name = Column(
        String(100),
        nullable=True
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

    guests = relationship("OrderGuest", back_populates="order")
    restaurant = relationship("RestaurantSettings", back_populates="orders")
    payments = relationship("Payment", back_populates="order")

# =========================
# ORDER GUEST
# =========================

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


# =========================
# ORDER ITEM
# =========================

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


# =========================
# RESTAURANT SETTINGS
# =========================

class RestaurantSettings(Base):
    __tablename__ = "restaurant_settings"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    restaurant_name = Column(
        String(100),
        nullable=False
    )

    country_code = Column(
        String(2),
        nullable=False
    )

    currency = Column(
        String(3),
        nullable=False,
        default="USD"
    )

    tax_rate = Column(
        Numeric(6, 3),
        nullable=False,
        default=0
    )

    tip_rate = Column(
        Numeric(5, 2),
        nullable=False,
        default=0
    )

    tax_included_in_prices = Column(
        Boolean,
        nullable=False,
        default=False
    )

    # One restaurant can have multiple orders
    orders = relationship(
        "Order",
        back_populates="restaurant"
    )


# =========================
# PAYMENT
# =========================

class Payment(Base):
    __tablename__ = "payments"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    # Payment belongs to an order
    order_id = Column(
        Integer,
        ForeignKey("orders.id"),
        nullable=False
    )

    # cash or card
    payment_method = Column(
        String(20),
        nullable=False
    )

    # Amounts allocated to this payment
    subtotal = Column(
        Numeric(10, 2),
        nullable=False,
        default=0
    )

    tax_amount = Column(
        Numeric(10, 2),
        nullable=False,
        default=0
    )

    tip_amount = Column(
        Numeric(10, 2),
        nullable=False,
        default=0
    )

    # Amount paid in this transaction
    total_amount = Column(
        Numeric(10, 2),
        nullable=False
    )

    # Cash payment information
    amount_received = Column(
        Numeric(10, 2),
        nullable=True
    )

    change_amount = Column(
        Numeric(10, 2),
        nullable=True
    )

    # pending, completed, failed, refunded
    status = Column(
        String(20),
        nullable=False,
        default="completed"
    )

    created_at = Column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now()
    )

    # Many payments can belong to one order
    order = relationship(
        "Order",
        back_populates="payments"
    )