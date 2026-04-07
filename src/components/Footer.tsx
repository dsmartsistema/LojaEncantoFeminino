import { Link } from "react-router-dom";
import { Instagram, Facebook, MessageCircle, Mail, Phone, MapPin } from "lucide-react";
import { STORE_NAME } from "../constants";

export default function Footer() {
  return (
    <footer className="bg-primary text-white pt-16 pb-8 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="text-2xl font-bold tracking-tighter flex items-center gap-2 mb-6">
              <span className="text-accent">Boutique</span>
              <span className="text-white">Elegance</span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed">
              Sua boutique online de moda feminina. Peças exclusivas, elegantes e sofisticadas para todas as ocasiões.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-bold text-accent mb-6">Links Rápidos</h3>
            <ul className="space-y-4 text-gray-400 text-sm">
              <li><Link to="/" className="hover:text-accent transition-colors">Início</Link></li>
              <li><Link to="/#catalogo" className="hover:text-accent transition-colors">Catálogo</Link></li>
              <li><Link to="/carrinho" className="hover:text-accent transition-colors">Meu Carrinho</Link></li>
              <li><Link to="/admin" className="hover:text-accent transition-colors">Área Administrativa</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold text-accent mb-6">Contato</h3>
            <ul className="space-y-4 text-gray-400 text-sm">
              <li className="flex items-center gap-3">
                <Phone size={18} className="text-accent" />
                (11) 99999-9999
              </li>
              <li className="flex items-center gap-3">
                <Mail size={18} className="text-accent" />
                contato@boutiqueelegance.com.br
              </li>
              <li className="flex items-center gap-3">
                <MapPin size={18} className="text-accent" />
                São Paulo, SP
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold text-accent mb-6">Redes Sociais</h3>
            <div className="flex gap-4">
              <a href="#" className="bg-white/10 p-3 rounded-full hover:bg-accent hover:text-primary transition-all">
                <Instagram size={20} />
              </a>
              <a href="#" className="bg-white/10 p-3 rounded-full hover:bg-accent hover:text-primary transition-all">
                <Facebook size={20} />
              </a>
              <a href="#" className="bg-white/10 p-3 rounded-full hover:bg-accent hover:text-primary transition-all">
                <MessageCircle size={20} />
              </a>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-white/10 text-center text-gray-500 text-xs">
          <p>&copy; {new Date().getFullYear()} {STORE_NAME}. Todos os direitos reservados.</p>
          <p className="mt-2">Desenvolvido com elegância.</p>
        </div>
      </div>
    </footer>
  );
}
