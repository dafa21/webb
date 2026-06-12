import React, { useState } from "react";
import { motion } from "framer-motion";
import { UserCircle, Phone, ArrowRight, ShieldCheck, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

export const AuthPage = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      setError("Nama dan Nomor Telepon wajib diisi.");
      return;
    }

    // Clean up phone number (remove non-digits)
    const cleanPhone = phone.replace(/\D/g, "");
    if (cleanPhone.length < 9) {
      setError("Nomor Telepon tidak valid.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // Save to localStorage
      localStorage.setItem("app_user_name", name.trim());
      localStorage.setItem("app_user_phone", cleanPhone);

      // Save/Merge to Firestore users collection
      const userRef = doc(db, "users", cleanPhone);
      await setDoc(
        userRef,
        {
          name: name.trim(),
          phone: cleanPhone,
          lastLoginAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      // Successfully logged in
      setIsLoading(false);
      navigate(-1); // Go back to where they came from (e.g. Affiliate Dashboard)
    } catch (err: any) {
      setIsLoading(false);
      setError("Terjadi kesalahan. Pastikan koneksi internet Anda stabil.");
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-6 pt-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white dark:bg-slate-800 rounded-3xl shadow-xl overflow-hidden border border-slate-100 dark:border-slate-700"
      >
        <div className="bg-primary-500 p-8 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-black/10 rounded-full blur-2xl -translate-x-1/2 translate-y-1/2"></div>
          
          <div className="relative z-10 w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm border border-white/30">
            <ShieldCheck className="w-10 h-10 text-white" />
          </div>
          <h2 className="relative z-10 text-2xl font-black text-white mb-2">Masuk Akun</h2>
          <p className="relative z-10 text-primary-100 font-medium text-sm">
            Gunakan Nama dan Nomor Telepon WhatsApp Anda untuk mengakses seluruh fitur.
          </p>
        </div>

        <div className="p-8">
          {error && (
            <div className="mb-6 p-4 bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-xl text-sm font-bold border border-rose-100 dark:border-rose-800 flex items-start gap-2">
              <span className="shrink-0 mt-0.5">⚠️</span>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Nama Lengkap</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <UserCircle className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Abdullah"
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all dark:text-white"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Nomor WhatsApp</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Contoh: 081234567890"
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all dark:text-white"
                  required
                />
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Nomor ini akan digunakan sebagai ID unik Anda.
              </p>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 bg-primary-500 hover:bg-primary-600 text-white font-bold py-3.5 px-4 rounded-xl transition-all hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed group"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Lanjutkan <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};
