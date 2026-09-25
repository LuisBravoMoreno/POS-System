import { useState } from "react";
import "./MenuScreen.css";
import Logo from "../components/Logo";
import {
  ReceiptText,
  ArrowLeft,
  UserRound
} from "lucide-react";

export default function MenuScreen({ table, onBack }) {

  /* =========================
     CATEGORIES
  ========================= */

  const categories = [
    { id: 1, name: "Entradas" },
    { id: 2, name: "Asados" },
    { id: 3, name: "Picamoros" },
    { id: 4, name: "Costillas al Barril" },
    { id: 5, name: "Especialidades" },
    { id: 6, name: "Hamburguesas" },
    { id: 7, name: "Alitas" },
    { id: 8, name: "Guarniciones" },
    { id: 9, name: "Bebidas" },
    { id: 10, name: "Cocteles" },
  ];


  /* =========================
     STATIC PRODUCTS
  ========================= */

  const products = {
    Entradas: [
      {
        id: 1,
        name: "Papas Cheese and Bacon",
        price: 4.00,
      },
      {
        id: 2,
        name: "Maduro con queso y sal Prieta",
        price: 4.00,
      },
      {
        id: 3,
        name: "Piqueo Parrillero",
        price: 12.00,
      },
      {
        id: 4,
        name: "Chistorra",
        price: 5.50,
      },
      {
        id: 5,
        name: "Chistorra a la Pizza",
        price: 6.50,
      },
    ],
  };


  /* =========================
     STATES
  ========================= */

  const [selectedCategory, setSelectedCategory] = useState(null);

  const [selectedGuest, setSelectedGuest] = useState(null);

  const [guestOrders, setGuestOrders] = useState({});


  /* =========================
     OPEN CATEGORY
  ========================= */

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
    setSelectedGuest(null);
  };


  /* =========================
     ADD PRODUCT TO GUEST
  ========================= */

  const addProductToGuest = (product) => {

    if (!selectedGuest) {
      return;
    }

    setGuestOrders((previousOrders) => {

      const currentGuestOrder =
        previousOrders[selectedGuest] || [];

      return {
        ...previousOrders,

        [selectedGuest]: [
          ...currentGuestOrder,
          product,
        ],
      };
    });
  };


  /* =========================
     BACK TO CATEGORIES
  ========================= */

  const goBackToCategories = () => {
    setSelectedCategory(null);
    setSelectedGuest(null);
  };


  return (

    <div className="menu-container">

      {/* =========================
          SIDEBAR
      ========================= */}

      <aside className="menu-sidebar">

        {/* LOGO */}

        <div className="menu-logo">
          <Logo />
        </div>


        {/* CHECK */}

        <div className="order-info">

          <div className="check-header">

            <ReceiptText
              className="check-bill-icon"
              size={19}
            />

            <span>Check</span>

          </div>


          {/* TABLE + GUESTS */}

          <div className="order-details">

            <div className="detail-item">

              <span className="detail-label">
                Table
              </span>

              <span className="detail-value">
                {table.id}
              </span>

            </div>


            <div className="detail-divider"></div>


            <div className="detail-item">

              <span className="detail-label">
                {table.guests === 1
                  ? "Guest"
                  : "Guests"}
              </span>

              <span className="detail-value">
                {table.guests}
              </span>

            </div>

          </div>

        </div>


        {/* =========================
            GUEST LIST
        ========================= */}

        <div className="guest-list">

          {Array.from(
            { length: table.guests },
            (_, index) => {

              const guestNumber = index + 1;

              const guestItems =
                guestOrders[guestNumber] || [];

              return (

                <div
                  key={guestNumber}
                  className="guest-check"
                >

                  <button
                    className={`guest-row ${
                      selectedGuest === guestNumber
                        ? "guest-row-selected"
                        : ""
                    }`}
                    onClick={() =>
                      setSelectedGuest(guestNumber)
                    }
                  >
                    Guest {guestNumber}
                  </button>


                  {/* PRODUCTS ADDED TO GUEST */}

                  {guestItems.length > 0 && (

                    <div className="guest-items">

                      {guestItems.map(
                        (item, itemIndex) => (

                          <div
                            key={`${item.id}-${itemIndex}`}
                            className="guest-item"
                          >

                            <span>
                              {item.name}
                            </span>

                            <span>
                              ${item.price.toFixed(2)}
                            </span>

                          </div>

                        )
                      )}

                    </div>

                  )}

                </div>

              );
            }
          )}

        </div>

      </aside>


      {/* =========================
          MAIN
      ========================= */}

      <main className="menu-main">


        {/* =========================
            CATEGORIES SCREEN
        ========================= */}

        {!selectedCategory && (

          <>

            <h1 className="menu-title">

              <span className="menu-dark">
                MEN
              </span>

              <span className="menu-blue">
                U
              </span>

            </h1>


            <div className="options-grid">

              {categories.map((category) => (

                <button
                  key={category.id}
                  className="menu-option"
                  onClick={() =>
                    handleCategoryClick(category)
                  }
                >
                  {category.name}
                </button>

              ))}

            </div>

          </>

        )}


        {/* =========================
            PRODUCTS SCREEN
        ========================= */}

        {selectedCategory && (

          <>

            <div className="category-header">

              <h1 className="category-title">
                {selectedCategory.name}
              </h1>

            </div>


            {/* =========================
                SELECT GUEST
            ========================= */}

            <div className="guest-selector-container">

              <div className="guest-selector-title">

                <UserRound size={19} />

                <span>
                  Select Guest
                </span>

              </div>


              <div className="guest-selector">

                {Array.from(
                  { length: table.guests },
                  (_, index) => {

                    const guestNumber =
                      index + 1;

                    return (

                      <button
                        key={guestNumber}
                        className={`guest-selector-button ${
                          selectedGuest === guestNumber
                            ? "selected"
                            : ""
                        }`}
                        onClick={() =>
                          setSelectedGuest(
                            guestNumber
                          )
                        }
                      >
                        {guestNumber}
                      </button>

                    );
                  }
                )}

              </div>

            </div>


            {/* =========================
                PRODUCTS
            ========================= */}

            <div className="products-grid">

              {(
                products[selectedCategory.name] ||
                []
              ).map((product) => (

                <button
                  key={product.id}
                  className={`product-card ${
                    !selectedGuest
                      ? "product-disabled"
                      : ""
                  }`}
                  onClick={() =>
                    addProductToGuest(product)
                  }
                >

                  <span className="product-name">
                    {product.name}
                  </span>

                  <span className="product-price">
                    ${product.price.toFixed(2)}
                  </span>

                </button>

              ))}

            </div>


            {/* OTHER CATEGORIES TEMPORARILY EMPTY */}

            {!products[selectedCategory.name] && (

              <div className="empty-category">

                Products for{" "}
                {selectedCategory.name}{" "}
                will be added later.

              </div>

            )}


            {/* BACK TO CATEGORIES */}

            <button
              className="categories-back-button"
              onClick={goBackToCategories}
            >
              <ArrowLeft size={19} />

              Categories
            </button>

          </>

        )}


        {/* =========================
            BACK TO TABLES
        ========================= */}

        <button
          className="back-button"
          onClick={onBack}
        >

          <ArrowLeft size={20} />

          Tables

        </button>

      </main>

    </div>

  );
}