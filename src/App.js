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
  return (
    <StrictMode>
      <RouterProvider router={router}></RouterProvider>
    </StrictMode>
  );
}

export default App;
