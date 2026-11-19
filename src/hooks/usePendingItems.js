export default function usePendingItems({
  setPendingGuestOrders,
  closeItemModal,
}) {

  // =========================
  // REMOVE PENDING QUANTITY
  // =========================

  const removePendingQuantity = (
    guestNumber,
    productId,
    quantityToRemove
  ) => {

    setPendingGuestOrders((previousOrders) => {

      const guestItems =
        previousOrders[guestNumber] || [];

      let remainingToRemove = quantityToRemove;

      const updatedItems = [];

      guestItems.forEach((product) => {

        if (
          product.id === productId &&
          remainingToRemove > 0
        ) {
          remainingToRemove -= 1;
          return;
        }

        updatedItems.push(product);

      });

      return {
        ...previousOrders,
        [guestNumber]: updatedItems,
      };

    });

    closeItemModal();
  };


  // =========================
  // MOVE PENDING QUANTITY
  // =========================

  const movePendingQuantity = (
    fromGuest,
    toGuest,
    productId,
    quantityToMove
  ) => {

    if (fromGuest === toGuest) {
      return;
    }

    setPendingGuestOrders((previousOrders) => {

      const sourceItems =
        previousOrders[fromGuest] || [];

      const destinationItems =
        previousOrders[toGuest] || [];

      let remainingToMove = quantityToMove;

      const updatedSource = [];
      const itemsToMove = [];

      sourceItems.forEach((product) => {

        if (
          product.id === productId &&
          remainingToMove > 0
        ) {
          itemsToMove.push(product);
          remainingToMove -= 1;
        } else {
          updatedSource.push(product);
        }

      });

      return {
        ...previousOrders,

        [fromGuest]: updatedSource,

        [toGuest]: [
          ...destinationItems,
          ...itemsToMove,
        ],
      };

    });

    closeItemModal();
  };


  // =========================
  // RETURN FUNCTIONS
  // =========================

  return {
    removePendingQuantity,
    movePendingQuantity,
  };

}