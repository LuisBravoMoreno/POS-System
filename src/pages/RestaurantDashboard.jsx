import { useEffect, useState } from "react";
import "./RestaurantDashboard.css";

import Sidebar from "../components/Sidebar";
import TableCard from "../components/TableCard";
import GuestModal from "../components/GuestModal";
import MenuScreen from "./MenuScreen";


const API_URL = "http://127.0.0.1:8000";


export default function RestaurantDashboard() {

  /* =========================
     TABLES
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

  // Controla qué pantalla mostrar
  const [view, setView] =
    useState("tables");

  // Mesa que actualmente está siendo atendida
  const [activeTable, setActiveTable] =
    useState(null);


  /* =========================
     LOAD OPEN ORDERS
  ========================= */

  useEffect(() => {

    /*
      Solamente buscamos las órdenes
      abiertas cuando estamos en la
      pantalla de Tables.
    */

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


        const openOrders =
          await response.json();


        setTables((currentTables) =>
          currentTables.map((table) => {

            /*
              Buscamos si esta mesa tiene
              actualmente una orden OPEN.
            */

            const openOrder =
              openOrders.find(
                (order) =>
                  order.table_number ===
                  table.id
              );


            /*
              Si encontramos una orden
              abierta para esta mesa,
              la mesa está OCCUPIED.
            */

            if (openOrder) {

              return {
                ...table,

                occupied: true,

                guests:
                  openOrder.guest_count,

                orderId:
                  openOrder.id,
              };

            }


            /*
              Si NO encontramos una orden
              abierta para esta mesa,
              la mesa está AVAILABLE.
            */

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
     TABLE CLICK
  ========================= */

  const handleTableClick = async (id) => {

    const table = tables.find(
      (t) => t.id === id
    );


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


      const orderData =
        await response.json();


      // Temporal para verificar
      // la información recibida
      console.log(
        "Existing order:",
        orderData
      );


      // Guardamos la mesa activa
      // junto con su orden existente
      setActiveTable({
        id: table.id,
        guests: table.guests,
        orderId: table.orderId,
        order: orderData,
      });


      // Abrimos MenuScreen
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

    if (
      !guestCount ||
      !selectedTable
    ) {
      return;
    }


    const guests =
      Number(guestCount);


    try {

      /* -------------------------
         CREATE ORDER IN BACKEND
      ------------------------- */

      const response = await fetch(
        `${API_URL}/orders`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            table_number:
              selectedTable,

            guest_count:
              guests,
          }),
        }
      );


      if (!response.ok) {

        throw new Error(
          `HTTP error: ${response.status}`
        );

      }


      const newOrder =
        await response.json();


      console.log(
        "New order created:",
        newOrder
      );


      /* -------------------------
         UPDATE TABLE IN REACT
      ------------------------- */

      setTables((currentTables) =>
        currentTables.map((table) =>
          table.id === selectedTable
            ? {
                ...table,

                occupied: true,

                guests: guests,

                orderId:
                  newOrder.id,
              }
            : table
        )
      );


      /* -------------------------
         SET ACTIVE TABLE
      ------------------------- */

      setActiveTable({
        id: selectedTable,
        guests: guests,
        orderId: newOrder.id,
      });


      /* -------------------------
         CLEAN MODAL
      ------------------------- */

      setSelectedTable(null);

      setGuestCount("");


      /* -------------------------
         OPEN MENU
      ------------------------- */

      setView("menu");


    } catch (error) {

      console.error(
        "Error creating order:",
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
     MENU SCREEN
  ========================= */

  if (
    view === "menu" &&
    activeTable
  ) {

    return (

      <MenuScreen

        table={
          activeTable
        }

        onBack={() =>
          setView("tables")
        }

      />

    );

  }


  /* =========================
     TABLE SCREEN
  ========================= */

  return (

    <div className="dashboard-container">

      <Sidebar />


      <main className="dashboard-main">

        <h1 className="page-title">
          TABLES
        </h1>


        <div className="tables-container">

          {tables.map((table) => (

            <TableCard

              key={
                table.id
              }

              table={
                table
              }

              onClick={
                handleTableClick
              }

            />

          ))}

        </div>

      </main>


      {/* =========================
          GUEST MODAL
      ========================= */}

      {selectedTable && (

        <GuestModal

          selectedTable={
            selectedTable
          }

          guestCount={
            guestCount
          }

          addDigit={
            addDigit
          }

          clearGuests={
            clearGuests
          }

          confirmGuests={
            confirmGuests
          }

        />

      )}

    </div>

  );

}