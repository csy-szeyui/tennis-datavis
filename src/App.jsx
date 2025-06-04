import { useEffect } from "react";
import "./App.css";
import Navbar from "./nav.jsx";
import { Outlet } from "react-router-dom";
//import { fetchAPI } from "./pages/api.jsx";
import { Provider } from "react-redux";
import playerstore from "./pages/redux/store.js";

function App() {
  return (
    <>
      <Provider store={playerstore}>
        <Navbar />
        <div id="container">
          <div class="mockup-window border border-base-300" id="home">
            <Outlet />
          </div>
        </div>
      </Provider>
    </>
  );
}

export default App;
