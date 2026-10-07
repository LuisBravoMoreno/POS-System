import { useState } from "react";

import {
  Minus,
  Plus,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";


export default function MoveItemModal({
  item,
  guestCount,
  onBack,
  onConfirm,
}) {

  const [destinationGuest, setDestinationGuest] =
    useState(null);

  const [quantity, setQuantity] =
    useState(item.quantity);


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
              Move Item to Guest
            </div>

            <div className="item-modal-subtitle">

              {item.name}

              {item.quantity > 1 &&
                ` x${item.quantity}`}

            </div>

          </div>

        </div>


        <div className="item-operation-question">

          Quantity to move

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


        <div className="item-operation-question">

          Move to

        </div>


        <div className="move-guest-grid">


          {Array.from(
            { length: guestCount },
            (_, index) => {

              const guestNumber =
                index + 1;


              const isCurrentGuest =
                guestNumber ===
                item.guestNumber;


              return (

                <button

                  key={guestNumber}

                  disabled={
                    isCurrentGuest
                  }

                  className={
                    destinationGuest ===
                    guestNumber
                      ? "move-guest-selected"
                      : ""
                  }

                  onClick={() =>
                    setDestinationGuest(
                      guestNumber
                    )
                  }

                >

                  Guest {guestNumber}

                  {isCurrentGuest && (
                    <small>
                      Current
                    </small>
                  )}

                </button>

              );

            }
          )}


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
            className="primary-modal-button"
            disabled={
              !destinationGuest
            }
            onClick={() =>
              onConfirm(
                destinationGuest,
                quantity
              )
            }
          >

            <ArrowRight size={17} />

            Move

          </button>


        </div>


      </div>

    </div>

  );

}