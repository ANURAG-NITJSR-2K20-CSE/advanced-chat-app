import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { BrowserRouter } from "react-router-dom";
import ChatProvider from "./Context/ChatProvider";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <BrowserRouter>
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange storageKey="BaatCheet-theme">
      <TooltipProvider delayDuration={200}>
        <ChatProvider>
          <App />
          <Toaster position="bottom-center" richColors closeButton />
        </ChatProvider>
      </TooltipProvider>
    </ThemeProvider>
  </BrowserRouter>
);
