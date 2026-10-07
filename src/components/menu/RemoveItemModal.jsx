import { useState } from "react";

import {
  Minus,
  Plus,
  Trash2,
  ArrowLeft,
} from "lucide-react";


export default function RemoveItemModal({
  item,
  onBack,
  onConfirm,
}) {

  const [quantity, setQuantity] =
    useState(1);


  const decreaseQuantity = () => {

    setQuantity(
      (current) =>
        Math.max(
          1,
          current - 1
        )
    );

  };


  const increaseQuantity = () => {

    setQuantity(
      (current) =>
        Math.min(
          item.quantity,
          current + 1
        )
    );

  };


  return (

    <div className="item-modal-overlay">

      <div className="item-operation-modal">


        <div className="item-modal-header">

          <div>

            <div className="item-modal-title">
              Remove Item
            </div>

            <div className="item-modal-subtitle">
              {item.name}
            </div>

          </div>

        </div>


        <div className="item-operation-price">

          ${item.price.toFixed(2)} each

        </div>


        <div className="item-operation-question">

          How many do you want to remove?

        </div>


        <div className="quantity-selector">


          <button
            onClick={
              decreaseQuantity
            }
            disabled={
              quantity === 1
            }
          >
            <Minus size={20} />
          </button>


          <span>
            {quantity}
          </span>


          <button
            onClick={
              increaseQuantity
            }
            disabled={
              quantity ===
              item.quantity
            }
          >
            <Plus size={20} />
          </button>


        </div>


        <div className="available-quantity">

          Available: {item.quantity}

        </div>


        <div className="item-modal-actions">


          <button
            className="secondary-modal-button"
            onClick={onBack}
          >

            <ArrowLeft size={17} />

            Back

          </button>


          <button
            className="danger-modal-button"
            onClick={() =>
              onConfirm(quantity)
            }
          >

            <Trash2 size={17} />

            Remove

          </button>


        </div>


      </div>

    </div>

  );

}