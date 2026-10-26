from typing import Literal
from pydantic import BaseModel, Field, model_validator


class OrderCreate(BaseModel):
    order_type: Literal["dine_in", "takeout"] = "dine_in"

    table_number: int | None = Field(default=None, ge=1)

    guest_count: int = Field(default=1, ge=1)

    customer_name: str | None = Field(
        default=None,
        max_length=100
    )

    @model_validator(mode="after")
    def validate_order(self):

        if self.order_type == "dine_in":
            if self.table_number is None:
                raise ValueError(
                    "Table number is required for dine-in orders."
                )

        if self.order_type == "takeout":
            if self.table_number is not None:
                raise ValueError(
                    "Table number must be null for takeout orders."
                )

            if not self.customer_name or not self.customer_name.strip():
                raise ValueError(
                    "Customer name is required for takeout orders."
                )

            self.customer_name = self.customer_name.strip()

        return self

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
