import React from "react";
import ReactDOM from "react-dom/client";
import { router } from "./App";
import "./index.css";

import { RouterProvider } from "react-router-dom";
import { register } from "swiper/element/bundle";
import AuthProvider from "./context/AuthContext";

import { Toaster } from "react-hot-toast";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/scrollbar";

register();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Toaster position="top-right" reverseOrder={false} />
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </React.StrictMode>
);
