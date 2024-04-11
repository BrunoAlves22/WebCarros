import { createBrowserRouter } from "react-router-dom";

import { Dashboard } from "./pages/dashboard";
import { New } from "./pages/dashboard/new";
import { Detail } from "./pages/detail";
import { Edit } from "./pages/edit";
import { Home } from "./pages/home";
import { Login } from "./pages/login";
import { Register } from "./pages/register";

import { Layout } from "./components/layout";
import { Private } from "./routes/Private";

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      {
        path: "/",
        element: <Home />,
      },
      {
        path: "/detail/:id",
        element: <Detail />,
      },
      {
        path: "/dashboard",
        element: (
          <Private>
            <Dashboard />
          </Private>
        ),
      },
      {
        path: "/dashboard/new",
        element: (
          <Private>
            <New />
          </Private>
        ),
      },
      {
        path: "/edit/:id",
        element: (
          <Private>
            <Edit />
          </Private>
        ),
      },
    ],
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/register",
    element: <Register />,
  },
]);

export { router };
