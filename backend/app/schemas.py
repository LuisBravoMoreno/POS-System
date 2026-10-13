from pydantic import BaseModel, Field


class OrderCreate(BaseModel):
    table_number: int
    guest_count: int

class OrderItemCreate(BaseModel):
    guest_number: int
    product_id: int
    quantity: int = 1

class OrderSend(BaseModel):
    items: list[OrderItemCreate]


class OrderItemVoid(BaseModel):
    quantity: int

class OrderItemMove(BaseModel):
    guest_number: int
    quantity: int

# =========================
# CASH PAYMENT
# =========================

from decimal import Decimal


class CashPaymentCreate(BaseModel):
    amount_to_pay: Decimal = Field(
        gt=0,
        max_digits=10,
        decimal_places=2
    )

    amount_received: Decimal = Field(
        gt=0,
        max_digits=10,
        decimal_places=2
    )
