import ItemActionsModal from "./ItemActionsModal";
import RemoveItemModal from "./RemoveItemModal";
import MoveItemModal from "./MoveItemModal";
import ItemDetailsModal from "./ItemDetailsModals";

export default function ItemModals({
  activeItemModal,
  selectedCheckItem,
  guestCount,
  setActiveItemModal,
  closeItemModal,
  removePendingQuantity,
  voidSentItem,
  movePendingQuantity,
  moveSentItem,
}) {
  if (!selectedCheckItem) return null;

  return (
    <>
      {activeItemModal === "actions" && (
        <ItemActionsModal
          item={selectedCheckItem}
          onRemove={() => setActiveItemModal("remove")}
          onMove={() => setActiveItemModal("move")}
          onDetails={() => setActiveItemModal("details")}
          onClose={closeItemModal}
        />
      )}

      {activeItemModal === "remove" && (
        <RemoveItemModal
          item={selectedCheckItem}
          onBack={() => setActiveItemModal("actions")}
          onConfirm={(quantity) => {
            if (selectedCheckItem.status === "pending") {
              removePendingQuantity(
                selectedCheckItem.guestNumber,
                selectedCheckItem.productId,
                quantity
              );
            } else if (selectedCheckItem.status === "sent") {
              voidSentItem(selectedCheckItem.itemId, quantity);
            }
          }}
        />
      )}

      {activeItemModal === "move" && (
        <MoveItemModal
          item={selectedCheckItem}
          guestCount={guestCount}
          onBack={() => setActiveItemModal("actions")}
          onConfirm={(destinationGuest, quantity) => {
            if (selectedCheckItem.status === "pending") {
              movePendingQuantity(
                selectedCheckItem.guestNumber,
                destinationGuest,
                selectedCheckItem.productId,
                quantity
              );
            } else if (selectedCheckItem.status === "sent") {
              moveSentItem(
                selectedCheckItem.itemId,
                destinationGuest,
                quantity
              );
            }
          }}
        />
      )}

      {activeItemModal === "details" && (
        <ItemDetailsModal
          item={selectedCheckItem}
          onClose={closeItemModal}
        />
      )}
    </>
  );
}