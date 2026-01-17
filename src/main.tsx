import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { I18nProvider } from "./i18n";
import { CartProvider } from "./hooks/useCart";

createRoot(document.getElementById("root")!).render(
  <I18nProvider>
    <CartProvider>
      <App />
    </CartProvider>
  </I18nProvider>,
);
