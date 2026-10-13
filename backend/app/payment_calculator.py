from decimal import Decimal, ROUND_HALF_UP

def money(value):
    return Decimal(str(value)).quantize(
        Decimal("0.01"),
        rounding=ROUND_HALF_UP
    )


def calculate_subtotal(items):
    return money(sum(
        (
            Decimal(str(item.unit_price)) * item.quantity
            for item in items
            if item.status == "sent"
        ),
        Decimal("0")
    ))


def calculate_tax(subtotal, tax_rate):
    return money(
        subtotal * Decimal(str(tax_rate)) / 100
    )


def calculate_tip(subtotal, tip_rate):
    return money(
        subtotal * Decimal(str(tip_rate)) / 100
    )


def calculate_total(items, tax_rate=0, tip_rate=0):
    subtotal = calculate_subtotal(items)
    tax = calculate_tax(subtotal, tax_rate)
    tip = calculate_tip(subtotal, tip_rate)

    return {
        "subtotal": subtotal,
        "tax": tax,
        "tip": tip,
        "total": money(subtotal + tax + tip)
    }