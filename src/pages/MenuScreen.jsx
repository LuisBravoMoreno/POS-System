import { useEffect, useState } from "react";
import "./MenuScreen.css";

import MenuSidebar from "../components/menu/MenuSidebar";
import CategoryGrid from "../components/menu/CategoryGrid";
import GuestSelector from "../components/menu/GuestSelector";
import ProductGrid from "../components/menu/ProductGrid";
import NavigationButtons from "../components/menu/NavigationButtons";


const API_URL = "http://127.0.0.1:8000";


export default function MenuScreen({
  table,
  onBack,
}) {

  const [categories, setCategories] = useState([]);
  const [categoryProducts, setCategoryProducts] = useState([]);

  const [selectedCategory, setSelectedCategory] =
    useState(null);

  const [selectedGuest, setSelectedGuest] =
    useState(null);

  const [guestOrders, setGuestOrders] =
    useState({});

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState(null);


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

        const data = await response.json();

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

  const handleCategoryClick = async (category) => {

    setSelectedCategory(category);
    setSelectedGuest(null);
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

      const data = await response.json();

      setCategoryProducts(data);

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
    setCategoryProducts([]);
    setError(null);

  };


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


            {!loading && !error && (

              <CategoryGrid
                categories={categories}
                onCategoryClick={handleCategoryClick}
              />

            )}

          </>

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


            {error ? (

              <div className="empty-category">
                {error}
              </div>

            ) : (

              <ProductGrid
                products={categoryProducts}
                selectedGuest={selectedGuest}
                onProductClick={addProductToGuest}
              />

            )}


            {!error &&
              categoryProducts.length === 0 && (

                <div className="empty-category">
                  No products found for{" "}
                  {selectedCategory.name}.
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