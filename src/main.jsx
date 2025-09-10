import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { ThemeProvider } from "./context/ThemeContext.jsx";
import { BrowserRouter as Router } from "react-router-dom";
import { PersistGate } from "redux-persist/integration/react";
import store, { persistor } from "./redux/Store.jsx";
import { Provider } from "react-redux";
import { SocketProvider } from "./context/socketContext.jsx";


createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <ThemeProvider>
          <SocketProvider> {/* New provider wrapper */}
            <Router>
              <App />
            </Router>
          </SocketProvider>
        </ThemeProvider>
      </PersistGate>
    </Provider>
  </StrictMode>
);