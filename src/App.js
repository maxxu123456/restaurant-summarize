import "./App.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { StrictMode } from "react";
import Home from "./components/Home/Home";
const router = createBrowserRouter([
  {
    path: "/",
    element: <Home></Home>,
  },
]);
function App() {
  return <RouterProvider router={router}></RouterProvider>;
}

export default App;
