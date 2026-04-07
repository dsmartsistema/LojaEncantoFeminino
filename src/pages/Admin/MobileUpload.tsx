import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { collection, addDoc, onSnapshot, setDoc, doc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { Camera, Upload, CheckCircle2, Loader2, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function MobileUpload() {
  const { sessionId } = useParams();
  const [uploading, setUploading] = useState(false);
  const [uploadedCount, setUploadedCount] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    if (sessionId) {
      // Initialize session
      setDoc(doc(db, "upload_sessions", sessionId), { active: true }, { merge: true });
    }
  }, [sessionId]);

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const MAX_WIDTH = 800;
          const MAX_HEIGHT = 800;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0, width, height);
          
          // Compress to JPEG with 0.7 quality to stay well under 1MB
          const dataUrl = canvas.toDataURL("image/jpeg", 0.7);
          resolve(dataUrl);
        };
        img.onerror = reject;
      };
      reader.onerror = reject;
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !sessionId) return;

    setUploading(true);
    setError("");

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!file.type.startsWith("image/")) continue;

        // Convert and compress to Base64
        const base64 = await compressImage(file);
        
        // Save to Firestore subcollection
        await addDoc(collection(db, "upload_sessions", sessionId, "images"), {
          url: base64,
          timestamp: Date.now()
        });
        
        setUploadedCount(prev => prev + 1);
      }
    } catch (err: any) {
      console.error("Upload error:", err);
      setError(`Erro ao enviar fotos: ${err.message || "Tente novamente."}`);
    } finally {
      setUploading(false);
    }
  };

  if (!sessionId) {
    return (
      <div className="min-h-screen bg-primary text-white flex flex-col items-center justify-center p-6 text-center">
        <X size={48} className="text-red-500 mb-4" />
        <h1 className="text-2xl font-bold mb-2">Sessão Inválida</h1>
        <p className="text-gray-400">O link do QR Code parece estar incompleto.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary text-white flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md text-center">
        <div className="bg-accent w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-primary shadow-2xl">
          <Camera size={40} />
        </div>
        
        <h1 className="text-3xl font-bold mb-2">Envio Rápido</h1>
        <p className="text-gray-400 mb-12">Tire fotos ou escolha da galeria para enviar ao computador.</p>

        <div className="space-y-6">
          {error ? (
            <div className="bg-red-500/20 border border-red-500/30 p-6 rounded-2xl text-red-400 mb-6">
              <p className="font-bold mb-2 text-lg">Ops! Algo deu errado:</p>
              <p className="text-sm opacity-90">{error}</p>
              <button 
                onClick={() => window.location.reload()}
                className="mt-4 bg-red-500 text-white px-4 py-2 rounded-lg font-bold text-sm"
              >
                Tentar Novamente
              </button>
            </div>
          ) : (
            <label className="block w-full">
              <div className="bg-white text-primary py-8 rounded-2xl font-bold text-xl flex flex-col items-center justify-center gap-4 cursor-pointer hover:bg-gray-100 transition-all shadow-xl active:scale-95 border-4 border-accent/20">
                {uploading ? (
                  <Loader2 size={48} className="animate-spin text-accent" />
                ) : (
                  <Upload size={48} className="text-accent" />
                )}
                <div className="flex flex-col">
                  <span>{uploading ? "Enviando..." : "Tirar Fotos / Galeria"}</span>
                  {!uploading && <span className="text-xs text-gray-400 font-normal mt-1">Toque aqui para começar</span>}
                </div>
              </div>
              <input
                type="file"
                multiple
                accept="image/*"
                capture="environment"
                onChange={handleFileUpload}
                disabled={uploading}
                className="hidden"
              />
            </label>
          )}

          <AnimatePresence>
            {uploadedCount > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-green-500/20 border border-green-500/30 p-4 rounded-xl flex items-center justify-center gap-3"
              >
                <CheckCircle2 className="text-green-500" />
                <span className="font-medium">{uploadedCount} fotos enviadas com sucesso!</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="mt-12 pt-12 border-t border-white/10">
          <p className="text-xs text-gray-500 uppercase tracking-widest mb-4">Sessão Ativa</p>
          <code className="bg-white/5 px-4 py-2 rounded-lg text-accent font-mono text-sm">{sessionId}</code>
          <p className="text-[10px] text-gray-600 mt-4">
            Mantenha esta página aberta enquanto envia as fotos.
          </p>
        </div>
      </div>
    </div>
  );
}
