import Logo from "../Logo";
import { ReceiptText } from "lucide-react";


export default function MenuSidebar({
  table,
  selectedGuest,
  setSelectedGuest,
  guestOrders,
  pendingGuestOrders,
  onItemClick,
}) {

  const isTakeout = table.orderType === "takeout";

  return (

    <aside className="menu-sidebar">


      <div className="menu-logo">
        <Logo />
      </div>


      <div className="order-info">

        <div className="check-header">

          <ReceiptText
            className="check-bill-icon"
            size={19}
          />

          <span>
            Check
          </span>

        </div>


        <div className="order-details">

          {isTakeout ? (
            <>
              {/* TAKEOUT ORDER */}
              <div className="detail-item">
                <span className="detail-label">Order</span>
                <span className="detail-value">#{table.orderId}</span>
              </div>

              <div className="detail-divider"></div>

              <div className="detail-item">
                <span className="detail-label">Type</span>
                <span className="detail-value">To Go</span>
              </div>

              <div className="detail-divider"></div>

              <div className="detail-item">
                <span className="detail-label">Customer</span>
                <span className="detail-value">{table.customerName}</span>
              </div>
            </>
          ) : (
            <>
              {/* DINE-IN ORDER */}
              <div className="detail-item">
                <span className="detail-label">Table</span>
                <span className="detail-value">{table.id}</span>
              </div>

              <div className="detail-divider"></div>

              <div className="detail-item">
                <span className="detail-label">
                  {table.guests === 1 ? "Guest" : "Guests"}
                </span>
                <span className="detail-value">{table.guests}</span>
              </div>
            </>
          )}

        </div>

      </div>


      {/* =========================
          GUEST LIST
      ========================= */}

      <div className="guest-list">


        {Array.from(
          { length: table.guests },
          (_, index) => {


            const guestNumber =
              index + 1;


            /* =========================
               SENT ITEMS
            ========================= */

            /*
              Estos productos YA existen
              en PostgreSQL.

              Cada item representa un row
              específico de order_items.

              NO agrupamos estos items
              porque queremos conservar
              cada Send Order / ronda.
            */

            const sentItems =
              guestOrders[
                guestNumber
              ] || [];


            /* =========================
               PENDING ITEMS
            ========================= */

            /*
              Estos productos todavía
              solamente existen en React.
            */

            const pendingItems =
              pendingGuestOrders[
                guestNumber
              ] || [];


            /* =========================
               GROUP PENDING ITEMS
            ========================= */

            /*
              Agrupamos solamente los
              productos PENDING de la
              ronda actual.

              Ejemplo:

              Agua
              Agua

              se muestra:

              Agua x2
            */

            const groupedPendingItems =
              [];


            pendingItems.forEach(
              (item) => {


                const existingItem =
                  groupedPendingItems.find(
                    (groupedItem) =>
                      groupedItem.productId ===
                      item.id
                  );


                if (existingItem) {

                  existingItem.quantity +=
                    1;

                } else {

                  groupedPendingItems.push({

                    productId:
                      item.id,

                    name:
                      item.name,

                    price:
                      Number(
                        item.price
                      ),

                    quantity:
                      1,

                  });

                }

              }
            );


            return (

              <div
                key={guestNumber}
                className="guest-check"
              >


                {/* =========================
                    GUEST
                ========================= */}

                <button

                  className={`guest-row ${
                    selectedGuest ===
                    guestNumber
                      ? "guest-row-selected"
                      : ""
                  }`}

                  onClick={() =>
                    setSelectedGuest(
                      guestNumber
                    )
                  }

                >

                  Guest {guestNumber}

                </button>


                {/* =========================
                    SENT ITEMS
                ========================= */}

                {sentItems.length > 0 && (

                  <div className="guest-items">


                    {sentItems.map(
                      (item) => {


                        const quantity =
                          item.quantity ?? 1;


                        const lineTotal =
                          Number(
                            item.price
                          ) * quantity;


                        return (

                          <button

                            key={item.id}

                            className="
                              guest-item
                              guest-item-sent
                              guest-item-clickable
                            "

                            onClick={() =>
                              onItemClick({

                                /*
                                  Guest al que
                                  pertenece el item.
                                */

                                guestNumber:
                                  guestNumber,


                                /*
                                  IMPORTANTE:

                                  Este es el ID
                                  real del row de
                                  order_items.

                                  Ejemplo:
                                  itemId = 11
                                */

                                itemId:
                                  item.id,


                                /*
                                  ID del producto.

                                  Ejemplo:
                                  Agua = 47
                                */

                                productId:
                                  item.product_id,


                                name:
                                  item.name,


                                price:
                                  Number(
                                    item.price
                                  ),


                                quantity:
                                  quantity,


                                /*
                                  MenuScreen utiliza
                                  este status para
                                  decidir:

                                  sent -> VOID DB
                                */

                                status:
                                  "sent",

                              })
                            }

                          >


                            <span>

                              {item.name}

                              {quantity > 1 &&
                                ` x${quantity}`}

                            </span>


                            <span>

                              $
                              {lineTotal.toFixed(
                                2
                              )}

                            </span>


                          </button>

                        );

                      }
                    )}


                  </div>

                )}


                {/* =========================
                    PENDING ITEMS
                ========================= */}

                {groupedPendingItems.length >
                  0 && (

                  <div className="guest-items">


                    {groupedPendingItems.map(
                      (item) => {


                        const lineTotal =
                          item.price *
                          item.quantity;


                        return (

                          <button

                            key={
                              `pending-${item.productId}`
                            }

                            className="
                              guest-item
                              guest-item-pending
                              guest-item-clickable
                            "

                            onClick={() =>
                              onItemClick({

                                guestNumber:
                                  guestNumber,


                                /*
                                  Pending todavía
                                  NO tiene itemId
                                  porque no existe
                                  en order_items.
                                */

                                productId:
                                  item.productId,


                                name:
                                  item.name,


                                price:
                                  item.price,


                                quantity:
                                  item.quantity,


                                /*
                                  MenuScreen utiliza
                                  este status para
                                  decidir:

                                  pending ->
                                  modificar React
                                */

                                status:
                                  "pending",

                              })
                            }

                          >


                            <span>

                              {item.name}

                              {item.quantity >
                                1 &&
                                ` x${item.quantity}`}

                            </span>


                            <span>

                              $
                              {lineTotal.toFixed(
                                2
                              )}

                            </span>


                          </button>

                        );

                      }
                    )}


                  </div>

                )}


              </div>

            );

          }
        )}


      </div>


    </aside>

  );

}