import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowLeft,
  Upload,
  FileText,
  CheckCircle2,
  Clock,
  XCircle,
  Search,
  AlertCircle,
  FileCheck2,
  HandCoins,
  Send,
  Users,
  CheckSquare,
  Banknote,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { db, auth, handleFirestoreError, OperationType } from "../firebase";
import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";

export default function PengajuanBantuan() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"ajukan" | "status">("ajukan");

  // Form State
  const [name, setName] = useState("");
  const [nik, setNik] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [category, setCategory] = useState("Pendidikan");
  const [description, setDescription] = useState("");
  const [documents, setDocuments] = useState<{ name: string; data: string }[]>(
    [],
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [fileError, setFileError] = useState("");

  // Tracking State
  const [requests, setRequests] = useState<any[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(false);

  useEffect(() => {
    if (!auth.currentUser) return;

    setLoadingRequests(true);
    const q = query(
      collection(db, "bantuan_requests"),
      where("userId", "==", auth.currentUser.uid),
      orderBy("createdAt", "desc"),
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const reqs = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
        }));
        setRequests(reqs);
        setLoadingRequests(false);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, "bantuan_requests");
        setLoadingRequests(false);
      },
    );

    return () => unsubscribe();
  }, [auth.currentUser]);

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;

          const maxWidth = 800;
          const maxHeight = 800;

          if (width > height) {
            if (width > maxWidth) {
              height = Math.round(height * (maxWidth / width));
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = Math.round(width * (maxHeight / height));
              height = maxHeight;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL(file.type || "image/jpeg", 0.6));
        };
        img.onerror = (error) => reject(error);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError("");
    const files = e.target.files;
    if (!files) return;

    const maxTotalSize = 800 * 1024; // ~800KB allowed total to stay under Firestore 1MB limit
    // Calculate existing size
    let currentTotalSize = documents.reduce(
      (acc, doc) => acc + (doc.data.length * 3) / 4,
      0,
    );

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      try {
        let base64String = "";

        if (file.type.startsWith("image/")) {
          // Compress image
          base64String = await compressImage(file);
        } else {
          // PDF or other
          if (file.size > 300 * 1024) {
            setFileError(
              `File ${file.name} terlalu besar (maks 300KB untuk disatukan dalam database).`,
            );
            continue;
          }
          base64String = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });
        }

        const approximateSize = (base64String.length * 3) / 4;
        if (currentTotalSize + approximateSize > maxTotalSize) {
          setFileError(
            "Total ukuran dokumen melebihi batas. Mohon hapus dokumen lain atau perkecil ukurannya.",
          );
          break;
        }

        currentTotalSize += approximateSize;
        setDocuments((prev) => [
          ...prev,
          { name: file.name, data: base64String },
        ]);
      } catch (error) {
        console.error("Gagal memproses file:", error);
        setFileError(`Gagal memproses file ${file.name}.`);
      }
    }
  };

  const removeDocument = (index: number) => {
    setDocuments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) {
      alert("Anda harus login terlebih dahulu.");
      return;
    }

    if (documents.length === 0) {
      setFileError("Pilih setidaknya satu dokumen persyaratan.");
      return;
    }

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, "bantuan_requests"), {
        userId: auth.currentUser.uid,
        name,
        nik,
        phone,
        address,
        category,
        description,
        status: "Menunggu Verifikasi",
        documents: documents.map((d) => d.data), // In a real app we upload to Storage
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      setSubmitSuccess(true);
      // Reset form for next time
      setName("");
      setNik("");
      setPhone("");
      setAddress("");
      setCategory("Pendidikan");
      setDescription("");
      setDocuments([]);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, "bantuan_requests");
      alert("Terjadi kesalahan saat mengajukan bantuan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const [globalProcessStep, setGlobalProcessStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setGlobalProcessStep((prev) => (prev + 1) % 4);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  const PROCESS_STAGES = [
    {
      title: "Berkas Masuk",
      icon: Send,
      desc: "Berkas pengajuan diterima dan dicek kelengkapannya oleh tim administrasi.",
    },
    {
      title: "Verifikasi & Survei",
      icon: Users,
      desc: "Pengecekan faktual dan survei kelayakan untuk memastikan bantuan tepat sasaran.",
    },
    {
      title: "Keputusan",
      icon: CheckSquare,
      desc: "Pleno komite memutuskan status pengajuan berdasarkan skala prioritas.",
    },
    {
      title: "Distribusi",
      icon: Banknote,
      desc: "Dana atau barang bantuan disalurkan kepada Anda secara transparan.",
    },
  ];

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "Menunggu Verifikasi":
        return {
          color: "text-amber-500",
          bg: "bg-amber-100 dark:bg-amber-900/30",
          border: "border-amber-200 dark:border-amber-800",
          icon: Clock,
        };
      case "Sedang Disurvei":
        return {
          color: "text-blue-500",
          bg: "bg-blue-100 dark:bg-blue-900/30",
          border: "border-blue-200 dark:border-blue-800",
          icon: Search,
        };
      case "Disetujui":
        return {
          color: "text-emerald-500",
          bg: "bg-emerald-100 dark:bg-emerald-900/30",
          border: "border-emerald-200 dark:border-emerald-800",
          icon: CheckCircle2,
        };
      case "Proses Pencairan":
        return {
          color: "text-purple-500",
          bg: "bg-purple-100 dark:bg-purple-900/30",
          border: "border-purple-200 dark:border-purple-800",
          icon: HandCoins,
        };
      case "Ditolak":
        return {
          color: "text-red-500",
          bg: "bg-red-100 dark:bg-red-900/30",
          border: "border-red-200 dark:border-red-800",
          icon: XCircle,
        };
      default:
        return {
          color: "text-slate-500",
          bg: "bg-slate-100 dark:bg-slate-800",
          border: "border-slate-200 dark:border-slate-700",
          icon: Clock,
        };
    }
  };

  return (
    <div className="pt-24 pb-16 min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header Section */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-slate-500 hover:text-[#1799dc] font-bold mb-6 transition-colors group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />{" "}
            Kembali
          </button>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#1799dc]/10 text-[#1799dc] rounded-full text-xs font-bold uppercase tracking-widest mb-3">
                <FileCheck2 className="w-4 h-4" />
                Layanan Mustahik
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">
                Pengajuan Bantuan
              </h1>
              <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">
                Bantuan untuk kebutuhan darurat, pendidikan, kesehatan, dan
                modal usaha.
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex bg-white dark:bg-slate-800 p-1.5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 mb-8 max-w-sm">
          <button
            onClick={() => setActiveTab("ajukan")}
            className={`flex-1 flex justify-center items-center gap-2 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 ${activeTab === "ajukan" ? "bg-[#1799dc] text-white shadow-md" : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700"}`}
          >
            <FileText className="w-4 h-4" /> Formulir
          </button>
          <button
            onClick={() => setActiveTab("status")}
            className={`flex-1 flex justify-center items-center gap-2 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 ${activeTab === "status" ? "bg-[#1799dc] text-white shadow-md" : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700"}`}
          >
            <Clock className="w-4 h-4" /> Status
          </button>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200 dark:border-slate-700">
          {/* Formulir Tab */}
          {activeTab === "ajukan" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {submitSuccess ? (
                <div className="text-center py-10 md:py-16 animate-fade-in-up">
                  <div className="w-24 h-24 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-500/20">
                    <CheckCircle2 className="w-12 h-12" />
                  </div>
                  <h3 className="text-3xl font-black text-slate-800 dark:text-slate-100 mb-3 tracking-tight">
                    Alhamdulillah, Pengajuan Berhasil
                  </h3>
                  <p className="text-slate-600 dark:text-slate-300 font-medium mb-10 max-w-md mx-auto leading-relaxed">
                    Data pengajuan Anda telah kami terima dengan baik dan akan
                    segera diproses oleh tim kami.
                  </p>

                  <div className="bg-slate-50 dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-700 max-w-2xl mx-auto mb-10 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#1799dc]/5 rounded-bl-full -z-0"></div>
                    <div className="relative z-10">
                      <p className="text-sm font-bold text-[#1799dc] uppercase tracking-widest mb-6">
                        Doa Untuk Pemohon
                      </p>
                      <div
                        className="font-arabic text-3xl md:text-4xl text-slate-800 dark:text-slate-100 leading-loose mb-6 text-center"
                        dir="rtl"
                      >
                        اللَّهُمَّ يَسِّرْ أُمُوْرَنَا وَأُمُوْرَ
                        الْمُسْلِمِيْنَ
                      </div>
                      <p className="text-base md:text-lg font-semibold italic text-slate-600 dark:text-slate-300 leading-relaxed mb-4 text-center">
                        "Ya Allah, mudahkanlah urusan kami dan urusan kaum
                        muslimin."
                      </p>
                      <p className="text-sm md:text-base text-slate-500 dark:text-slate-400 text-center leading-relaxed">
                        Semoga Allah Subhanahu Wa Ta'ala senantiasa melapangkan
                        rezeki Anda, memberikan jalan keluar yang terbaik dari
                        setiap kesulitan, dan mempermudah segala urusan Anda.
                        Aamiin ya Rabbal 'Alamin.
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setSubmitSuccess(false);
                      setActiveTab("status");
                    }}
                    className="px-8 py-3.5 bg-[#1799dc] hover:bg-[#1280b9] text-white font-bold rounded-xl shadow-lg shadow-[#1799dc]/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2 mx-auto"
                  >
                    <Clock className="w-5 h-5" /> Lihat Status Pengajuan
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                        Nama Lengkap (Sesuai KTP)
                      </label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1799dc]"
                        placeholder="Contoh: Budi Santoso"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                        NIK
                      </label>
                      <input
                        type="text"
                        required
                        value={nik}
                        onChange={(e) => setNik(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1799dc]"
                        placeholder="16 Digit NIK"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                        Nomor HP / WhatsApp Active
                      </label>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1799dc]"
                        placeholder="Contoh: 08123456789"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                        Kategori Bantuan
                      </label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-[#1799dc]"
                      >
                        <option>Pendidikan</option>
                        <option>Kesehatan</option>
                        <option>Ekonomi / Modal Usaha</option>
                        <option>Pangan / Kebutuhan Sehari-hari</option>
                        <option>Dakwah</option>
                        <option>Lainnya</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                      Alamat Lengkap Domisili
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1799dc] resize-none"
                      placeholder="Tuliskan jalan, RT/RW, kelurahan, kecamatan, kota..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                      Penjelasan / Alasan Permohonan
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1799dc] resize-none"
                      placeholder="Jelaskan kondisi secara detail mengapa Anda membutuhkan bantuan ini."
                    />
                  </div>

                  {/* Document Upload */}
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                      Unggah Dokumen (KTP, KK, SKTM, dll)
                    </label>
                    <div className="relative border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-2xl p-8 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-center">
                      <input
                        type="file"
                        multiple
                        accept="image/*,.pdf"
                        onChange={handleFileChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <Upload className="w-8 h-8 mx-auto text-[#1799dc] mb-3" />
                      <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                        Klik atau seret file ke sini
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        Maks. 2MB per file (Format: JPG, PNG, PDF)
                      </p>
                    </div>

                    {fileError && (
                      <p className="text-red-500 text-sm font-medium mt-3 flex items-center gap-1.5">
                        <AlertCircle className="w-4 h-4" /> {fileError}
                      </p>
                    )}

                    {documents.length > 0 && (
                      <div className="mt-4 space-y-2">
                        {documents.map((doc, i) => (
                          <div
                            key={i}
                            className="flex flex-wrap items-center justify-between p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 gap-2"
                          >
                            <div className="flex items-center gap-3 overflow-hidden">
                              <div className="p-2 bg-[#1799dc]/10 text-[#1799dc] rounded-lg">
                                <FileText className="w-4 h-4" />
                              </div>
                              <span className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate max-w-[200px] md:max-w-xs">
                                {doc.name}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeDocument(i)}
                              className="p-1 text-slate-400 hover:text-red-500 transition-colors"
                            >
                              <XCircle className="w-5 h-5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                    <button
                      type="submit"
                      disabled={isSubmitting || documents.length === 0}
                      className="w-full bg-[#1799dc] hover:bg-[#1280b9] text-white font-bold py-4 rounded-xl shadow-lg shadow-[#1799dc]/20 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting
                        ? "Mengirim Pengajuan..."
                        : "Kirim Pengajuan Sekarang"}
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          )}

          {/* Status Tracking Tab */}
          {activeTab === "status" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {!auth.currentUser ? (
                <div className="text-center py-10">
                  <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="w-8 h-8 text-slate-400" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">
                    Harap Login
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400">
                    Anda harus masuk untuk melihat status pengajuan Anda.
                  </p>
                </div>
              ) : loadingRequests ? (
                <div className="flex justify-center py-20">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1799dc]"></div>
                </div>
              ) : requests.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
                    <FileText className="w-10 h-10 text-slate-400" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">
                    Belum Ada Pengajuan
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-6">
                    Anda belum pernah mengajukan bantuan melalui sistem ini.
                  </p>
                  <button
                    onClick={() => setActiveTab("ajukan")}
                    className="px-6 py-2.5 bg-[#1799dc]/10 text-[#1799dc] font-bold rounded-xl hover:bg-[#1799dc]/20 transition-colors"
                  >
                    Buat Pengajuan Baru
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {requests.map((request) => {
                    const statusConf = getStatusConfig(request.status);
                    const StatusIcon = statusConf.icon;

                    return (
                      <div
                        key={request.id}
                        className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                          <div>
                            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-lg mb-1">
                              {request.category}
                            </h3>
                            <p className="text-xs font-medium text-slate-500">
                              A.n. {request.name} &bull;{" "}
                              {request.createdAt.toLocaleDateString("id-ID", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })}
                            </p>
                          </div>
                          <div
                            className={`px-3 py-1.5 rounded-full flex items-center gap-2 border ${statusConf.bg} ${statusConf.border} ${statusConf.color}`}
                          >
                            <StatusIcon className="w-4 h-4" />
                            <span className="text-xs font-bold uppercase tracking-wider">
                              {request.status}
                            </span>
                          </div>
                        </div>

                        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                          "{request.description}"
                        </p>

                        {request.status === "Ditolak" &&
                          request.rejectReason && (
                            <div className="bg-red-50 dark:bg-red-900/10 border-l-4 border-red-500 p-4 rounded-r-xl">
                              <p className="text-xs font-bold text-red-500 uppercase tracking-widest mb-1">
                                Alasan Penolakan
                              </p>
                              <p className="text-sm text-red-700 dark:text-red-400 font-medium">
                                {request.rejectReason}
                              </p>
                            </div>
                          )}

                        {/* Timeline Indicator (Simulated) */}
                        <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800">
                          <div className="relative space-y-0 pl-1">
                            <div className="absolute top-5 bottom-10 left-[23px] w-[2px] bg-slate-100 dark:bg-slate-800 z-0">
                              <motion.div
                                className={`w-full ${request.status === "Ditolak" ? "bg-red-500" : "bg-gradient-to-b from-[#1799dc] via-blue-300 to-[#1799dc]"} rounded-full`}
                                initial={{ height: "0%" }}
                                animate={{
                                  height: `${
                                    request.status === "Proses Pencairan"
                                      ? 100
                                      : request.status === "Disetujui"
                                        ? 66.6
                                        : request.status === "Sedang Disurvei"
                                          ? 33.3
                                          : request.status === "Ditolak"
                                            ? 100
                                            : 0
                                  }%`,
                                  backgroundPosition: ["0% 0%", "0% 200%"],
                                }}
                                transition={{
                                  height: { duration: 1.5, ease: "easeInOut" },
                                  backgroundPosition: {
                                    duration: 3,
                                    repeat: Infinity,
                                    ease: "linear",
                                  },
                                }}
                                style={{ backgroundSize: "100% 200%" }}
                              />
                            </div>

                            <div className="space-y-6">
                              {[
                                {
                                  title: "Berkas Masuk",
                                  status: [
                                    "Menunggu Verifikasi",
                                    "Sedang Disurvei",
                                    "Disetujui",
                                    "Proses Pencairan",
                                    "Ditolak",
                                  ],
                                  index: 0,
                                  icon: Send,
                                  desc: "Berkas pengajuan telah kami terima dan akan segera diperiksa oleh tim administrasi.",
                                },
                                {
                                  title: "Verifikasi & Survei kelayakan",
                                  status: [
                                    "Sedang Disurvei",
                                    "Disetujui",
                                    "Proses Pencairan",
                                    "Ditolak",
                                  ],
                                  index: 1,
                                  icon: Users,
                                  desc: "Tim kami sedang memverifikasi data dan melakukan survei kelayakan untuk memastikan bantuan tepat sasaran.",
                                },
                                {
                                  title: "Keputusan Verifikasi",
                                  status: [
                                    "Disetujui",
                                    "Proses Pencairan",
                                    "Ditolak",
                                  ],
                                  index: 2,
                                  icon: CheckSquare,
                                  desc: "Hasil verifikasi telah ditetapkan.",
                                },
                                {
                                  title:
                                    request.status === "Ditolak"
                                      ? "Pengajuan Ditolak"
                                      : "Distribusi Tahap Akhir",
                                  status: ["Proses Pencairan", "Ditolak"],
                                  index: 3,
                                  icon:
                                    request.status === "Ditolak"
                                      ? XCircle
                                      : Banknote,
                                  desc:
                                    request.status === "Ditolak"
                                      ? "Mohon maaf, pengajuan Anda belum dapat disetujui saat ini."
                                      : "Dana bantuan sedang dalam proses transfer atau pendistribusian langsung.",
                                },
                              ].map((step, idx) => {
                                let isCompleted = false;
                                let isRejectedNode = false;

                                if (request.status === "Ditolak") {
                                  isCompleted = true; // Complete all steps if rejected for visual flow
                                  isRejectedNode = idx === 3;
                                } else {
                                  const currentIndex =
                                    request.status === "Proses Pencairan"
                                      ? 3
                                      : request.status === "Disetujui"
                                        ? 2
                                        : request.status === "Sedang Disurvei"
                                          ? 1
                                          : 0;
                                  isCompleted = idx < currentIndex;
                                }

                                const isCurrent =
                                  (request.status === "Ditolak" && idx === 3) ||
                                  (request.status === "Proses Pencairan" &&
                                    idx === 3) ||
                                  (request.status === "Disetujui" &&
                                    idx === 2) ||
                                  (request.status === "Sedang Disurvei" &&
                                    idx === 1) ||
                                  (request.status === "Menunggu Verifikasi" &&
                                    idx === 0);

                                const isUpcoming = !isCompleted && !isCurrent;
                                const StageIcon = isRejectedNode
                                  ? XCircle
                                  : step.icon;

                                return (
                                  <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{
                                      opacity: isUpcoming ? 0.3 : 1,
                                      x: 0,
                                      scale: isCurrent ? 1.02 : 1,
                                    }}
                                    transition={{
                                      duration: 0.8,
                                      delay: 0.1,
                                      ease: "easeOut",
                                    }}
                                    className={`relative flex gap-4 transition-all duration-1000`}
                                  >
                                    <div className="relative z-10 shrink-0">
                                      <motion.div
                                        initial={false}
                                        animate={{
                                          backgroundColor: isUpcoming
                                            ? "rgba(255,255,255,0)"
                                            : isRejectedNode
                                              ? "#ef4444"
                                              : isCompleted
                                                ? "#10b981"
                                                : "#1799dc",
                                          borderColor: isUpcoming
                                            ? window.matchMedia(
                                                "(prefers-color-scheme: dark)",
                                              ).matches
                                              ? "#1e293b"
                                              : "#f1f5f9"
                                            : isRejectedNode
                                              ? "#ef4444"
                                              : isCompleted
                                                ? "#10b981"
                                                : "#1799dc",
                                          scale: isCurrent ? 1.15 : 1,
                                        }}
                                        className={`w-10 h-10 rounded-xl flex items-center justify-center border-2 shadow-sm transition-all duration-1000
                                                                            ${isUpcoming ? "bg-white dark:bg-slate-950 text-slate-200 dark:text-slate-800" : "text-white shadow-lg shadow-blue-500/20"}`}
                                      >
                                        {isCompleted && !isRejectedNode ? (
                                          <CheckCircle2 className="w-5 h-5 transition-transform duration-500 scale-110" />
                                        ) : (
                                          <StageIcon
                                            className={`w-4 h-4 transition-colors duration-700 ${isUpcoming ? "text-slate-200 dark:text-slate-800" : "text-white"}`}
                                          />
                                        )}
                                      </motion.div>
                                      {isCurrent && (
                                        <motion.div
                                          layoutId={`active-glow-${request.id}`}
                                          className={`absolute -inset-3 rounded-2xl ${isRejectedNode ? "bg-red-500/10" : "bg-[#1799dc]/10"} z-[-1]`}
                                          initial={{ scale: 0.8, opacity: 0 }}
                                          animate={{
                                            scale: [1, 1.2, 1],
                                            opacity: [0.5, 0.2, 0.5],
                                          }}
                                          transition={{
                                            duration: 3,
                                            repeat: Infinity,
                                            ease: "easeInOut",
                                          }}
                                        />
                                      )}
                                    </div>

                                    <div className="flex-1 min-w-0 pt-0.5">
                                      <div className="flex items-center gap-2 mb-0.5">
                                        <h5
                                          className={`font-black text-[12px] md:text-sm tracking-tight transition-colors duration-1000 leading-tight ${isCurrent ? (isRejectedNode ? "text-red-500" : "text-[#1799dc]") : isUpcoming ? "text-slate-400 dark:text-slate-700" : "text-emerald-500 font-bold"}`}
                                        >
                                          {step.title}
                                        </h5>
                                        {isCurrent && (
                                          <span
                                            className={`flex h-1.5 w-1.5 rounded-full ${isRejectedNode ? "bg-red-500" : "bg-[#1799dc]"} animate-pulse`}
                                          />
                                        )}
                                        {isCompleted && !isRejectedNode && (
                                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                                        )}
                                      </div>
                                      <AnimatePresence mode="wait">
                                        {(isCurrent || isCompleted) && (
                                          <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{
                                              height: "auto",
                                              opacity: 1,
                                            }}
                                            transition={{
                                              duration: 0.8,
                                              ease: "easeOut",
                                            }}
                                            className="overflow-hidden"
                                          >
                                            <p
                                              className={`text-[10px] md:text-[11px] leading-relaxed font-medium italic ${isUpcoming ? "text-slate-300 dark:text-slate-800" : isRejectedNode ? "text-red-600/70 dark:text-red-400/70" : isCompleted ? "text-emerald-600/70 dark:text-emerald-400/70" : "text-slate-500 dark:text-slate-400"}`}
                                            >
                                              {step.desc}
                                            </p>
                                          </motion.div>
                                        )}
                                      </AnimatePresence>
                                    </div>
                                  </motion.div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}
        </div>

        {/* Global Process Info Section */}
        <div className="mt-16 md:mt-24 mb-6">
          <div className="text-center mb-10 md:mb-12">
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white mb-4 tracking-tight">
              Bagaimana Pengajuan Anda Diproses?
            </h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto text-sm md:text-base leading-relaxed">
              Kami berkomitmen untuk memproses setiap amanah dan pengajuan
              dengan transparan, adil, dan melalui tahapan sesuai syariat serta
              SOP lembaga.
            </p>
          </div>

          <div className="relative">
            {/* Connecting Horizontal Line Background */}
            <div className="absolute top-[28px] md:top-[34px] left-[12.5%] right-[12.5%] h-[4px] bg-slate-200 dark:bg-slate-700 z-0 overflow-hidden rounded-full">
              <motion.div
                className="h-full bg-gradient-to-r from-[#1799dc] to-blue-400"
                initial={{ width: "0%" }}
                animate={{
                  width: `${(globalProcessStep / (PROCESS_STAGES.length - 1)) * 100}%`,
                }}
                transition={{ type: "spring", stiffness: 50, damping: 15 }}
              />
            </div>

            <div className="flex justify-between relative z-10 w-full mb-12">
              {PROCESS_STAGES.map((stage, idx) => {
                const isCompleted = globalProcessStep >= idx;
                const isCurrent = globalProcessStep === idx;
                const StageIcon = stage.icon;

                return (
                  <div
                    key={idx}
                    className="flex flex-col items-center gap-4 w-1/4 relative group"
                  >
                    <motion.div
                      initial={false}
                      animate={{
                        scale: isCurrent ? 1.15 : isCompleted ? 1 : 0.95,
                        backgroundColor: isCompleted ? "#1799dc" : "#ffffff",
                        borderColor: isCompleted ? "#1799dc" : "#e2e8f0",
                      }}
                      transition={{
                        type: "spring",
                        stiffness: 200,
                        damping: 20,
                      }}
                      className={`w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center shrink-0 border-[3px] md:border-[4px] z-10 relative
                           ${!isCompleted ? "dark:bg-slate-800 dark:border-slate-700" : "shadow-lg shadow-[#1799dc]/20"}`}
                    >
                      {isCompleted ? (
                        <StageIcon className="w-5 h-5 md:w-7 md:h-7 text-white" />
                      ) : (
                        <StageIcon className="w-5 h-5 md:w-7 md:h-7 text-slate-300 dark:text-slate-500" />
                      )}
                    </motion.div>

                    <div
                      className="text-center transition-all duration-300 transform w-full px-1"
                      style={{ opacity: isCurrent ? 1 : 0.7 }}
                    >
                      <div
                        className={`text-[9px] sm:text-[10px] md:text-xs font-bold mb-0.5 md:mb-1 uppercase tracking-widest ${isCompleted ? "text-[#1799dc]" : "text-slate-400"}`}
                      >
                        Tahap {idx + 1}
                      </div>
                      <h4
                        className={`font-black text-[10px] sm:text-sm md:text-base mb-1 md:mb-2 leading-tight uppercase tracking-wider ${isCurrent ? "text-slate-900 dark:text-white" : "text-slate-600 dark:text-slate-400"}`}
                      >
                        {stage.title}
                      </h4>
                      <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 hidden lg:block max-w-[180px] mx-auto leading-relaxed">
                        {stage.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
