from fastapi import Depends, FastAPI, HTTPException
from sqlalchemy import text
from app.database import Base, engine
from app import models

from sqlalchemy.orm import Session
from decimal import Decimal
from app.payment_calculator import calculate_total
from app.database import get_db
from app.models import (
    Category,
    Product,
    Order,
    OrderGuest,
    OrderItem,
    Payment
)
from app.schemas import OrderCreate, OrderSend, OrderItemVoid, OrderItemMove, CashPaymentCreate
from fastapi.middleware.cors import CORSMiddleware
from app.models import RestaurantSettings, Payment



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

# -------------------------
# Helper functions
# -------------------------
def calculate_subtotal(items):
    subtotal = 0

    for item in items:
        if item.status == "sent":
            subtotal += item.unit_price * item.quantity

    return subtotal

# -------------------------
# Endpoints
# -------------------------


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


@app.post("/orders")
def create_order(
    order_data: OrderCreate,
    db: Session = Depends(get_db),
):
    restaurant_id = 1  # Temporal hasta implementar autenticación

    # 1. Verificar que exista el restaurante
    restaurant = (
        db.query(RestaurantSettings)
        .filter(RestaurantSettings.id == restaurant_id)
        .first()
    )

    if not restaurant:
        raise HTTPException(
            status_code=404,
            detail="Restaurant not found."
        )

    # 2. Verificar disponibilidad de mesa SOLO para Dine-in
    if order_data.order_type == "dine_in":

        existing_order = (
            db.query(Order)
            .filter(
                Order.restaurant_id == restaurant_id,
                Order.order_type == "dine_in",
                Order.table_number == order_data.table_number,
                Order.status == "open",
            )
            .first()
        )

        if existing_order:
            raise HTTPException(
                status_code=409,
                detail="This table already has an open order."
            )

    # 3. Crear orden Dine-in o Takeout
    order = Order(
        restaurant_id=restaurant_id,
        order_type=order_data.order_type,
        table_number=order_data.table_number,
        guest_count=order_data.guest_count,
        customer_name=order_data.customer_name,
        status="open",
    )

    db.add(order)
    db.flush()

    # 4. Crear los invitados de la orden
    for guest_number in range(1, order_data.guest_count + 1):

        guest = OrderGuest(
            order_id=order.id,
            guest_number=guest_number,
        )

        db.add(guest)

    # 5. Guardar orden e invitados
    db.commit()
    db.refresh(order)

    return order

#Enlista las ordenes abiertas
@app.get("/orders/open")
def get_open_orders(
    db: Session = Depends(get_db),
):
    open_orders = (
        db.query(Order)
        .filter(Order.restaurant_id == 1, Order.status == "open")
        .order_by(Order.table_number)
        .all()
    )

    return open_orders


@app.get("/orders/history")
def get_orders_history(db: Session = Depends(get_db)):
    restaurant_id = 1
    CENT = Decimal("0.01")

    # 1. Obtener todas las órdenes del restaurante
    orders = (
        db.query(Order)
        .filter(
            Order.restaurant_id == restaurant_id,
            Order.status != "cancelled"
        )
        .order_by(Order.id.desc())
    .   all()
    )

    # 2. Obtener configuración de impuestos y propina
    settings = (
        db.query(RestaurantSettings)
        .filter(RestaurantSettings.id == restaurant_id)
        .first()
    )

    if not settings:
        raise HTTPException(
            status_code=404,
            detail="Restaurant settings not found."
        )

    # 3. Obtener los productos enviados de todas las órdenes
    sent_items = (
        db.query(OrderGuest.order_id, OrderItem)
        .join(OrderItem, OrderItem.guest_id == OrderGuest.id)
        .join(Order, Order.id == OrderGuest.order_id)
        .filter(
            Order.restaurant_id == restaurant_id,
            OrderItem.status == "sent"
        )
        .all()
    )

    items_by_order = {}

    for order_id, item in sent_items:
        items_by_order.setdefault(order_id, []).append(item)

    # 4. Obtener los pagos completados
    payments = (
        db.query(Payment)
        .join(Order, Order.id == Payment.order_id)
        .filter(
            Order.restaurant_id == restaurant_id,
            Payment.status == "completed"
        )
        .all()
    )

    payments_by_order = {}

    for payment in payments:
        payments_by_order.setdefault(
            payment.order_id, Decimal("0.00")
        )
        payments_by_order[payment.order_id] += Decimal(
            str(payment.total_amount)
        )

    # 5. Construir el historial
    history = []

    for order in orders:
        items = items_by_order.get(order.id, [])

        totals = calculate_total(
            items,
            tax_rate=settings.tax_rate,
            tip_rate=settings.tip_rate
        )

        order_total = Decimal(
            str(totals["total"])
        ).quantize(CENT)

        paid_amount = payments_by_order.get(
            order.id, Decimal("0.00")
        ).quantize(CENT)

        remaining_balance = (
            order_total - paid_amount
        ).quantize(CENT)

        # Una orden cancelada no es una orden pagada.
        # Una orden vacía tampoco es una orden pagada.
        if order.status == "cancelled":
            payment_status = "cancelled"
        elif order_total <= 0:
            payment_status = "unpaid"
        elif remaining_balance > 0:
            payment_status = "unpaid"
        else:
            payment_status = "paid"

        history.append({
            "id": order.id,
            "order_type": order.order_type,
            "customer_name": order.customer_name,
            "table_number": order.table_number,
            "guest_count": order.guest_count,
            "status": order.status,
            "subtotal": totals["subtotal"],
            "tax": totals["tax"],
            "tip": totals["tip"],
            "total": order_total,
            "paid_amount": paid_amount,
            "remaining_balance": remaining_balance,
            "payment_status": payment_status
        })

    return history

# Obtener la orden con subtotal, tax, tip y total
@app.get("/orders/{order_id}")
def get_order(
    order_id: int,
    db: Session = Depends(get_db),
):
    # 1. Buscar la orden
    order = (
        db.query(Order)
        .filter(Order.id == order_id)
        .first()
    )

    if not order:
        raise HTTPException(
            status_code=404,
            detail="Order not found."
        )

    # 2. Buscar los guests de la orden
    guests = (
        db.query(OrderGuest)
        .filter(OrderGuest.order_id == order_id)
        .order_by(OrderGuest.guest_number)
        .all()
    )

    # 3. Construir los guests con sus items
    guests_data = []
    all_order_items = []

    for guest in guests:
        items = (
            db.query(OrderItem)
            .filter(OrderItem.guest_id == guest.id)
            .all()
        )

        all_order_items.extend(items)

        items_data = []

        for item in items:
            product = (
                db.query(Product)
                .filter(Product.id == item.product_id)
                .first()
            )

            items_data.append({
                "id": item.id,
                "product_id": item.product_id,
                "product_name": product.name if product else None,
                "quantity": item.quantity,
                "unit_price": item.unit_price,
                "status": item.status,
            })

        guests_data.append({
            "id": guest.id,
            "guest_number": guest.guest_number,
            "items": items_data,
        })

    # 4. Obtener configuración del restaurante
    settings = (
        db.query(RestaurantSettings)
        .filter(RestaurantSettings.id == order.restaurant_id)
        .first()
    )

    if not settings:
        raise HTTPException(
            status_code=404,
            detail="Restaurant settings not found."
        )

    # 5. Obtener tasas desde PostgreSQL
    tax_rate = settings.tax_rate
    tip_rate = settings.tip_rate

    # 6. Calcular subtotal, tax, tip y total
    totals = calculate_total(
        all_order_items,
        tax_rate=tax_rate,
        tip_rate=tip_rate,
    )

    # 7. Obtener todos los pagos completados de la orden
    completed_payments = (
        db.query(Payment)
        .filter(
            Payment.order_id == order_id,
            Payment.status == "completed",
        )
        .all()
    )

    # 8. Calcular el importe total pagado
    paid_amount = sum(
        (
            Decimal(str(payment.total_amount))
            for payment in completed_payments
        ),
        Decimal("0.00")
    )

    # 9. Calcular el saldo pendiente
    order_total = Decimal(str(totals["total"]))

    remaining_balance = (
        order_total - paid_amount
    ).quantize(Decimal("0.01"))

    # 10. Determinar el estado del pago
    if paid_amount == 0:
        payment_status = "unpaid"
    elif remaining_balance > 0:
        payment_status = "partially_paid"
    else:
        payment_status = "paid"

    # 11. Devolver la orden con sus totales y pagos
    return {
        "order": order,
        "guests": guests_data,
        **totals,
        "paid_amount": paid_amount,
        "remaining_balance": remaining_balance,
        "payment_status": payment_status,
    }


#Accion de enviar las ordenes a la base de datos con status "sent"
@app.post("/orders/{order_id}/send")
def send_order(
    order_id: int,
    order_data: OrderSend,
    db: Session = Depends(get_db),
):
    # 1. Buscar la orden
    order = (
        db.query(Order)
        .filter(Order.id == order_id)
        .first()
    )

    if not order:
        raise HTTPException(
            status_code=404,
            detail="Order not found."
        )

    # 2. Verificar que la orden siga abierta
    if order.status != "open":
        raise HTTPException(
            status_code=409,
            detail="Order is not open."
        )

    if not order_data.items:
        raise HTTPException(
            status_code=400,
            detail="No items to send."
        )

    created_items = []

    # 3. Procesar todos los items enviados
    for item_data in order_data.items:

        # Buscar el guest dentro de esta orden
        guest = (
            db.query(OrderGuest)
            .filter(
                OrderGuest.order_id == order_id,
                OrderGuest.guest_number == item_data.guest_number,
            )
            .first()
        )

        if not guest:
            raise HTTPException(
                status_code=404,
                detail=f"Guest {item_data.guest_number} not found in this order."
            )

        # Buscar el producto
        product = (
            db.query(Product)
            .filter(
                Product.id == item_data.product_id,
                Product.is_active == True,
            )
            .first()
        )

        if not product:
            raise HTTPException(
                status_code=404,
                detail=f"Product {item_data.product_id} not found."
            )

        # Crear el item ya enviado
        order_item = OrderItem(
            guest_id=guest.id,
            product_id=product.id,
            quantity=item_data.quantity,
            unit_price=product.price,
            status="sent",
        )

        db.add(order_item)
        created_items.append(order_item)

    # 4. Guardar todo el envío en una sola transacción
    db.commit()

    for item in created_items:
        db.refresh(item)

    return {
        "message": "Order sent successfully.",
        "items": created_items,
    }



@app.patch("/orders/{order_id}/items/{item_id}/void")
def void_order_item(
    order_id: int,
    item_id: int,
    void_data: OrderItemVoid,
    db: Session = Depends(get_db),
):
    # 1. Buscar la orden
    order = (
        db.query(Order)
        .filter(Order.id == order_id)
        .first()
    )

    if not order:
        raise HTTPException(
            status_code=404,
            detail="Order not found."
        )

    # 2. Verificar que la orden siga abierta
    if order.status != "open":
        raise HTTPException(
            status_code=409,
            detail="Order is not open."
        )

    # 3. Buscar el item y verificar que pertenezca a esta orden
    order_item = (
        db.query(OrderItem)
        .join(
            OrderGuest,
            OrderItem.guest_id == OrderGuest.id
        )
        .filter(
            OrderItem.id == item_id,
            OrderGuest.order_id == order_id,
        )
        .first()
    )

    if not order_item:
        raise HTTPException(
            status_code=404,
            detail="Order item not found in this order."
        )

    # 4. No permitir modificar un item ya voided
    if order_item.status == "voided":
        raise HTTPException(
            status_code=409,
            detail="Order item is already voided."
        )

    # 5. Validar la cantidad solicitada
    if void_data.quantity <= 0:
        raise HTTPException(
            status_code=400,
            detail="Void quantity must be greater than 0."
        )

    if void_data.quantity > order_item.quantity:
        raise HTTPException(
            status_code=400,
            detail="Void quantity cannot exceed item quantity."
        )

    # 6. Determinar si es void parcial o total
    if void_data.quantity == order_item.quantity:
        # Void total: conservamos la cantidad original
        order_item.status = "voided"
    else:
        # Void parcial: reducimos la cantidad
        order_item.quantity -= void_data.quantity

    # 7. Guardar el cambio
    db.commit()
    db.refresh(order_item)

    return {
        "message": "Order item voided successfully.",
        "item": order_item,
    }

@app.patch("/orders/{order_id}/items/{item_id}/move")
def move_order_item(
    order_id: int,
    item_id: int,
    move_data: OrderItemMove,
    db: Session = Depends(get_db),
):
    # 1. Buscar la orden
    order = db.query(Order).filter(Order.id == order_id).first()

    if not order:
        raise HTTPException(
            status_code=404,
            detail="Order not found."
        )

    # 2. Solo permitimos mover items de órdenes abiertas
    if order.status != "open":
        raise HTTPException(
            status_code=409,
            detail="Only open orders can have items moved."
        )

    # 3. Buscar el item y comprobar que pertenece a esta orden
    order_item = (
        db.query(OrderItem)
        .join(OrderGuest, OrderItem.guest_id == OrderGuest.id)
        .filter(
            OrderItem.id == item_id,
            OrderGuest.order_id == order_id,
        )
        .first()
    )

    if not order_item:
        raise HTTPException(
            status_code=404,
            detail="Order item not found."
        )

    # 4. Solo mover items activos/enviados
    if order_item.status != "sent":
        raise HTTPException(
            status_code=409,
            detail="Only sent items can be moved."
        )

    # 5. Validar cantidad
    if move_data.quantity <= 0:
        raise HTTPException(
            status_code=400,
            detail="Quantity must be greater than 0."
        )

    if move_data.quantity > order_item.quantity:
        raise HTTPException(
            status_code=400,
            detail="Cannot move more than the current quantity."
        )

    # 6. Buscar Guest destino DENTRO de la misma orden
    destination_guest = (
        db.query(OrderGuest)
        .filter(
            OrderGuest.order_id == order_id,
            OrderGuest.guest_number == move_data.guest_number,
        )
        .first()
    )

    if not destination_guest:
        raise HTTPException(
            status_code=404,
            detail="Destination guest not found in this order."
        )

    # 7. No permitir mover al mismo Guest
    if destination_guest.id == order_item.guest_id:
        raise HTTPException(
            status_code=400,
            detail="Item is already assigned to this guest."
        )

    # 8. MOVE TOTAL
    if move_data.quantity == order_item.quantity:
        order_item.guest_id = destination_guest.id

    # 9. MOVE PARCIAL
    else:
        order_item.quantity -= move_data.quantity

        moved_item = OrderItem(
            guest_id=destination_guest.id,
            product_id=order_item.product_id,
            quantity=move_data.quantity,
            unit_price=order_item.unit_price,
            status="sent",
        )

        db.add(moved_item)

    db.commit()

    return {
        "message": "Order item moved successfully."
    }

@app.post("/orders/{order_id}/payments/cash")
def create_cash_payment(
    order_id: int,
    payment_data: CashPaymentCreate,
    db: Session = Depends(get_db),
):
    CENT = Decimal("0.01")

    def money(value):
        return Decimal(str(value)).quantize(CENT)

    # 1. Lock the order to prevent simultaneous payments
    order = (
        db.query(Order)
        .filter(Order.id == order_id)
        .with_for_update()
        .first()
    )

    if not order:
        raise HTTPException(
            status_code=404,
            detail="Order not found."
        )

    if order.status != "open":
        raise HTTPException(
            status_code=409,
            detail="Order is not open."
        )

    # 2. Restaurant settings
    settings = (
        db.query(RestaurantSettings)
        .filter(
            RestaurantSettings.id == order.restaurant_id
        )
        .first()
    )

    if not settings:
        raise HTTPException(
            status_code=404,
            detail="Restaurant settings not found."
        )

    # 3. Get sent items
    items = (
        db.query(OrderItem)
        .join(
            OrderGuest,
            OrderItem.guest_id == OrderGuest.id
        )
        .filter(
            OrderGuest.order_id == order_id,
            OrderItem.status == "sent"
        )
        .all()
    )

    totals = calculate_total(
        items,
        tax_rate=settings.tax_rate,
        tip_rate=settings.tip_rate,
    )

    subtotal = money(totals["subtotal"])
    tax = money(totals["tax"])
    tip = money(totals["tip"])
    order_total = money(totals["total"])

    if order_total <= 0:
        raise HTTPException(
            status_code=400,
            detail="Order has no payable items."
        )

    # 4. Get completed payments
    completed_payments = (
        db.query(Payment)
        .filter(
            Payment.order_id == order_id,
            Payment.status == "completed"
        )
        .all()
    )

    paid_amount = sum(
        (money(p.total_amount) for p in completed_payments),
        Decimal("0.00")
    )

    remaining_balance = money(
        order_total - paid_amount
    )

    if remaining_balance <= 0:
        raise HTTPException(
            status_code=409,
            detail="Order is already fully paid."
        )

    # 5. Validate cash payment
    amount_to_pay = money(
        payment_data.amount_to_pay
    )

    amount_received = money(
        payment_data.amount_received
    )

    if amount_to_pay > remaining_balance:
        raise HTTPException(
            status_code=400,
            detail="Payment exceeds remaining balance."
        )

    if amount_received < amount_to_pay:
        raise HTTPException(
            status_code=400,
            detail="Insufficient cash received."
        )
    if amount_to_pay <= Decimal("0.00"):
        raise HTTPException(
            status_code=400,
            detail="Payment amount must be greater than zero."
    )

    if amount_received < Decimal("0.00"):
        raise HTTPException(
            status_code=400,
            detail="Amount received cannot be negative."
    )

    change_amount = money(
        amount_received - amount_to_pay
    )

    # 6. Allocate subtotal, tax and tip
    # across partial payments
    previous_subtotal = sum(
        (money(p.subtotal) for p in completed_payments),
        Decimal("0.00")
    )

    previous_tax = sum(
        (money(p.tax_amount) for p in completed_payments),
        Decimal("0.00")
    )

    previous_tip = sum(
        (money(p.tip_amount) for p in completed_payments),
        Decimal("0.00")
    )

    if amount_to_pay == remaining_balance:
        payment_subtotal = money(
            subtotal - previous_subtotal
        )
        payment_tax = money(
            tax - previous_tax
        )
        payment_tip = money(
            tip - previous_tip
        )
    else:
        payment_tax = money(
            tax * amount_to_pay / order_total
        )

        payment_tip = money(
            tip * amount_to_pay / order_total
        )

        payment_subtotal = money(
            amount_to_pay - payment_tax - payment_tip
        )

    # 7. Save payment
    payment = Payment(
        order_id=order.id,
        payment_method="cash",
        subtotal=payment_subtotal,
        tax_amount=payment_tax,
        tip_amount=payment_tip,
        total_amount=amount_to_pay,
        amount_received=amount_received,
        change_amount=change_amount,
        status="completed",
    )

    db.add(payment)

    # 8. Calculate new balance
    new_balance = money(
        remaining_balance - amount_to_pay
    )

    # 9. Close only when fully paid
    if new_balance == Decimal("0.00"):
        order.status = "closed"

    # 10. Commit payment and order together
    db.commit()
    db.refresh(payment)
    db.refresh(order)

    return {
        "message": "Cash payment completed successfully.",
        "payment_id": payment.id,
        "order_id": order.id,
        "payment_method": payment.payment_method,
        "amount_paid": payment.total_amount,
        "amount_received": payment.amount_received,
        "change_amount": payment.change_amount,
        "remaining_balance": new_balance,
        "order_status": order.status,
    }

@app.patch("/orders/{order_id}/close")
def close_order(
    order_id: int,
    db: Session = Depends(get_db),
):
    # 1. Buscar la orden
    order = (
        db.query(Order)
        .filter(Order.id == order_id)
        .first()
    )

    if not order:
        raise HTTPException(
            status_code=404,
            detail="Order not found."
        )

    # 2. Verificar que siga abierta
    if order.status != "open":
        raise HTTPException(
            status_code=409,
            detail="Order is already closed."
        )

    # 3. No cerrar una orden sin pago completo.
    # El cálculo de la cuenta se hace desde los items SENT.
    settings = db.query(RestaurantSettings).filter(
        RestaurantSettings.id == order.restaurant_id
    ).first()
    if not settings:
        raise HTTPException(status_code=404, detail="Restaurant settings not found.")

    items = (
        db.query(OrderItem)
        .join(OrderGuest, OrderItem.guest_id == OrderGuest.id)
        .filter(OrderGuest.order_id == order_id, OrderItem.status == "sent")
        .all()
    )
    totals = calculate_total(items, tax_rate=settings.tax_rate, tip_rate=settings.tip_rate)
    order_total = Decimal(str(totals["total"]))
    paid = sum(
        (Decimal(str(payment.total_amount)) for payment in db.query(Payment).filter(
            Payment.order_id == order_id, Payment.status == "completed"
        ).all()),
        Decimal("0.00")
    )
    if order_total <= 0 or paid < order_total:
        raise HTTPException(
            status_code=409,
            detail="Order cannot be closed until its full balance is paid."
        )

    # 4. Cerrar la orden
    order.status = "closed"

    db.commit()
    db.refresh(order)

    return {
        "message": "Order closed successfully.",
        "order": order,
    }



@app.patch("/orders/{order_id}/cancel")
def cancel_order(
    order_id: int,
    db: Session = Depends(get_db),
):
    # 1. Buscar la orden
    order = (
        db.query(Order)
        .filter(Order.id == order_id)
        .first()
    )

    if not order:
        raise HTTPException(
            status_code=404,
            detail="Order not found."
        )

    # 2. Solo una orden OPEN puede cancelarse
    if order.status != "open":
        raise HTTPException(
            status_code=409,
            detail="Only an open order can be cancelled."
        )

    completed_payment = db.query(Payment.id).filter(
        Payment.order_id == order_id,
        Payment.status == "completed"
    ).first()
    if completed_payment:
        raise HTTPException(
            status_code=409,
            detail="Cannot cancel an order with completed payments. Use a refund workflow."
        )

    # 3. Buscar los guests de esta orden
    guests = (
        db.query(OrderGuest)
        .filter(
            OrderGuest.order_id == order_id
        )
        .all()
    )

    guest_ids = [
        guest.id
        for guest in guests
    ]

    # 4. Si existen guests, buscar items SENT
    if guest_ids:

        sent_items = (
            db.query(OrderItem)
            .filter(
                OrderItem.guest_id.in_(guest_ids),
                OrderItem.status == "sent",
            )
            .all()
        )

        # 5. Todos los SENT pasan a VOIDED
        for item in sent_items:
            item.status = "voided"

    # 6. Cancelar la orden
    order.status = "cancelled"

    # 7. Guardar todo en una sola transacción
    db.commit()
    db.refresh(order)

    return {
        "message": "Order cancelled successfully.",
        "order": order,
    }
