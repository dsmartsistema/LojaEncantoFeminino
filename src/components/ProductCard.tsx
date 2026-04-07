import { Link } from "react-router-dom";
import { Product } from "../types";
import { formatCurrency } from "../lib/utils";
import { ShoppingCart, Eye } from "lucide-react";
import { motion } from "motion/react";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-gray-100 group"
    >
      <Link to={`/produto/${product.slug}`} className="block relative aspect-[3/4] overflow-hidden">
        <img
          src={product.mainImage}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
          <div className="bg-white p-3 rounded-full text-primary hover:bg-accent hover:text-white transition-colors">
            <Eye size={20} />
          </div>
        </div>
      </Link>

      <div className="p-4">
        <h3 className="text-lg font-semibold text-primary mb-1 truncate">{product.name}</h3>
        <p className="text-accent font-bold text-xl mb-3">{formatCurrency(product.price)}</p>
        
        <div className="flex gap-2 mb-4">
          {product.sizes.map((size) => (
            <span key={size} className="text-[10px] font-bold border border-gray-200 px-2 py-1 rounded text-gray-500 uppercase">
              {size}
            </span>
          ))}
        </div>

        <Link
          to={`/produto/${product.slug}`}
          className="w-full bg-primary text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors"
        >
          Ver Detalhes
        </Link>
      </div>
    </motion.div>
  );
}
