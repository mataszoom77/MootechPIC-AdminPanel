import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import Orders from "./pages/Orders";
import Requests from "./pages/Requests";
import PrivateRoute from "./components/PrivateRoute";
import EditProduct from './pages/EditProduct';
import EditSparePart from './pages/EditSparePart.jsx';
import CreateProduct from "./pages/CreateProduct.jsx";
import CreateSparePart from "./pages/CreateSparePart.jsx";
import OrderDetails from "./pages/OrderDetails.jsx";
import AnswerRequest from "./pages/AnswerRequest.jsx";

function App() {
  return (
    <Router>
      <Routes>
      <Route path="/login" element={<Login />} />
        <Route path="/" element={<PrivateRoute />}>
        <Route path="/" element={<Navigate to="/dashboard" />} />

          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:id/edit" element={<EditProduct />} />
          <Route path="/spareparts/:id/edit" element={<EditSparePart />} />
          <Route path="/products/create" element={<CreateProduct />} />
          <Route path="/spare-part/create" element={<CreateSparePart />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/orders/:id" element={<OrderDetails />} />
          <Route path="/requests" element={<Requests />} />
          <Route path="/requests/:id" element={<AnswerRequest />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
