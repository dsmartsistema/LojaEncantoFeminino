import { Link } from "react-router-dom";
import { useCart } from "../hooks/useCart";
import { formatCurrency } from "../lib/utils";
import { Trash2, Plus, Minus, Send, ShoppingBag } from "lucide-react";
import { WHATSAPP_NUMBER, STORE_NAME } from "../constants";
import { motion, AnimatePresence } from "motion/react";

export default function Cart() {
  const { cart, removeFromCart, updateQuantity, total } = useCart();

  const handleCheckout = () => {
    const message = `Olá! Gostaria de fazer um pedido na ${STORE_NAME}:\n\n🛍️ *Produtos:*\n${cart
      .map(
        (item) =>
          `- ${item.name} | Tam: ${item.selectedSize} | Qtd: ${item.quantity} | ${formatCurrency(
            item.price * item.quantity
          )}`
      )
      .join("\n")}\n\n💰 *Total: ${formatCurrency(total)}*\n\nPode me atender?`;

    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`, "_blank");
  };

  if (cart.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
        <div className="bg-gray-100 p-8 rounded-full mb-6">
          <ShoppingBag size={64} className="text-gray-400" />
        </div>
        <h2 className="text-2xl font-bold text-primary mb-2">Seu carrinho está vazio</h2>
        <p className="text-gray-500 mb-8 max-w-sm">
          Explore nosso catálogo e encontre as peças perfeitas para você.
        </p>
        <Link
          to="/"
          className="bg-primary text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors"
        >
          Ver Catálogo
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-primary mb-8 flex items-center gap-3">
        <ShoppingBag className="text-accent" />
        Meu Carrinho
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <AnimatePresence>
            {cart.map((item) => (
              <motion.div
                key={`${item.id}-${item.selectedSize}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex gap-4"
              >
                <img
                  src={item.mainImage}
                  alt={item.name}
                  className="w-24 h-32 object-cover rounded-lg"
                  referrerPolicy="no-referrer"
                />
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-primary text-lg">{item.name}</h3>
                    <p className="text-gray-500 text-sm">Tamanho: <span className="font-semibold text-accent">{item.selectedSize}</span></p>
                    <p className="text-accent font-bold mt-1">{formatCurrency(item.price)}</p>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-1 border border-gray-200">
                      <button
                        onClick={() => updateQuantity(item.id, item.selectedSize, item.quantity - 1)}
                        className="p-1 hover:bg-white rounded transition-colors text-primary"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="w-8 text-center font-bold text-sm">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.selectedSize, item.quantity + 1)}
                        className="p-1 hover:bg-white rounded transition-colors text-primary"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.id, item.selectedSize)}
                      className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 sticky top-24">
            <h2 className="text-xl font-bold text-primary mb-6 border-b pb-4">Resumo do Pedido</h2>
            
            <div className="space-y-4 mb-8">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>{formatCurrency(total)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Entrega</span>
                <span className="text-green-600 font-medium">A combinar</span>
              </div>
              <div className="pt-4 border-t flex justify-between items-center">
                <span className="text-lg font-bold text-primary">Total</span>
                <span className="text-2xl font-bold text-accent">{formatCurrency(total)}</span>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              className="w-full bg-green-600 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-3 hover:bg-green-700 transition-all shadow-lg hover:shadow-green-200"
            >
              <Send size={20} />
              Finalizar no WhatsApp
            </button>
            <p className="text-center text-xs text-gray-400 mt-4">
              Você será redirecionado para o WhatsApp para concluir seu pedido.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
