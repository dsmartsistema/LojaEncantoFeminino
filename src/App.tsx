import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import ProductDetails from "./pages/ProductDetails";
import CartPage from "./pages/CartPage";
import Login from "./pages/Admin/Login";
import Dashboard from "./pages/Admin/Dashboard";
import ProductForm from "./pages/Admin/ProductForm";
import MobileUpload from "./pages/Admin/MobileUpload";
import { useEffect } from "react";
import { doc, getDocFromServer } from "firebase/firestore";
import { db } from "./lib/firebase";
import { MessageCircle } from "lucide-react";
import { WHATSAPP_NUMBER } from "./constants";

export default function App() {
  useEffect(() => {
    // Test Firestore connection
    const testConnection = async () => {
      try {
        await getDocFromServer(doc(db, "test", "connection"));
      } catch (error) {
        if (error instanceof Error && error.message.includes("the client is offline")) {
          console.error("Please check your Firebase configuration.");
        }
      }
    };
    testConnection();
  }, []);

  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/produto/:slug" element={<ProductDetails />} />
            <Route path="/carrinho" element={<CartPage />} />
            <Route path="/admin" element={<Login />} />
            <Route path="/admin/dashboard" element={<Dashboard />} />
            <Route path="/admin/produto/novo" element={<ProductForm />} />
            <Route path="/admin/produto/editar/:id" element={<ProductForm />} />
            <Route path="/admin/upload/:sessionId" element={<MobileUpload />} />
          </Routes>
        </main>
        <Footer />

        {/* Floating WhatsApp Button */}
        <a
          href={`https://wa.me/${WHATSAPP_NUMBER}`}
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-6 right-6 bg-green-500 text-white p-4 rounded-full shadow-2xl hover:bg-green-600 transition-all hover:scale-110 z-40 flex items-center justify-center"
          aria-label="Contato via WhatsApp"
        >
          <MessageCircle size={32} />
        </a>
      </div>
    </Router>
  );
}
