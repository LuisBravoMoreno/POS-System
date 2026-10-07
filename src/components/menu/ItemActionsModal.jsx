import {
  Trash2,
  ArrowRight,
  Info,
  X,
} from "lucide-react";


export default function ItemActionsModal({
  item,
  onRemove,
  onMove,
  onDetails,
  onClose,
}) {

  return (

    <div className="item-modal-overlay">

      <div className="item-actions-modal">


        <div className="item-modal-header">

          <div>

            <div className="item-modal-title">
              {item.name}
            </div>

            <div className="item-modal-subtitle">

              {item.quantity > 1 &&
                `x${item.quantity} · `}

              $
              {(
                item.price *
                item.quantity
              ).toFixed(2)}

            </div>

          </div>


          <button
            className="item-modal-close"
            onClick={onClose}
          >
            <X size={18} />
          </button>

        </div>


        <div className="item-actions-list">


          <button
            className="item-action-button item-action-remove"
            onClick={onRemove}
          >

            <Trash2 size={19} />

            <span>
              Remove
            </span>

          </button>


          <button
            className="item-action-button"
            onClick={onMove}
          >

            <ArrowRight size={19} />

            <span>
              Move to Guest
            </span>

          </button>


          <button
            className="item-action-button"
            onClick={onDetails}
          >

            <Info size={19} />

            <span>
              Item Details
            </span>

          </button>


        </div>


        <button
          className="item-modal-cancel"
          onClick={onClose}
        >
          Cancel
        </button>


      </div>

    </div>

  );

}