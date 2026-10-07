from pydantic import BaseModel


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