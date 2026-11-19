import { useEffect, useState } from "react";
import "./MenuScreen.css";

import PaymentSuccess from "../components/payment/PaymentSuccess";
import MenuSidebar from "../components/menu/MenuSidebar";
import CategoryGrid from "../components/menu/CategoryGrid";
import GuestSelector from "../components/menu/GuestSelector";
import ProductGrid from "../components/menu/ProductGrid";
import NavigationButtons from "../components/menu/NavigationButtons";

import ItemModals from "../components/menu/ItemModals";
import PaymentModal from "../components/payment/PaymentModal";
import KitchenReceipt from "../components/receipts/KitchenReceipt";

const API_URL = "http://127.0.0.1:8000";


export default function MenuScreen({
  table,
  onBack,
}) {

  /* =========================
     STATES
  ========================= */
  const [showKitchenReceipt, setShowKitchenReceipt] =
  useState(false);

const [kitchenReceiptData, setKitchenReceiptData] =
  useState(null);
  const [showPaymentSuccess, setShowPaymentSuccess] = useState(false);
  const [paymentSuccessData, setPaymentSuccessData] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentOrderData, setPaymentOrderData] = useState(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [categories, setCategories] =
    useState([]);

  const [categoryProducts, setCategoryProducts] =
    useState([]);

  const [selectedCategory, setSelectedCategory] =
    useState(null);

  const [selectedGuest, setSelectedGuest] =
    useState(null);


  // Productos que YA fueron enviados
  // y existen en PostgreSQL.
  const [guestOrders, setGuestOrders] =
    useState({});


  // Productos NUEVOS seleccionados
  // por el cajero.
  // Todavía NO existen en PostgreSQL.
  const [
    pendingGuestOrders,
    setPendingGuestOrders,
  ] = useState({});


  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState(null);


  /* =========================
     ITEM ACTION STATES
  ========================= */

  const [
    selectedCheckItem,
    setSelectedCheckItem,
  ] = useState(null);


  const [
    activeItemModal,
    setActiveItemModal,
  ] = useState(null);


  /* =========================
     BUILD SENT ITEMS
  ========================= */

  /*
    Esta función convierte la respuesta
    de FastAPI al formato que utiliza
    nuestro MenuSidebar.

    Solamente incluye status = sent.

    Los voided permanecen en PostgreSQL
    pero NO aparecen en el Check.
  */

  const buildGuestOrders = (
    orderData
  ) => {

    const loadedGuestOrders = {};


    orderData.guests.forEach(
      (guest) => {

        const sentItems =
          guest.items

            .filter(
              (item) =>
                item.status === "sent"
            )

            .map((item) => ({

              id:
                item.id,

              product_id:
                item.product_id,

              name:
                item.product_name,

              price:
                Number(
                  item.unit_price
                ),

              quantity:
                item.quantity,

              status:
                item.status,

            }));


        loadedGuestOrders[
          guest.guest_number
        ] = sentItems;

      }
    );


    return loadedGuestOrders;

  };


  /* =========================
     RELOAD ORDER
  ========================= */

  /*
    Después de modificar algo que YA
    existe en PostgreSQL, volvemos
    a consultar la orden.

    PostgreSQL continúa siendo nuestra
    fuente de verdad.
  */

  const reloadOrder = async () => {

    const response = await fetch(
      `${API_URL}/orders/${table.orderId}`
    );


    if (!response.ok) {

      throw new Error(
        `HTTP error: ${response.status}`
      );

    }


    const orderData =
      await response.json();


    const loadedGuestOrders =
      buildGuestOrders(
        orderData
      );


    setGuestOrders(
      loadedGuestOrders
    );


    return orderData;

  };


  /* =========================
     LOAD EXISTING ORDER
  ========================= */

  useEffect(() => {

    if (!table.order) {
      return;
    }


    const loadedGuestOrders =
      buildGuestOrders(
        table.order
      );


    setGuestOrders(
      loadedGuestOrders
    );

  }, [table.order]);


  /* =========================
     LOAD CATEGORIES
  ========================= */

  useEffect(() => {

    const loadCategories = async () => {

      try {

        setLoading(true);
        setError(null);


        const response = await fetch(
          `${API_URL}/categories`
        );


        if (!response.ok) {

          throw new Error(
            `HTTP error: ${response.status}`
          );

        }


        const data =
          await response.json();


        setCategories(data);


      } catch (error) {

        console.error(
          "Error loading categories:",
          error
        );


        setError(
          "Could not load categories."
        );


      } finally {

        setLoading(false);

      }

    };


    loadCategories();

  }, []);


  /* =========================
     CATEGORY
  ========================= */

  const handleCategoryClick =
    async (category) => {

      setSelectedCategory(
        category
      );

      setSelectedGuest(null); /*borra el guest seleccionado , limpia los productos anteriores */

      setCategoryProducts([]);

      setError(null);


      try {

        const response = await fetch(
          `${API_URL}/categories/${category.id}/products`
        );


        if (!response.ok) {

          throw new Error(
            `HTTP error: ${response.status}`
          );

        }


        const data =
          await response.json(); /* data podria contener el json con las categorias */


        setCategoryProducts(
          data
        );


      } catch (error) {

        console.error(
          "Error loading products:",
          error
        );


        setError(
          "Could not load products."
        );

      }

    };


  /* =========================
     ADD PRODUCT
  ========================= */

  const addProductToGuest =
    (product) => {

      if (!selectedGuest) {
        return;
      }


      setPendingGuestOrders(
        (previousOrders) => {

          const currentGuestOrder =
            previousOrders[
              selectedGuest
            ] || [];


          return {

            ...previousOrders,

            [selectedGuest]: [
              ...currentGuestOrder,
              product,
            ],

          };

        }
      );

    };


  /* =========================
     OPEN ITEM ACTIONS
  ========================= */

  const openItemActions =
    (item) => {

      setSelectedCheckItem(
        item
      );

      setActiveItemModal(
        "actions"
      );

    };


  /* =========================
     CLOSE ITEM MODALS
  ========================= */

  const closeItemModal = () => {

    setActiveItemModal(
      null
    );

    setSelectedCheckItem(
      null
    );

  };


  /* =========================
     REMOVE PENDING QUANTITY
  ========================= */

  /*
    Un pending todavía NO existe
    en PostgreSQL.

    Por eso simplemente quitamos
    unidades del state de React.
  */

  const removePendingQuantity = (
    guestNumber,
    productId,
    quantityToRemove
  ) => {

    setPendingGuestOrders(
      (previousOrders) => {

        const guestItems =
          previousOrders[
            guestNumber
          ] || [];


        let remainingToRemove =
          quantityToRemove;


        const updatedItems = [];


        guestItems.forEach(
          (product) => {

            if (
              product.id ===
                productId &&
              remainingToRemove > 0
            ) {

              remainingToRemove -=
                1;

              return;

            }


            updatedItems.push(
              product
            );

          }
        );


        return {

          ...previousOrders,

          [guestNumber]:
            updatedItems,

        };

      }
    );


    closeItemModal();

  };


  /* =========================
     VOID SENT ITEM
  ========================= */

  /*
    Un producto SENT ya existe
    en PostgreSQL.

    NO lo borramos directamente.

    Utilizamos nuestro endpoint
    de VOID para mantener historial.
  */

  const voidSentItem = async (
    itemId,
    quantity
  ) => {

    try {

      setError(null);


      const response = await fetch(
        `${API_URL}/orders/${table.orderId}/items/${itemId}/void`,
        {
          method: "PATCH",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            quantity:
              quantity,
          }),
        }
      );


      if (!response.ok) {

        const errorData =
          await response.json();


        throw new Error(
          errorData.detail ||
          `HTTP error: ${response.status}`
        );

      }


      const voidResult =
        await response.json();


      console.log(
        "Item voided successfully:",
        voidResult
      );


      /*
        No modificamos manualmente
        guestOrders.

        Volvemos a PostgreSQL para
        obtener la orden actualizada.
      */

      await reloadOrder();


      closeItemModal();


    } catch (error) {

      console.error(
        "Error voiding item:",
        error
      );


      setError(
        error.message ||
        "Could not remove item."
      );

    }

  };


  /* =========================
     MOVE PENDING QUANTITY
  ========================= */

  /*
    Un producto PENDING todavía
    no existe en PostgreSQL.

    Por eso el movimiento ocurre
    solamente en React.
  */

  const movePendingQuantity = (
    fromGuest,
    toGuest,
    productId,
    quantityToMove
  ) => {

    if (
      fromGuest === toGuest
    ) {
      return;
    }


    setPendingGuestOrders(
      (previousOrders) => {

        const sourceItems =
          previousOrders[
            fromGuest
          ] || [];


        const destinationItems =
          previousOrders[
            toGuest
          ] || [];


        let remainingToMove =
          quantityToMove;


        const updatedSource =
          [];

        const itemsToMove =
          [];


        sourceItems.forEach(
          (product) => {

            if (
              product.id ===
                productId &&
              remainingToMove > 0
            ) {

              itemsToMove.push(
                product
              );

              remainingToMove -=
                1;

            } else {

              updatedSource.push(
                product
              );

            }

          }
        );


        return {

          ...previousOrders,

          [fromGuest]:
            updatedSource,

          [toGuest]: [
            ...destinationItems,
            ...itemsToMove,
          ],

        };

      }
    );


    closeItemModal();

  };


  /* =========================
     MOVE SENT ITEM
  ========================= */

  /*
    Un producto SENT ya existe
    en PostgreSQL.

    MOVE TOTAL:
    El backend cambia el guest_id
    del OrderItem.

    MOVE PARCIAL:
    El backend reduce la cantidad
    original y crea un nuevo
    OrderItem para el Guest destino.
  */

  const moveSentItem = async (
    itemId,
    destinationGuest,
    quantity
  ) => {

    try {

      setError(null);


      const response = await fetch(
        `${API_URL}/orders/${table.orderId}/items/${itemId}/move`,
        {
          method: "PATCH",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            guest_number:
              destinationGuest,

            quantity:
              quantity,
          }),
        }
      );


      if (!response.ok) {

        const errorData =
          await response.json();


        throw new Error(
          errorData.detail ||
          `HTTP error: ${response.status}`
        );

      }


      const moveResult =
        await response.json();


      console.log(
        "Item moved successfully:",
        moveResult
      );


      /*
        No modificamos guestOrders
        manualmente.

        PostgreSQL continúa siendo
        nuestra fuente de verdad.
      */

      await reloadOrder();


      closeItemModal();


    } catch (error) {

      console.error(
        "Error moving sent item:",
        error
      );


      setError(
        error.message ||
        "Could not move item."
      );

    }

  };


  /* =========================
     SEND ORDER
  ========================= */

  const sendOrder = async () => {

    const itemsToSend =
      [];


    Object.entries(
      pendingGuestOrders
    ).forEach(
      ([guestNumber, products]) => {

        /*
          Agrupamos solamente productos
          repetidos dentro del MISMO
          Send Order.
        */

        const groupedProducts =
          {};


        products.forEach(
          (product) => {

            const productId =
              product.id;


            if (
              groupedProducts[
                productId
              ]
            ) {

              groupedProducts[
                productId
              ].quantity += 1;

            } else {

              groupedProducts[
                productId
              ] = {

                guest_number:
                  Number(
                    guestNumber
                  ),

                product_id:
                  productId,

                quantity:
                  1,

              };

            }

          }
        );


        itemsToSend.push(
          ...Object.values(
            groupedProducts
          )
        );

      }
    );


    /* =========================
       EMPTY SEND
    ========================= */

    if (
      itemsToSend.length === 0
    ) {
      return false;
    }


    try {

      setError(null);


      /* =========================
         SEND TO BACKEND
      ========================= */

      const response = await fetch(
        `${API_URL}/orders/${table.orderId}/send`,
        {
          method:
            "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            items:
              itemsToSend,
          }),
        }
      );


      if (!response.ok) {

        const errorData =
          await response.json();


        throw new Error(
          errorData.detail ||
          `HTTP error: ${response.status}`
        );

      }


      const sendResult =
        await response.json();


      console.log(
        "Order sent successfully:",
        sendResult
      );


      /* =========================
         RELOAD FROM DATABASE
      ========================= */

      const updatedOrder = await reloadOrder();

      const receiptGuests = Object.entries(
        pendingGuestOrders
      ).map(([guestNumber, products]) => {
      const groupedProducts = {};

      products.forEach((product) => {
        if (!groupedProducts[product.id]) {
          groupedProducts[product.id] = {
            id: product.id,
            product_name: product.name,
            quantity: 0,
            status: "sent",
          };
        }

        groupedProducts[product.id].quantity += 1;
      });

      return {
        id: Number(guestNumber),
        guest_number: Number(guestNumber),
        items: Object.values(groupedProducts),
      };
    }).filter((guest) => guest.items.length > 0);

    setKitchenReceiptData({
      order: updatedOrder.order,
      guests: receiptGuests,
    });

    setShowKitchenReceipt(true);

    setPendingGuestOrders({});

    return true;

    } catch (error) {

      console.error(
        "Error sending order:",
        error
      );


      setError(
        error.message ||
        "Could not send order."
      );

      return false;

    }

  };

  /* =========================
     HANDLE PAYMENT
  ========================= */

const handlePayment = async () => {

  if (paymentLoading) return;

  try {

    setPaymentLoading(true);
    setError(null);

    /* =========================
        SEND PENDING PRODUCTS
    ========================= */

    if (canSendOrder) {

      const sentSuccessfully =
        await sendOrder();

      if (!sentSuccessfully) {
        return;
      }

    }

    /* =========================
        GET CURRENT ORDER
    ========================= */

    const orderData =
      await reloadOrder();

    /* =========================
        CHECK FOR SENT ITEMS
    ========================= */

    const hasSentItems =
      orderData.guests.some(
        (guest) =>
          guest.items.some(
            (item) =>
              item.status === "sent"
          )
      );

    /* =========================
        BLOCK EMPTY PAYMENT
    ========================= */

    if (!hasSentItems) {

      alert(
        "Cannot process payment. This order has no items."
      );

        return;

    }

    /* =========================
        OPEN PAYMENT MODAL
    ========================= */

    setPaymentOrderData(orderData);
    setShowPaymentModal(true);

  } catch (error) {

    console.error(
      "Payment error:",
      error
    );

    setError(
      error.message ||
      "Could not open payment."
    );

  } finally {

    setPaymentLoading(false);

  }

};


/* =========================
   HANDLE CASH PAYMENT SUCCESS
========================= */

const handleCashPaymentSuccess = async (paymentResult) => {
  try {
    setError(null);

    console.log("Cash payment completed:", paymentResult);

    // The payment has already been saved in PostgreSQL.
    // Close PaymentModal and display PaymentSuccess.
    setShowPaymentModal(false);
    setPaymentOrderData(null);

    setPaymentSuccessData({
      ...paymentResult,
      orderNumber: paymentResult.order_id,
      tableNumber: table.id,
    });

    setShowPaymentSuccess(true);

    // Refresh the order only if it remains open.
    if (paymentResult.order_status !== "closed") {
      await reloadOrder();
    }
  } catch (error) {
    console.error("Error refreshing after payment:", error);

    // Payment was already recorded. Keep the success screen.
    setError(
      "Payment was recorded, but the order could not be refreshed."
    );
  }
};
/* =========================
    CLOSE SUCCESS SCREEN
========================= */

const handlePaymentSuccessDone = () => {
  const isClosed = paymentSuccessData?.order_status === "closed";

  setShowPaymentSuccess(false);
  setPaymentSuccessData(null);

  if (isClosed) {
    onBack();
  }
};

/* =========================
    CANCEL ORDER
========================= */

const cancelOrder = async () => {

  /*
    Confirmation before cancelling
    the entire order.
  */

const confirmed = window.confirm(
    "Are you sure you want to cancel this order?"
);


    if (!confirmed) {
      return;
    }


    try {

      setError(null);


      const response = await fetch(
        `${API_URL}/orders/${table.orderId}/cancel`,
        {
          method: "PATCH",
        }
      );


      if (!response.ok) {

        const errorData =
          await response.json();


        throw new Error(
          errorData.detail ||
          `HTTP error: ${response.status}`
        );

      }


      const cancelResult =
        await response.json();


      console.log(
        "Order cancelled successfully:",
      cancelResult
      );


      /*
        The order is no longer OPEN,
        therefore the table becomes
        available again.
      */

      onBack();


    } catch (error) {

      console.error(
        "Error cancelling order:",
        error
      );


      setError(
        error.message ||
        "Could not cancel order."
      );

  }

};


/* =========================
   CLOSE ORDER / PAYMENT
========================= */

const closeOrder = async () => {

  try {

    setError(null);


    const response = await fetch(
      `${API_URL}/orders/${table.orderId}/close`,
      {
        method: "PATCH",
      }
    );


    if (!response.ok) {

      const errorData =
        await response.json();


      throw new Error(
        errorData.detail ||
        `HTTP error: ${response.status}`
      );

    }


    const closeResult =
      await response.json();


    console.log(
      "Order closed successfully:",
      closeResult
    );


    /*
      Después de cerrar la orden
      regresamos a Tables.

      La mesa ya no debería tener
      una orden OPEN.
    */

    onBack();


  } catch (error) {

    console.error(
      "Error closing order:",
      error
    );


    setError(
      error.message ||
      "Could not close order."
    );

  }

};


  /* =========================
     BACK TO CATEGORIES
  ========================= */

  const goBackToCategories =
    () => {

      setSelectedCategory(
        null
      );

      setSelectedGuest(
        null
      );

      setCategoryProducts(
        []
      );

      setError(
        null
      );

    };


  /* =========================
     CAN SEND ORDER
  ========================= */

  const canSendOrder =
    Object.values(
      pendingGuestOrders
    ).some(
      (products) =>
        products.length > 0
    );


  /* =========================
     RENDER
  ========================= */

  return (

    <div className="menu-container">


      {/* =========================
          CHECK
      ========================= */}

      <MenuSidebar

        table={
          table
        }

        selectedGuest={
          selectedGuest
        }

        setSelectedGuest={
          setSelectedGuest
        }

        guestOrders={
          guestOrders
        }

        pendingGuestOrders={
          pendingGuestOrders
        }

        onItemClick={
          openItemActions
        }

      />


      {/* =========================
          MAIN
      ========================= */}

      <main className="menu-main">


        {!selectedCategory ? (

          <>


            {loading && (

              <div>
                Loading categories...
              </div>

            )}


            {error && (

              <div className="empty-category">

                {error}

              </div>

            )}


            {!loading &&
              !error && (

                <CategoryGrid

                  categories={
                    categories
                  }

                  onCategoryClick={
                    handleCategoryClick
                  }

                />

              )}


          </>

        ) : (

          <>


            {/* CATEGORY TITLE */}

            <h1 className="category-title">

              {
                selectedCategory.name
              }

            </h1>


            {/* GUEST SELECTOR */}

            <GuestSelector

              guestCount={
                table.guests
              }

              selectedGuest={
                selectedGuest
              }

              onSelectGuest={
                setSelectedGuest
              }

            />


            {/* PRODUCTS */}

            {error ? (

              <div className="empty-category">

                {error}

              </div>

            ) : (

              <ProductGrid

                products={
                  categoryProducts
                }

                selectedGuest={
                  selectedGuest
                }

                onProductClick={
                  addProductToGuest
                }

              />

            )}


            {/* EMPTY CATEGORY */}

            {!error &&
              categoryProducts.length ===
                0 && (

                <div className="empty-category">

                  No products found for{" "}

                  {
                    selectedCategory.name
                  }.

                </div>

              )}


          </>

        )}


        {/* =========================
            NAVIGATION
        ========================= */}

        <NavigationButtons
          showCategories={Boolean(selectedCategory)}
          onCategories={goBackToCategories}
          onTables={onBack}
          onSendOrder={sendOrder}
          canSendOrder={canSendOrder}
          onPayment={handlePayment}
          onCancelOrder={cancelOrder}
          orderType={table.orderType}
        />
        
      </main>


        {/* =========================
            ITEM MODALS
          ========================= */}

        <ItemModals
          activeItemModal={activeItemModal}
          selectedCheckItem={selectedCheckItem}
          guestCount={table.guests}
          setActiveItemModal={setActiveItemModal}
          closeItemModal={closeItemModal}
          removePendingQuantity={removePendingQuantity}
          voidSentItem={voidSentItem}
          movePendingQuantity={movePendingQuantity}
          moveSentItem={moveSentItem}
        />

        {/* PAYMENT MODAL */}
        {showPaymentModal && paymentOrderData && (
          <PaymentModal
            orderData={paymentOrderData}
            onPaymentSuccess={handleCashPaymentSuccess}
            onClose={() => {
              setShowPaymentModal(false);
              setPaymentOrderData(null);
            }}
          />
        )}

        {/* PAYMENT SUCCESS MODAL */}
        {showPaymentSuccess && paymentSuccessData && (
          <PaymentSuccess
            paymentResult={paymentSuccessData}
            orderNumber={paymentSuccessData.orderNumber}
            tableNumber={paymentSuccessData.tableNumber}
            onDone={handlePaymentSuccessDone}
          />
        )}

        {showKitchenReceipt && kitchenReceiptData && (
          <div className="kitchen-preview-overlay">
            <div className="kitchen-preview-modal">

              <div className="kitchen-preview-scroll">
                <KitchenReceipt
                  orderData={kitchenReceiptData}
                />
              </div>

              <div className="kitchen-preview-actions">
                <button
                  type="button"
                  onClick={() => {
                    setShowKitchenReceipt(false);
                    setKitchenReceiptData(null);
                  }}
                >
                  Close Preview
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                >
                 Print Kitchen Order  
                </button>

              </div>
            </div>
          </div>
        )}
    </div>

  );

}