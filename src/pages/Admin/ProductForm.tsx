import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, setDoc, addDoc, collection, updateDoc } from "firebase/firestore";
import { db, auth } from "../../lib/firebase";
import { Product } from "../../types";
import { Package, Save, ArrowLeft, Plus, X, Image as ImageIcon } from "lucide-react";
import { CATEGORIES, SIZES } from "../../constants";
import { slugify } from "../../lib/utils";

export default function ProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<Product>>({
    name: "",
    description: "",
    price: 0,
    categoryId: CATEGORIES[0].id,
    mainImage: "",
    gallery: [],
    sizes: [],
    slug: "",
  });

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (!user) navigate("/admin");
    });

    if (isEdit) {
      const fetchProduct = async () => {
        const docRef = doc(db, "products", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setFormData({ id: docSnap.id, ...docSnap.data() } as Product);
        }
      };
      fetchProduct();
    }

    return () => unsubscribeAuth();
  }, [id, isEdit, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const productData = {
        ...formData,
        slug: slugify(formData.name || ""),
        createdAt: isEdit ? formData.createdAt : Date.now(),
      };

      if (isEdit) {
        await updateDoc(doc(db, "products", id), productData);
      } else {
        await addDoc(collection(db, "products"), productData);
      }
      navigate("/admin/dashboard");
    } catch (err) {
      alert("Erro ao salvar produto.");
    } finally {
      setLoading(false);
    }
  };

  const toggleSize = (size: string) => {
    setFormData((prev) => {
      const sizes = prev.sizes || [];
      if (sizes.includes(size)) {
        return { ...prev, sizes: sizes.filter((s) => s !== size) };
      }
      return { ...prev, sizes: [...sizes, size] };
    });
  };

  const addGalleryImage = () => {
    const url = prompt("Insira a URL da imagem:");
    if (url) {
      setFormData((prev) => ({
        ...prev,
        gallery: [...(prev.gallery || []), url],
      }));
    }
  };

  const removeGalleryImage = (idx: number) => {
    setFormData((prev) => ({
      ...prev,
      gallery: (prev.gallery || []).filter((_, i) => i !== idx),
    }));
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <button
        onClick={() => navigate("/admin/dashboard")}
        className="flex items-center gap-2 text-gray-500 hover:text-primary mb-8 transition-colors"
      >
        <ArrowLeft size={20} />
        Voltar para Dashboard
      </button>

      <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
        <h1 className="text-2xl font-bold text-primary mb-8 flex items-center gap-3">
          <Package className="text-accent" />
          {isEdit ? "Editar Produto" : "Novo Produto"}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-primary uppercase mb-2">Nome do Produto</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-accent focus:border-transparent outline-none"
                  placeholder="Ex: Vestido Floral Midi"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-primary uppercase mb-2">Preço (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-accent focus:border-transparent outline-none"
                  placeholder="0,00"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-primary uppercase mb-2">Categoria</label>
                <select
                  required
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-accent focus:border-transparent outline-none appearance-none bg-white"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-primary uppercase mb-2">Tamanhos Disponíveis</label>
                <div className="flex flex-wrap gap-2">
                  {SIZES.map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => toggleSize(size)}
                      className={`px-4 py-2 rounded-lg border-2 font-bold transition-all ${
                        formData.sizes?.includes(size)
                          ? "border-accent bg-accent text-primary"
                          : "border-gray-100 text-gray-400 hover:border-accent/30"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-primary uppercase mb-2">Descrição</label>
                <textarea
                  required
                  rows={5}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-accent focus:border-transparent outline-none resize-none"
                  placeholder="Descreva o produto, material, caimento..."
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-primary uppercase mb-2">Imagem Principal (URL)</label>
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="url"
                      required
                      value={formData.mainImage}
                      onChange={(e) => setFormData({ ...formData, mainImage: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-accent focus:border-transparent outline-none"
                      placeholder="https://exemplo.com/imagem.jpg"
                    />
                  </div>
                  {formData.mainImage && (
                    <img src={formData.mainImage} className="w-12 h-12 object-cover rounded-lg border" referrerPolicy="no-referrer" />
                  )}
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-bold text-primary uppercase">Galeria de Imagens</label>
              <button
                type="button"
                onClick={addGalleryImage}
                className="text-accent hover:text-accent-hover font-bold text-sm flex items-center gap-1"
              >
                <Plus size={16} />
                Adicionar Imagem
              </button>
            </div>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-4">
              {formData.gallery?.map((img, idx) => (
                <div key={idx} className="relative aspect-square group">
                  <img src={img} className="w-full h-full object-cover rounded-lg border" referrerPolicy="no-referrer" />
                  <button
                    type="button"
                    onClick={() => removeGalleryImage(idx)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addGalleryImage}
                className="aspect-square rounded-lg border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-400 hover:border-accent hover:text-accent transition-all"
              >
                <Plus size={24} />
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white py-4 rounded-xl font-bold flex items-center justify-center gap-3 hover:bg-primary/90 transition-all shadow-lg disabled:opacity-50"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
            ) : (
              <>
                <Save size={20} />
                {isEdit ? "Salvar Alterações" : "Cadastrar Produto"}
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
