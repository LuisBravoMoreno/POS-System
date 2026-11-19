from datetime import date, datetime, time, timedelta, timezone
from decimal import Decimal
from datetime import date, datetime, time, timedelta
from zoneinfo import ZoneInfo
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func, distinct
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import (
    Payment,
    Order,
    OrderGuest,
    OrderItem,
    Product,
)


router = APIRouter(
    prefix="/reports",
    tags=["Reports"]
)


# ==========================================
# DATE FILTER HELPERS
# ==========================================

def validate_date_range(start_date, end_date):
    if start_date and end_date and start_date > end_date:
        raise HTTPException(
            status_code=422,
            detail="start_date cannot be after end_date"
        )


# ==========================================
# REPORTS TIMEZONE
# ==========================================

REPORTS_TIMEZONE = ZoneInfo("America/New_York")


def apply_date_filter(query, column, start_date, end_date):
    """
    Filters records using New Jersey local dates.

    The database stores timezone-aware timestamps.
    Date boundaries are interpreted in America/New_York.
    """

    if start_date:
        start_datetime = datetime.combine(
            start_date,
            time.min,
            tzinfo=REPORTS_TIMEZONE
        )

        query = query.filter(
            column >= start_datetime
        )

    if end_date:
        next_day = end_date + timedelta(days=1)

        end_datetime = datetime.combine(
            next_day,
            time.min,
            tzinfo=REPORTS_TIMEZONE
        )

        query = query.filter(
            column < end_datetime
        )

    return query

# ==========================================
# 1. REPORTS SUMMARY - KPI
# ==========================================

@router.get("/summary")
def get_reports_summary(
    start_date: date | None = Query(None),
    end_date: date | None = Query(None),
    db: Session = Depends(get_db)
):
    validate_date_range(start_date, end_date)

    query = (
        db.query(
            func.coalesce(
                func.sum(Payment.total_amount), 0
            ).label("total_revenue"),
            func.count(
                distinct(Payment.order_id)
            ).label("paid_orders")
        )
        .filter(
            Payment.status == "completed"
        )
    )

    query = apply_date_filter(
        query,
        Payment.created_at,
        start_date,
        end_date
    )

    result = query.one()

    total_revenue = result.total_revenue or Decimal("0")
    paid_orders = result.paid_orders or 0

    average_order_value = (
        total_revenue / paid_orders
        if paid_orders > 0
        else Decimal("0")
    )

    return {
        "total_revenue": round(
            float(total_revenue), 2
        ),
        "paid_orders": paid_orders,
        "average_order_value": round(
            float(average_order_value), 2
        )
    }


# ==========================================
# 2. DAILY REVENUE
# ==========================================

@router.get("/daily-revenue")
def get_daily_revenue(
    start_date: date | None = Query(None),
    end_date: date | None = Query(None),
    db: Session = Depends(get_db)
):
    validate_date_range(start_date, end_date)

    # Group by UTC calendar day
    payment_day = func.date(
        func.timezone("America/New_York", Payment.created_at)
    )

    query = (
        db.query(
            payment_day.label("date"),
            func.sum(
                Payment.total_amount
            ).label("revenue")
        )
        .filter(
            Payment.status == "completed"
        )
    )

    query = apply_date_filter(
        query,
        Payment.created_at,
        start_date,
        end_date
    )

    results = (
        query
        .group_by(payment_day)
        .order_by(payment_day)
        .all()
    )

    return [
        {
            "date": str(row.date),
            "revenue": round(
                float(row.revenue), 2
            )
        }
        for row in results
    ]


# ==========================================
# 3. TOP 5 SELLING PRODUCTS
# ==========================================

@router.get("/top-products")
def get_top_products(
    start_date: date | None = Query(None),
    end_date: date | None = Query(None),
    db: Session = Depends(get_db)
):
    validate_date_range(start_date, end_date)

    query = (
        db.query(
            Product.id.label("product_id"),
            Product.name.label("product_name"),
            func.sum(
                OrderItem.quantity
            ).label("total_quantity"),
            func.sum(
                OrderItem.quantity * OrderItem.unit_price
            ).label("total_revenue")
        )
        .join(
            OrderItem,
            Product.id == OrderItem.product_id
        )
        .join(
            OrderGuest,
            OrderItem.guest_id == OrderGuest.id
        )
        .join(
            Order,
            OrderGuest.order_id == Order.id
        )
        .filter(
            OrderItem.status == "sent",
            Order.status != "cancelled"
        )
    )

    # Filter products by the order creation date
    query = apply_date_filter(
        query,
        Order.created_at,
        start_date,
        end_date
    )

    results = (
        query
        .group_by(
            Product.id,
            Product.name
        )
        .order_by(
            func.sum(OrderItem.quantity).desc(),
            Product.id
        )
        .limit(5)
        .all()
    )

    return [
        {
            "product_id": row.product_id,
            "product_name": row.product_name,
            "total_quantity": int(
                row.total_quantity
            ),
            "total_revenue": round(
                float(row.total_revenue), 2
            )
        }
        for row in results
    ]


# ==========================================
# 4. REVENUE BY PAYMENT METHOD
# ==========================================

@router.get("/payment-methods")
def get_payment_methods(
    start_date: date | None = Query(None),
    end_date: date | None = Query(None),
    db: Session = Depends(get_db)
):
    validate_date_range(start_date, end_date)

    query = (
        db.query(
            Payment.payment_method.label("method"),
            func.sum(
                Payment.total_amount
            ).label("total_revenue"),
            func.count(
                Payment.id
            ).label("total_transactions")
        )
        .filter(
            Payment.status == "completed"
        )
    )

    query = apply_date_filter(
        query,
        Payment.created_at,
        start_date,
        end_date
    )

    results = (
        query
        .group_by(
            Payment.payment_method
        )
        .order_by(
            func.sum(Payment.total_amount).desc()
        )
        .all()
    )

    return [
        {
            "method": row.method,
            "total_revenue": round(
                float(row.total_revenue), 2
            ),
            "total_transactions": row.total_transactions
        }
        for row in results
    ]


# ==========================================
# 5. SALES SUMMARY
# ==========================================

@router.get("/sales-summary")
def get_sales_summary(
    start_date: date | None = Query(None),
    end_date: date | None = Query(None),
    db: Session = Depends(get_db)
):
    validate_date_range(start_date, end_date)

    # Total non-cancelled orders
    total_query = (
        db.query(func.count(Order.id))
        .filter(
            Order.status != "cancelled"
        )
    )

    total_query = apply_date_filter(
        total_query,
        Order.created_at,
        start_date,
        end_date
    )

    total_orders = total_query.scalar() or 0

    # Closed orders
    closed_query = (
        db.query(func.count(Order.id))
        .filter(
            Order.status == "closed"
        )
    )

    closed_query = apply_date_filter(
        closed_query,
        Order.created_at,
        start_date,
        end_date
    )

    closed_orders = closed_query.scalar() or 0

    # Sent items from non-cancelled orders
    items_query = (
        db.query(
            func.sum(OrderItem.quantity)
        )
        .join(
            OrderGuest,
            OrderItem.guest_id == OrderGuest.id
        )
        .join(
            Order,
            OrderGuest.order_id == Order.id
        )
        .filter(
            OrderItem.status == "sent",
            Order.status != "cancelled"
        )
    )

    items_query = apply_date_filter(
        items_query,
        Order.created_at,
        start_date,
        end_date
    )

    items_sold = items_query.scalar() or 0

    average_items = (
        items_sold / total_orders
        if total_orders > 0
        else 0
    )

    return {
        "total_orders": total_orders,
        "closed_orders": closed_orders,
        "items_sold": int(items_sold),
        "average_items_per_order": round(
            average_items, 2
        )
    }
