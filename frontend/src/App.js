import "./App.css";
import React, { Suspense, lazy } from "react";
import { Route, Routes } from "react-router-dom";
import { Loader2 } from "lucide-react";

const Homepage = lazy(() => import("./Pages/Homepage"));
const ChatPage = lazy(() => import("./Pages/ChatPage"));

function RouteFallback() {
  return (
    <div
      className="text-muted-foreground flex min-h-[40vh] w-full flex-1 flex-col items-center justify-center gap-3"
      role="status"
      aria-live="polite"
      aria-label="Loading page"
    >
      <Loader2 className="h-8 w-8 animate-spin" />
      <span className="text-sm font-medium">Loading…</span>
    </div>
  );
}

function App() {
  return (
    <div className="App">
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/chats" element={<ChatPage />} />
        </Routes>
      </Suspense>
    </div>
  );
}

export default App;
