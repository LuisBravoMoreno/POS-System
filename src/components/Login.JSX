/*REACT POS LOGIN With Numeric Keypad*/

import React, { useState } from "react";
import "./Login.css";

export default function Login({onLogin}) {
  const CORRECT_PIN = "1234";
  const [pin, setPin] = useState("");

  const addDigit = (digit) => {
    if (pin.length < 4) {
      setPin((prev) => prev + digit);
    }
  };

  const removeDigit = () => {
    setPin((prev) => prev.slice(0, -1));
  };

  /*const login = () => {
    alert(`PIN Entered: ${pin}`);
  };
*/
const handleLogin = () => {
   if (pin === CORRECT_PIN) {
    onLogin();
   } else {
       alert(`❌ Invalid PIN`); 
   } 
};

  return (
    <div className="login-page">
      <div className="login-card">

        <h3>Enter PIN</h3>

        <div className="pin-display">
          {[0, 1, 2, 3].map((index) => (
            <span key={index}>
              {index < pin.length ? "●" : "○"}
            </span>
          ))}
        </div>

        <div className="keypad">

          <button onClick={() => addDigit("1")}>1</button>
          <button onClick={() => addDigit("2")}>2</button>
          <button onClick={() => addDigit("3")}>3</button>

          <button onClick={() => addDigit("4")}>4</button>
          <button onClick={() => addDigit("5")}>5</button>
          <button onClick={() => addDigit("6")}>6</button>

          <button onClick={() => addDigit("7")}>7</button>
          <button onClick={() => addDigit("8")}>8</button>
          <button onClick={() => addDigit("9")}>9</button>

          <button className="delete-btn" onClick={removeDigit}>
            ⌫
          </button>

          <button onClick={() => addDigit("0")}>0</button>

          <button className="login-btn" onClick={handleLogin}>
            →
          </button>

        </div>

        <p className="footer-system">
          Version 1.0
        </p>

      </div>
    </div>
  );
}



/*
const CORRECT_PIN = "1234";



*/