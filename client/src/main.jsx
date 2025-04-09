import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router } from "react-router-dom";
import App from "./App";
import 'primereact/resources/themes/saga-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import "./index.css";
import "./satoshi.css";
import { Provider } from "react-redux";
import { store } from "./redux/store";
import { PrimeReactProvider, PrimeReactContext } from 'primereact/api';



ReactDOM.createRoot(document.getElementById("root")).render(
  
  <Provider store={store}>
    <Router>
      <App />
    </Router>
  </Provider>
);
