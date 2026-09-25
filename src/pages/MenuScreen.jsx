import { useState } from "react";
import "./MenuScreen.css";

import MenuSidebar from "../components/menu/MenuSidebar";
import CategoryGrid from "../components/menu/CategoryGrid";
import GuestSelector from "../components/menu/GuestSelector";
import ProductGrid from "../components/menu/ProductGrid";
import NavigationButtons from "../components/menu/NavigationButtons";

import {
  categories,
  products,
} from "../data/menuData";


export default function MenuScreen({
  table,
  onBack,
}) {

  const [selectedCategory, setSelectedCategory] =
    useState(null);

  const [selectedGuest, setSelectedGuest] =
    useState(null);

  const [guestOrders, setGuestOrders] =
    useState({});


  /* =========================
     CATEGORY
  ========================= */

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
    setSelectedGuest(null);
  };


  /* =========================
     ADD PRODUCT
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


  const categoryProducts =
    selectedCategory
      ? products[selectedCategory.name] || []
      : [];


  return (
    <div className="menu-container">

      <MenuSidebar
        table={table}
        selectedGuest={selectedGuest}
        setSelectedGuest={setSelectedGuest}
        guestOrders={guestOrders}
      />


      <main className="menu-main">

        {!selectedCategory ? (

          <CategoryGrid
            categories={categories}
            onCategoryClick={handleCategoryClick}
          />

        ) : (

          <>

            <h1 className="category-title">
              {selectedCategory.name}
            </h1>


            <GuestSelector
              guestCount={table.guests}
              selectedGuest={selectedGuest}
              onSelectGuest={setSelectedGuest}
            />


            <ProductGrid
              products={categoryProducts}
              selectedGuest={selectedGuest}
              onProductClick={addProductToGuest}
            />


            {categoryProducts.length === 0 && (

              <div className="empty-category">
                Products for{" "}
                {selectedCategory.name}{" "}
                will be added later.
              </div>

            )}

          </>

        )}


        <NavigationButtons
          showCategories={Boolean(selectedCategory)}
          onCategories={goBackToCategories}
          onTables={onBack}
        />

      </main>

    </div>
  );
}