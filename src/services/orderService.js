const API_URL = "http://127.0.0.1:8000";

// =========================
// GET ORDER BY ID
// =========================

export const getOrderById = async (orderId) => {

  const response = await fetch(
    `${API_URL}/orders/${orderId}`
  );

  if (!response.ok) {
    throw new Error(
      `HTTP error: ${response.status}`
    );
  }

  const orderData = await response.json();

  return orderData;
};

// =========================
// VOID SENT ITEM
// =========================

export const voidOrderItem = async (
  orderId,
  itemId,
  quantity
) => {

  const response = await fetch(
    `${API_URL}/orders/${orderId}/items/${itemId}/void`,
    {
      method: "PATCH",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        quantity: quantity,
      }),
    }
  );

  if (!response.ok) {

    const errorData = await response.json();

    throw new Error(
      errorData.detail ||
      `HTTP error: ${response.status}`
    );

  }

  const voidResult = await response.json();

  return voidResult;

};
/* =========================
   MOVE SENT ITEM
========================= */

export const moveOrderItem = async (
  orderId,
  itemId,
  destinationGuest,
  quantity
) => {

  const response = await fetch(
    `${API_URL}/orders/${orderId}/items/${itemId}/move`,
    {
      method: "PATCH",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        guest_number: destinationGuest,
        quantity: quantity,
      }),
    }
  );

  if (!response.ok) {

    const errorData = await response.json();

    throw new Error(
      errorData.detail ||
      `HTTP error: ${response.status}`
    );

  }

  const moveResult = await response.json();

  return moveResult;

};