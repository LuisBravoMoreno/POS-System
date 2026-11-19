import { useEffect, useState } from "react";
import "./RestaurantDashboard.css";

import CreateOrder from "./CreateOrder";
import TablesView from "./TablesView";
import OrdersHistory from "./OrdersHistory";
import ReportsDashboard from "./ReportsDashboard";

import Sidebar from "../components/Sidebar";
import GuestModal from "../components/GuestModal";
import TakeoutOrderModal from "../components/TakeoutOrderModal";

import MenuScreen from "./MenuScreen";

const API_URL = "http://127.0.0.1:8000";

export default function RestaurantDashboard() {

  /* =========================
     TABLES STATE
  ========================= */

  const [tables, setTables] = useState(
    Array.from({ length: 10 }, (_, i) => ({
      id: i + 1,
      occupied: false,
      guests: 0,
      orderId: null,
    }))
  );

  const [selectedTable, setSelectedTable] =
    useState(null);

  const [guestCount, setGuestCount] =
    useState("");

  /* =========================
     NAVIGATION STATE
  ========================= */

  const [view, setView] =
    useState("create-order");

  const [activeSection, setActiveSection] =
    useState("create-order");

  const [activeOrder, setActiveOrder] =
    useState(null);

  const [menuReturnView, setMenuReturnView] = useState(null);

  /* =========================
     TAKEOUT STATE
  ========================= */

  const [takeoutModalOpen, setTakeoutModalOpen] =
    useState(false);

  const [takeoutSubmitting, setTakeoutSubmitting] =
    useState(false);

  /* =========================
     LOAD OPEN ORDERS
  ========================= */

  useEffect(() => {

    if (view !== "tables") {
      return;
    }

    const loadOpenOrders = async () => {

      try {

        const response = await fetch(
          `${API_URL}/orders/open`
        );

        if (!response.ok) {
          throw new Error(
            `HTTP error: ${response.status}`
          );
        }

        const openOrders = await response.json();

        setTables((currentTables) =>
          currentTables.map((table) => {

            const openOrder = openOrders.find(
              (order) =>
                order.table_number === table.id
            );

            if (openOrder) {
              return {
                ...table,
                occupied: true,
                guests: openOrder.guest_count,
                orderId: openOrder.id,
              };
            }

            return {
              ...table,
              occupied: false,
              guests: 0,
              orderId: null,
            };

          })
        );

      } catch (error) {

        console.error(
          "Error loading open orders:",
          error
        );

      }

    };

    loadOpenOrders();

  }, [view]);

  /* =========================
     SIDEBAR NAVIGATION
  ========================= */

  const handleSidebarNavigate = (section) => {

    setActiveSection(section);

    if (section === "create-order") {
      setView("create-order");
      setSelectedTable(null);
      setGuestCount("");
      setTakeoutModalOpen(false);
    }

    if (section === "orders-history" || section === "order-history" || section === "ordersHistory" || section === "orderHistory") {
      setView("orders-history");
      setTakeoutModalOpen(false);
      setSelectedTable(null);
    }
    // REPORTS NAVIGATION
    if (section === "reports") {
      setView("reports");
      setTakeoutModalOpen(false);
      setSelectedTable(null);
    }
  };

  /* =========================
     ORDER TYPE SELECTION
  ========================= */

  const handleSelectTables = () => {
    setTakeoutModalOpen(false);
    setView("tables");
  };

  const handleSelectTakeout = () => {
    setTakeoutModalOpen(true);
  };

  /* =========================
     TAKEOUT MODAL ACTIONS
  ========================= */

  const handleCloseTakeoutModal = () => {
    if (takeoutSubmitting) return;
    setTakeoutModalOpen(false);
  };

  const handleTakeoutContinue = async (customerName) => {
    if (takeoutSubmitting) return;

    const trimmedName = customerName.trim();
    if (!trimmedName) {
      window.alert("Customer name is required.");
      return;
    }

    setTakeoutSubmitting(true);

    try {
      const response = await fetch(`${API_URL}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          order_type: "takeout",
          customer_name: trimmedName,
          table_number: null,
          guest_count: 1,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        const detail = errorData?.detail;
        throw new Error(
          typeof detail === "string"
            ? detail
            : `Could not create order (HTTP ${response.status}).`
        );
      }

      const newOrder = await response.json();
      if (newOrder.id == null) {
        throw new Error("Server response did not include an order ID.");
      }

      console.log("New takeout order created:", newOrder);

      // Keep the MenuScreen 'table' prop compatible with existing code.
      setMenuReturnView(null);
      setActiveOrder({
        id: null,
        orderType: "takeout",
        tableNumber: null,
        customerName: trimmedName,
        guests: 1,
        orderId: newOrder.id,
      });

      setTakeoutModalOpen(false);
      setView("menu");
    } catch (error) {
      console.error("Error creating takeout order:", error);
      window.alert(error.message || "Could not create takeout order.");
    } finally {
      setTakeoutSubmitting(false);
    }
  };

  /* =========================
     TABLE CLICK
  ========================= */

  const handleTableClick = async (id) => {

    const table = tables.find(
      (t) => t.id === id
    );

    if (!table) {
      return;
    }

    // -------------------------
    // AVAILABLE TABLE
    // -------------------------

    if (!table.occupied) {

      setSelectedTable(id);
      setGuestCount("");

      return;
    }

    // -------------------------
    // OCCUPIED TABLE
    // -------------------------

    try {

      const response = await fetch(
        `${API_URL}/orders/${table.orderId}`
      );

      if (!response.ok) {
        throw new Error(
          `HTTP error: ${response.status}`
        );
      }

      const orderData = await response.json();

      console.log(
        "Existing order:",
        orderData
      );

      setMenuReturnView(null);
      setActiveOrder({
        id: table.id,
        orderType: "dine_in",
        tableNumber: table.id,
        customerName: null,
        guests: table.guests,
        orderId: table.orderId,
        order: orderData,
      });

      setView("menu");

    } catch (error) {

      console.error(
        "Error loading order:",
        error
      );

    }

  };

  /* =========================
     CONFIRM GUESTS
  ========================= */

  const confirmGuests = async () => {

    if (!guestCount || !selectedTable) {
      return;
    }

    const guests = Number(guestCount);

    if (
      !Number.isInteger(guests) ||
      guests < 1
    ) {
      return;
    }

    try {

      /* -------------------------
         CREATE DINE-IN ORDER
      ------------------------- */

      const response = await fetch(
        `${API_URL}/orders`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            order_type: "dine_in",
            table_number: selectedTable,
            guest_count: guests,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(
          `HTTP error: ${response.status}`
        );
      }

      const newOrder = await response.json();

      console.log(
        "New dine-in order created:",
        newOrder
      );

      /* -------------------------
         UPDATE TABLE
      ------------------------- */

      setTables((currentTables) =>
        currentTables.map((table) =>
          table.id === selectedTable
            ? {
                ...table,
                occupied: true,
                guests: guests,
                orderId: newOrder.id,
              }
            : table
        )
      );

      /* -------------------------
         SET ACTIVE TABLE
      ------------------------- */

      setMenuReturnView(null);
      setActiveOrder({
        id: selectedTable,
        orderType: "dine_in",
        tableNumber: selectedTable,
        customerName: null,
        guests: guests,
        orderId: newOrder.id,
      });

      /* -------------------------
         RESET GUEST MODAL
      ------------------------- */

      setSelectedTable(null);
      setGuestCount("");

      /* -------------------------
         OPEN MENU SCREEN
      ------------------------- */

      setView("menu");

    } catch (error) {

      console.error(
        "Error creating dine-in order:",
        error
      );

    }

  };

  /* =========================
     GUEST KEYPAD
  ========================= */

  const addDigit = (digit) => {

    setGuestCount(
      (previousValue) =>
        previousValue + digit
    );

  };

  const clearGuests = () => {
    setGuestCount("");
  };

  /* =========================
     CLOSE GUEST MODAL
  ========================= */

  const closeGuestModal = () => {
    setSelectedTable(null);
    setGuestCount("");
  };

  /* =========================
     REOPEN FROM ORDERS HISTORY
  ========================= */

  const handleOpenHistoryOrder = async (summary) => {
    const response = await fetch(`${API_URL}/orders/${summary.id}`);
    if (!response.ok) {
      throw new Error(`Could not load order #${summary.id} (HTTP ${response.status}).`);
    }
    const orderData = await response.json();
    const order = orderData.order;
    if (!order || order.status !== "open") {
      throw new Error("This order is no longer open. Refresh the history.");
    }
    setMenuReturnView("orders-history");
    setActiveOrder({
      id: order.order_type === "dine_in" ? order.table_number : null,
      orderType: order.order_type,
      tableNumber: order.table_number,
      customerName: order.customer_name,
      guests: order.guest_count,
      orderId: order.id,
      order: orderData,
    });
    setView("menu");
  };

  /* =========================
     MENU SCREEN
  ========================= */

  if (view === "menu" && activeOrder) {

    return (
      <MenuScreen
        table={activeOrder}
        onBack={() => {
          const destination = menuReturnView || (
            activeOrder.orderType === "takeout" ? "create-order" : "tables"
          );
          setView(destination);
          setActiveSection(destination === "orders-history" ? "orders-history" : "create-order");
          setActiveOrder(null);
          setMenuReturnView(null);
        }}
      />
    );

  }

  /* =========================
     DASHBOARD
  ========================= */

  return (

    <div className="dashboard-container">

      {/* SIDEBAR */}

      <Sidebar
        activeSection={activeSection}
        onNavigate={handleSidebarNavigate}
      />

      {/* MAIN CONTENT */}

      <main className="dashboard-main">

        {/* CREATE ORDER */}

        {view === "create-order" && (
          <CreateOrder
            onSelectTables={handleSelectTables}
            onSelectTakeout={handleSelectTakeout}
          />
        )}

        {/* TABLES */}

        {view === "tables" && (
          <TablesView
            tables={tables}
            onTableClick={handleTableClick}
          />
        )}

        {/* ORDERS HISTORY */}
        {view === "orders-history" && (
          <OrdersHistory onOpenOrder={handleOpenHistoryOrder} />
        )}

        {/* TAKEOUT uses the shared MenuScreen after creation. */}

        {/* REPORTS */}
        {view === "reports" && (
          <ReportsDashboard />
        )}
      </main>

      {/* =========================
          TAKEOUT ORDER MODAL
      ========================= */}

      {takeoutModalOpen && (
        <TakeoutOrderModal
          onClose={handleCloseTakeoutModal}
          onContinue={handleTakeoutContinue}
        />
      )}

      {/* =========================
          GUEST MODAL
      ========================= */}

      {selectedTable && view === "tables" && (
        <GuestModal
          selectedTable={selectedTable}
          guestCount={guestCount}
          addDigit={addDigit}
          clearGuests={clearGuests}
          confirmGuests={confirmGuests}
          onClose={closeGuestModal}
        />
      )}

    </div>

  );
}