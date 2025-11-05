import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, useRoutes } from "react-router";
import App from "./App";
import Dashboard from "./Dashboard";
import InfoPage from "./Info";
import GraphsPage from "./Graphs";

function AppRoutes() {
  const routes = useRoutes([
    {
      path: "/",
      element: <App />,
      children: [
        { index: true, element: <Dashboard /> }, // default /
        { path: "graphs", element: <GraphsPage /> },
        { path: "info", element: <InfoPage /> },
      ],
    },
  ]);
  return routes;
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <AppRoutes />
  </BrowserRouter>
);
