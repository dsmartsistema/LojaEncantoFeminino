import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, setDoc, addDoc, collection, updateDoc, onSnapshot, deleteDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, auth, storage } from "../../lib/firebase";
import { Product } from "../../types";
import { Package, Save, ArrowLeft, Plus, X, Image as ImageIcon, QrCode, Loader2, Smartphone, Trash2 } from "lucide-react";
import { CATEGORIES, SIZES } from "../../constants";
import { slugify } from "../../lib/utils";
import { QRCodeSVG } from "qrcode.react";

export default function ProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [sessionId] = useState(() => Math.random().toString(36).substring(2, 15));
  const [showQR, setShowQR] = useState(false);
  
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

  const uploadUrl = `${window.location.origin}/admin/upload/${sessionId}`;

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

    // Listen for mobile uploads
    const unsubscribeUploads = onSnapshot(doc(db, "upload_sessions", sessionId), (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        if (data.urls && data.urls.length > 0) {
          setFormData((prev) => {
            const currentGallery = prev.gallery || [];
            const newUrls = data.urls.filter((url: string) => !currentGallery.includes(url));
            
            if (newUrls.length === 0) return prev;

            // If no main image, set the first uploaded one as main
            const mainImage = prev.mainImage || newUrls[0];
            
            return {
              ...prev,
              mainImage,
              gallery: [...currentGallery, ...newUrls],
            };
          });
        }
      }
    });

    return () => {
      unsubscribeAuth();
      unsubscribeUploads();
    };
  }, [id, isEdit, navigate, sessionId]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, isMain: boolean = false) => {
    const files = e.target.files;
    if (!files) return;

    setUploading(true);
    try {
      const urls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const storageRef = ref(storage, `products/${Date.now()}-${file.name}`);
        const snapshot = await uploadBytes(storageRef, file);
        const url = await getDownloadURL(snapshot.ref);
        urls.push(url);
      }

      if (isMain) {
        setFormData(prev => ({ ...prev, mainImage: urls[0] }));
      } else {
        setFormData(prev => ({ ...prev, gallery: [...(prev.gallery || []), ...urls] }));
      }
    } catch (err) {
      alert("Erro ao enviar imagem.");
    } finally {
      setUploading(false);
    }
  };

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
      
      // Cleanup session
      await deleteDoc(doc(db, "upload_sessions", sessionId));
      
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

  const removeGalleryImage = (idx: number) => {
    setFormData((prev) => ({
      ...prev,
      gallery: (prev.gallery || []).filter((_, i) => i !== idx),
    }));
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <button
        onClick={() => navigate("/admin/dashboard")}
        className="flex items-center gap-2 text-gray-500 hover:text-primary mb-8 transition-colors"
      >
        <ArrowLeft size={20} />
        Voltar para Dashboard
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
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
                    <label className="block text-sm font-bold text-primary uppercase mb-2">Imagem Principal</label>
                    <div className="flex flex-col gap-4">
                      {formData.mainImage && (
                        <div className="relative aspect-[3/4] rounded-xl overflow-hidden border-2 border-accent/20 group">
                          <img src={formData.mainImage} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          <button
                            type="button"
                            onClick={() => setFormData({ ...formData, mainImage: "" })}
                            className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      )}
                      <label className="flex items-center justify-center gap-2 w-full py-4 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-accent hover:text-accent transition-all">
                        <ImageIcon size={20} />
                        <span className="font-bold">{formData.mainImage ? "Trocar Imagem" : "Escolher Imagem Principal"}</span>
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, true)} />
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <label className="block text-sm font-bold text-primary uppercase">Galeria de Imagens</label>
                  <label className="text-accent hover:text-accent-hover font-bold text-sm flex items-center gap-1 cursor-pointer">
                    <Plus size={16} />
                    Adicionar Fotos
                    <input type="file" multiple accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e)} />
                  </label>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
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
                  <label className="aspect-square rounded-lg border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-400 hover:border-accent hover:text-accent transition-all cursor-pointer">
                    <Plus size={24} />
                    <input type="file" multiple accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e)} />
                  </label>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || uploading}
                className="w-full bg-primary text-white py-4 rounded-xl font-bold flex items-center justify-center gap-3 hover:bg-primary/90 transition-all shadow-lg disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 size={20} className="animate-spin" />
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

        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100 sticky top-24">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-accent/10 p-2 rounded-lg text-accent">
                <Smartphone size={24} />
              </div>
              <h2 className="font-bold text-primary">Envio via Celular</h2>
            </div>
            
            <p className="text-sm text-gray-500 mb-6">
              Escaneie o QR Code abaixo com seu celular para tirar fotos e enviá-las diretamente para este formulário.
            </p>

            <div className="bg-gray-50 p-6 rounded-xl flex flex-col items-center justify-center border-2 border-dashed border-gray-200">
              <QRCodeSVG value={uploadUrl} size={180} />
              <p className="text-[10px] text-gray-400 mt-4 font-mono break-all text-center">{uploadUrl}</p>
            </div>

            <div className="mt-6 space-y-4">
              <div className="flex items-start gap-3">
                <div className="bg-primary text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold mt-0.5">1</div>
                <p className="text-xs text-gray-600">Abra a câmera do seu celular.</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-primary text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold mt-0.5">2</div>
                <p className="text-xs text-gray-600">Escaneie o código e acesse o link.</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-primary text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold mt-0.5">3</div>
                <p className="text-xs text-gray-600">Tire as fotos e elas aparecerão aqui automaticamente.</p>
              </div>
            </div>

            {uploading && (
              <div className="mt-6 flex items-center justify-center gap-2 text-accent font-bold animate-pulse">
                <Loader2 size={16} className="animate-spin" />
                Enviando fotos...
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
