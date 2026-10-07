import { X } from "lucide-react";


export default function ItemDetailsModal({
  item,
  onClose,
}) {

  const lineTotal =
    item.price *
    item.quantity;


  return (

    <div className="item-modal-overlay">

      <div className="item-operation-modal">


        <div className="item-modal-header">

          <div>

            <div className="item-modal-title">
              Item Details
            </div>

            <div className="item-modal-subtitle">
              {item.name}
            </div>

          </div>


          <button
            className="item-modal-close"
            onClick={onClose}
          >
            <X size={18} />
          </button>

        </div>


        <div className="item-details-list">


          <div className="item-detail-row">

            <span>
              Price
            </span>

            <strong>
              ${item.price.toFixed(2)}
            </strong>

          </div>


          <div className="item-detail-row">

            <span>
              Quantity
            </span>

            <strong>
              {item.quantity}
            </strong>

          </div>


          <div className="item-detail-row">

            <span>
              Line Total
            </span>

            <strong>
              ${lineTotal.toFixed(2)}
            </strong>

          </div>


          <div className="item-detail-row">

            <span>
              Status
            </span>

            <strong className="pending-status">
              Pending
            </strong>

          </div>


          <div className="item-detail-row">

            <span>
              Guest
            </span>

            <strong>
              {item.guestNumber}
            </strong>

          </div>


        </div>


        <button
          className="item-details-close"
          onClick={onClose}
        >
          Close
        </button>


      </div>

    </div>

  );

}