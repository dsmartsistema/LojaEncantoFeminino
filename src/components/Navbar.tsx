import { Link } from "react-router-dom";
import { ShoppingCart, Menu, X, User } from "lucide-react";
import { useState } from "react";
import { STORE_NAME } from "../constants";
import { useCart } from "../hooks/useCart";
import { motion, AnimatePresence } from "motion/react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { cart } = useCart();
  const itemCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <nav className="bg-primary text-white sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-bold tracking-tighter flex items-center gap-2">
              <span className="text-accent">Boutique</span>
              <span className="text-white">Elegance</span>
            </Link>
          </div>

          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              <Link to="/" className="hover:text-accent transition-colors">Catálogo</Link>
              <Link to="/#sobre" className="hover:text-accent transition-colors">Sobre</Link>
              <Link to="/#contato" className="hover:text-accent transition-colors">Contato</Link>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Link to="/admin" className="p-2 hover:bg-white/10 rounded-full transition-colors">
              <User size={24} />
            </Link>
            <Link to="/carrinho" className="p-2 hover:bg-white/10 rounded-full transition-colors relative">
              <ShoppingCart size={24} />
              {itemCount > 0 && (
                <span className="absolute top-0 right-0 bg-accent text-primary text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-primary">
                  {itemCount}
                </span>
              )}
            </Link>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-primary border-t border-white/10"
          >
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <Link
                to="/"
                onClick={() => setIsOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium hover:bg-accent hover:text-primary transition-colors"
              >
                Catálogo
              </Link>
              <Link
                to="/#sobre"
                onClick={() => setIsOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium hover:bg-accent hover:text-primary transition-colors"
              >
                Sobre
              </Link>
              <Link
                to="/#contato"
                onClick={() => setIsOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium hover:bg-accent hover:text-primary transition-colors"
              >
                Contato
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
