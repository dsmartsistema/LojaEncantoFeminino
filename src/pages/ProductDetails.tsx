import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { collection, query, where, getDocs, limit } from "firebase/firestore";
import { db } from "../lib/firebase";
import { Product } from "../types";
import { useCart } from "../hooks/useCart";
import { formatCurrency } from "../lib/utils";
import { ShoppingCart, ChevronLeft, ChevronRight, Share2, MessageCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { WHATSAPP_NUMBER } from "../constants";

export default function ProductDetails() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    const fetchProduct = async () => {
      const q = query(collection(db, "products"), where("slug", "==", slug), limit(1));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        setProduct({ id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as Product);
      }
      setLoading(false);
    };
    fetchProduct();
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-primary mb-4">Produto não encontrado</h2>
        <button
          onClick={() => navigate("/")}
          className="bg-primary text-white px-6 py-2 rounded-lg"
        >
          Voltar ao Catálogo
        </button>
      </div>
    );
  }

  const images = [product.mainImage, ...(product.gallery || [])];

  const handleAddToCart = () => {
    if (!selectedSize) {
      alert("Por favor, selecione um tamanho.");
      return;
    }
    addToCart(product, selectedSize, quantity);
    navigate("/carrinho");
  };

  const handleShare = () => {
    const message = `Confira este produto na Boutique Elegance: ${product.name} - ${formatCurrency(product.price)}\n\nLink: ${window.location.href}`;
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/?text=${encodedMessage}`, "_blank");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-500 hover:text-primary mb-8 transition-colors"
      >
        <ChevronLeft size={20} />
        Voltar
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Gallery */}
        <div className="space-y-4">
          <div className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-lg bg-gray-100">
            <AnimatePresence mode="wait">
              <motion.img
                key={currentImage}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                src={images[currentImage]}
                alt={product.name}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </AnimatePresence>
            
            {images.length > 1 && (
              <>
                <button
                  onClick={() => setCurrentImage((prev) => (prev === 0 ? images.length - 1 : prev - 1))}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full text-primary hover:bg-white transition-colors"
                >
                  <ChevronLeft size={24} />
                </button>
                <button
                  onClick={() => setCurrentImage((prev) => (prev === images.length - 1 ? 0 : prev + 1))}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full text-primary hover:bg-white transition-colors"
                >
                  <ChevronRight size={24} />
                </button>
              </>
            )}
          </div>

          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentImage(idx)}
                className={`flex-shrink-0 w-20 h-24 rounded-lg overflow-hidden border-2 transition-all ${
                  currentImage === idx ? "border-accent scale-105 shadow-md" : "border-transparent opacity-70 hover:opacity-100"
                }`}
              >
                <img src={img} alt={`${product.name} ${idx}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </button>
            ))}
          </div>
        </div>

        {/* Info */}
        <div className="flex flex-col">
          <h1 className="text-4xl font-bold text-primary mb-2 tracking-tight">{product.name}</h1>
          <p className="text-3xl font-bold text-accent mb-8">{formatCurrency(product.price)}</p>
          
          <div className="prose prose-sm text-gray-600 mb-8 max-w-none">
            <p className="whitespace-pre-wrap">{product.description}</p>
          </div>

          <div className="space-y-6 mb-10">
            <div>
              <label className="block text-sm font-bold text-primary uppercase mb-3">Selecione o Tamanho</label>
              <div className="flex flex-wrap gap-3">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`min-w-[50px] h-[50px] rounded-lg border-2 font-bold transition-all ${
                      selectedSize === size
                        ? "border-accent bg-accent text-primary shadow-lg"
                        : "border-gray-200 text-gray-500 hover:border-accent hover:text-accent"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-primary uppercase mb-3">Quantidade</label>
              <div className="flex items-center gap-4 bg-gray-100 w-fit p-1 rounded-xl border border-gray-200">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-10 h-10 flex items-center justify-center hover:bg-white rounded-lg transition-colors text-primary"
                >
                  <ChevronLeft size={20} />
                </button>
                <span className="w-12 text-center font-bold text-lg">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  className="w-10 h-10 flex items-center justify-center hover:bg-white rounded-lg transition-colors text-primary"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mt-auto">
            <button
              onClick={handleAddToCart}
              className="flex-1 bg-primary text-white py-4 rounded-xl font-bold flex items-center justify-center gap-3 hover:bg-primary/90 transition-all shadow-xl hover:shadow-primary/20"
            >
              <ShoppingCart size={24} />
              Adicionar ao Carrinho
            </button>
            <button
              onClick={handleShare}
              className="bg-white text-primary border-2 border-primary py-4 px-6 rounded-xl font-bold flex items-center justify-center gap-3 hover:bg-gray-50 transition-all"
            >
              <Share2 size={24} />
            </button>
          </div>

          <div className="mt-8 p-4 bg-accent/10 rounded-xl border border-accent/20 flex items-center gap-4">
            <div className="bg-accent p-3 rounded-full text-primary">
              <MessageCircle size={24} />
            </div>
            <div>
              <p className="font-bold text-primary">Dúvidas sobre o produto?</p>
              <p className="text-sm text-gray-600">Chame nossa equipe no WhatsApp para um atendimento personalizado.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
