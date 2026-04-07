import { useState, useEffect } from "react";
import { collection, onSnapshot, query, orderBy, deleteDoc, doc } from "firebase/firestore";
import { db, auth } from "../../lib/firebase";
import { Product } from "../../types";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Edit, Trash2, LogOut, Package, LayoutDashboard, ExternalLink } from "lucide-react";
import { formatCurrency } from "../../lib/utils";

export default function Dashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (!user) navigate("/admin");
    });

    const q = query(collection(db, "products"), orderBy("createdAt", "desc"));
    const unsubscribeProducts = onSnapshot(q, (snapshot) => {
      const productsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Product[];
      setProducts(productsData);
      setLoading(false);
    });

    return () => {
      unsubscribeAuth();
      unsubscribeProducts();
    };
  }, [navigate]);

  const handleDelete = async (id: string) => {
    if (window.confirm("Tem certeza que deseja excluir este produto?")) {
      try {
        await deleteDoc(doc(db, "products", id));
      } catch (err) {
        alert("Erro ao excluir produto.");
      }
    }
  };

  const handleLogout = () => {
    auth.signOut();
    navigate("/admin");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
        <div>
          <h1 className="text-3xl font-bold text-primary flex items-center gap-3">
            <LayoutDashboard className="text-accent" />
            Dashboard
          </h1>
          <p className="text-gray-500">Gerencie o catálogo de produtos da sua loja.</p>
        </div>

        <div className="flex items-center gap-4">
          <Link
            to="/admin/produto/novo"
            className="bg-accent text-primary px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-accent-hover transition-all shadow-lg"
          >
            <Plus size={20} />
            Novo Produto
          </Link>
          <button
            onClick={handleLogout}
            className="bg-gray-100 text-gray-600 px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-gray-200 transition-all"
          >
            <LogOut size={20} />
            Sair
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-sm font-bold text-primary uppercase">Produto</th>
                <th className="px-6 py-4 text-sm font-bold text-primary uppercase">Preço</th>
                <th className="px-6 py-4 text-sm font-bold text-primary uppercase">Tamanhos</th>
                <th className="px-6 py-4 text-sm font-bold text-primary uppercase text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-400">
                    Carregando produtos...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-400">
                    Nenhum produto cadastrado.
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <img
                          src={product.mainImage}
                          alt={product.name}
                          className="w-12 h-16 object-cover rounded-lg shadow-sm"
                          referrerPolicy="no-referrer"
                        />
                        <div>
                          <p className="font-bold text-primary">{product.name}</p>
                          <p className="text-xs text-gray-400">{product.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-bold text-accent">
                      {formatCurrency(product.price)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-1">
                        {product.sizes.map((size) => (
                          <span key={size} className="text-[10px] bg-gray-100 px-1.5 py-0.5 rounded font-bold text-gray-500">
                            {size}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/produto/${product.slug}`}
                          target="_blank"
                          className="p-2 text-gray-400 hover:text-primary transition-colors"
                        >
                          <ExternalLink size={18} />
                        </Link>
                        <Link
                          to={`/admin/produto/editar/${product.id}`}
                          className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit size={18} />
                        </Link>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
