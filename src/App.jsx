import { useState } from "react";
import Logo from "./components/Logo";
import Login from "./components/Login";
import RestaurantDashboard from "./pages/RestaurantDashboard";

function App() {
  const [loggedIn,setLoggedIn] = useState(false);
  return (
    <>
       {loggedIn ? (
          <RestaurantDashboard />
       ) : (
         <div>
           <Logo />
           <Login onLogin={()=> setLoggedIn(true)}/>
        </div>
       )} 
    </>
  );
}

export default App;