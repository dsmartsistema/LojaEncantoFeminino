import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { doc, updateDoc, arrayUnion, onSnapshot, setDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../../lib/firebase";
import { Camera, Upload, CheckCircle2, Loader2, Image as ImageIcon } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function MobileUpload() {
  const { sessionId } = useParams();
  const [uploading, setUploading] = useState(false);
  const [uploadedCount, setUploadedCount] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    if (sessionId) {
      // Initialize session if it doesn't exist
      setDoc(doc(db, "upload_sessions", sessionId), { urls: [] }, { merge: true });
    }
  }, [sessionId]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !sessionId) return;

    setUploading(true);
    setError("");
    let count = 0;

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const storageRef = ref(storage, `temp/${sessionId}/${Date.now()}-${file.name}`);
        
        const snapshot = await uploadBytes(storageRef, file);
        const url = await getDownloadURL(snapshot.ref);
        
        await updateDoc(doc(db, "upload_sessions", sessionId), {
          urls: arrayUnion(url)
        });
        count++;
        setUploadedCount(prev => prev + 1);
      }
    } catch (err) {
      console.error(err);
      setError("Erro ao enviar fotos. Tente novamente.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-primary text-white flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md text-center">
        <div className="bg-accent w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-primary shadow-2xl">
          <Camera size={40} />
        </div>
        
        <h1 className="text-3xl font-bold mb-2">Envio Rápido</h1>
        <p className="text-gray-400 mb-12">Tire fotos ou escolha da galeria para enviar ao computador.</p>

        <div className="space-y-6">
          <label className="block w-full">
            <div className="bg-white text-primary py-6 rounded-2xl font-bold text-xl flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-gray-100 transition-all shadow-xl active:scale-95">
              {uploading ? (
                <Loader2 size={40} className="animate-spin text-accent" />
              ) : (
                <Upload size={40} className="text-accent" />
              )}
              <span>{uploading ? "Enviando..." : "Tirar Fotos / Galeria"}</span>
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

          {error && (
            <div className="bg-red-500/20 border border-red-500/30 p-4 rounded-xl text-red-400">
              {error}
            </div>
          )}
        </div>

        <div className="mt-12 pt-12 border-t border-white/10">
          <p className="text-xs text-gray-500 uppercase tracking-widest mb-4">Sessão Ativa</p>
          <code className="bg-white/5 px-4 py-2 rounded-lg text-accent font-mono">{sessionId}</code>
        </div>
      </div>
    </div>
  );
}
