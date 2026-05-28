import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft, Search, Clock, CheckCircle2, UserCircle, Edit2, Save, Download, Heart, TrendingUp, History, FileText, Award, Flame, Star, Sparkles, ChevronDown, ChevronUp } from "lucide-react";
import { AreaChart, Area, ResponsiveContainer, Tooltip, XAxis } from "recharts";
const mockDonationHistory = [
  {
    id: "TRX-10293",
    date: "12 Ramadhan 1447 H / 02 Mar 2026",
    program: "Air Bersih untuk Pelosok Nusantara",
    amount: 25e4,
    status: "Berhasil",
    method: "Qris",
    impact: "Dana Anda difokuskan untuk pipanisasi sepanjang 1km di Desa Suka Maju yang mengalir ke 50 KK."
  },
  {
    id: "TRX-10292",
    date: "11 Ramadhan 1447 H / 01 Mar 2026",
    program: "Sedekah Subuh",
    amount: 5e4,
    status: "Berhasil",
    method: "Gopay"
  },
  {
    id: "TRX-10291",
    date: "10 Ramadhan 1447 H / 28 Feb 2026",
    program: "Pembangunan Masjid As-Salam",
    amount: 1e6,
    status: "Pending",
    method: "Bank Transfer"
  }
];
const chartData = [
  { name: "Jan", amount: 15e4 },
  { name: "Feb", amount: 3e5 },
  { name: "Mar", amount: 2e5 },
  { name: "Apr", amount: 5e5 },
  { name: "Mei", amount: 45e4 },
  { name: "Jun", amount: 7e5 }
];
export const DonationHistory = ({ userDonations = [] }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("Semua");
  const [expandedId, setExpandedId] = useState(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileName, setProfileName] = useState(localStorage.getItem("app_user_name") || "");
  const [profilePhone, setProfilePhone] = useState(localStorage.getItem("app_user_phone") || "");
  const [inputName, setInputName] = useState(profileName);
  const [inputPhone, setInputPhone] = useState(profilePhone);
  const saveProfile = () => {
    localStorage.setItem("app_user_name", inputName);
    localStorage.setItem("app_user_phone", inputPhone);
    setProfileName(inputName);
    setProfilePhone(inputPhone);
    setIsEditingProfile(false);
  };
  const cancelEdit = () => {
    setInputName(profileName);
    setInputPhone(profilePhone);
    setIsEditingProfile(false);
  };
  const historyDataToUse = userDonations.length > 0 ? userDonations : mockDonationHistory;
  const filteredHistory = historyDataToUse.filter((item) => {
    if (activeTab === "Semua") return true;
    return item.status === activeTab;
  });
  const totalDonation = historyDataToUse.filter((item) => item.status === "Berhasil").reduce((acc, curr) => acc + curr.amount, 0);
  const getDonorLevel = (total) => {
    if (total > 5e6) return { name: "Platinum", icon: /* @__PURE__ */ jsx(Award, { className: "w-4 h-4 text-purple-500" }), color: "from-purple-400 to-purple-600", text: "text-purple-600", bg: "bg-purple-100" };
    if (total > 1e6) return { name: "Gold", icon: /* @__PURE__ */ jsx(Star, { className: "w-4 h-4 text-yellow-500" }), color: "from-yellow-400 to-amber-500", text: "text-amber-600", bg: "bg-amber-100" };
    if (total > 5e5) return { name: "Silver", icon: /* @__PURE__ */ jsx(Sparkles, { className: "w-4 h-4 text-slate-400" }), color: "from-slate-400 to-slate-500", text: "text-slate-600", bg: "bg-slate-100" };
    return { name: "Bronze", icon: /* @__PURE__ */ jsx(Flame, { className: "w-4 h-4 text-orange-500" }), color: "from-orange-400 to-red-500", text: "text-orange-600", bg: "bg-orange-100" };
  };
  const level = getDonorLevel(totalDonation);
  return /* @__PURE__ */ jsx("div", { className: "min-h-screen bg-[#f8f9fa] dark:bg-[#0f172a] pt-24 pb-12 transition-colors duration-300 font-sans selection:bg-[#1799dc]/30", children: /* @__PURE__ */ jsxs("div", { className: "max-w-4xl mx-auto px-4 md:px-6", children: [
    /* @__PURE__ */ jsx("div", { className: "flex items-center justify-between mb-8", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => navigate(-1),
          className: "w-11 h-11 bg-white dark:bg-slate-900 shadow-sm border border-slate-200 dark:border-slate-800 rounded-full flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:scale-105 active:scale-95 transition-all shrink-0",
          children: /* @__PURE__ */ jsx(ArrowLeft, { className: "w-5 h-5" })
        }
      ),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h1", { className: "text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight", children: "Akun Saya" }),
        /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-slate-500 dark:text-slate-400", children: "Jejak kebaikan & profil donatur" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 mb-10", children: [
      /* @__PURE__ */ jsx("div", { className: "lg:col-span-1", children: /* @__PURE__ */ jsx("div", { className: "bg-gradient-to-br from-[#1799dc] to-[#2db2f5] p-1 rounded-3xl shadow-xl shadow-[#1799dc]/20", children: /* @__PURE__ */ jsxs("div", { className: "bg-white dark:bg-slate-900 rounded-[22px] p-6 h-full relative overflow-hidden", children: [
        /* @__PURE__ */ jsx("div", { className: "absolute -right-8 -top-8 w-24 h-24 bg-[#1799dc]/10 dark:bg-[#1799dc]/5 rounded-full blur-xl pointer-events-none" }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-start mb-6", children: [
          /* @__PURE__ */ jsx("div", { className: "w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 border border-slate-200 dark:border-slate-700", children: /* @__PURE__ */ jsx(UserCircle, { className: "w-10 h-10" }) }),
          !isEditingProfile && /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => setIsEditingProfile(true),
              className: "w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 transition-colors",
              children: /* @__PURE__ */ jsx(Edit2, { className: "w-3.5 h-3.5" })
            }
          )
        ] }),
        !isEditingProfile ? /* @__PURE__ */ jsxs("div", { className: "mb-4 relative z-10", children: [
          /* @__PURE__ */ jsx("h2", { className: "text-xl font-bold text-slate-900 dark:text-white mb-1 truncate", children: profileName || "Hamba Allah" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm font-mono text-slate-500 dark:text-slate-400", children: profilePhone || "Belum ada no. telp" })
        ] }) : /* @__PURE__ */ jsxs("div", { className: "space-y-3 mb-6 relative z-10", children: [
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "text",
              value: inputName,
              onChange: (e) => setInputName(e.target.value),
              placeholder: "Nama Lengkap",
              className: "w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold focus:outline-none focus:border-[#1799dc] transition-colors dark:text-white"
            }
          ),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "tel",
              value: inputPhone,
              onChange: (e) => setInputPhone(e.target.value),
              placeholder: "Nomor Telepon",
              className: "w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-mono focus:outline-none focus:border-[#1799dc] transition-colors dark:text-white"
            }
          ),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 pt-2", children: [
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: cancelEdit,
                className: "flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl font-semibold text-sm transition-colors",
                children: "Batal"
              }
            ),
            /* @__PURE__ */ jsxs(
              "button",
              {
                onClick: saveProfile,
                className: "flex-1 py-2.5 bg-[#1799dc] hover:bg-[#1588c4] text-white rounded-xl font-semibold text-sm transition-colors flex items-center justify-center gap-1.5",
                children: [
                  /* @__PURE__ */ jsx(Save, { className: "w-4 h-4" }),
                  " Simpan"
                ]
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "border-t border-slate-100 dark:border-slate-800 pt-4 mt-auto", children: /* @__PURE__ */ jsx("div", { className: "flex items-center justify-between", children: /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("p", { className: "text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5", children: "Level Keanggotaan" }),
          /* @__PURE__ */ jsxs("div", { className: `inline-flex items-center gap-1.5 px-3 py-1.5 ${level.bg} dark:bg-slate-800 rounded-lg text-xs font-bold border border-white/50 dark:border-slate-700 shadow-sm`, children: [
            level.icon,
            " ",
            /* @__PURE__ */ jsxs("span", { className: `${level.text} dark:text-white`, children: [
              level.name,
              " Donatur"
            ] })
          ] })
        ] }) }) })
      ] }) }) }),
      /* @__PURE__ */ jsxs("div", { className: "lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col justify-between", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-4", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
                /* @__PURE__ */ jsx("div", { className: "w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500 flex items-center justify-center", children: /* @__PURE__ */ jsx(TrendingUp, { className: "w-5 h-5" }) }),
                /* @__PURE__ */ jsx("h3", { className: "text-sm font-semibold text-slate-600 dark:text-slate-400", children: "Total Kebaikan" })
              ] }),
              /* @__PURE__ */ jsxs("button", { className: "text-[11px] font-bold text-[#1799dc] bg-[#1799dc]/10 px-3 py-1.5 rounded-lg flex items-center gap-1.5 hover:bg-[#1799dc]/20 transition-colors", children: [
                /* @__PURE__ */ jsx(FileText, { className: "w-3.5 h-3.5" }),
                " Bukti Potong Pajak"
              ] })
            ] }),
            /* @__PURE__ */ jsxs("p", { className: "text-3xl lg:text-4xl font-black text-slate-900 dark:text-white tracking-tight", children: [
              "Rp ",
              totalDonation.toLocaleString("id-ID")
            ] })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "h-24 w-full mt-4", children: /* @__PURE__ */ jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxs(AreaChart, { data: chartData, margin: { top: 5, right: 0, left: 0, bottom: 0 }, children: [
            /* @__PURE__ */ jsx("defs", { children: /* @__PURE__ */ jsxs("linearGradient", { id: "colorAmount", x1: "0", y1: "0", x2: "0", y2: "1", children: [
              /* @__PURE__ */ jsx("stop", { offset: "5%", stopColor: "#10b981", stopOpacity: 0.3 }),
              /* @__PURE__ */ jsx("stop", { offset: "95%", stopColor: "#10b981", stopOpacity: 0 })
            ] }) }),
            /* @__PURE__ */ jsx(
              Tooltip,
              {
                formatter: (value) => [`Rp ${value.toLocaleString("id-ID")}`, "Donasi"],
                contentStyle: { borderRadius: "12px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }
              }
            ),
            /* @__PURE__ */ jsx(XAxis, { dataKey: "name", axisLine: false, tickLine: false, tick: { fontSize: 10, fill: "#94a3b8" }, dy: 5 }),
            /* @__PURE__ */ jsx(Area, { type: "monotone", dataKey: "amount", stroke: "#10b981", strokeWidth: 3, fillOpacity: 1, fill: "url(#colorAmount)" })
          ] }) }) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col justify-between", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 mb-4", children: [
              /* @__PURE__ */ jsx("div", { className: "w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-500 flex items-center justify-center", children: /* @__PURE__ */ jsx(History, { className: "w-5 h-5" }) }),
              /* @__PURE__ */ jsx("h3", { className: "text-sm font-semibold text-slate-600 dark:text-slate-400", children: "Transaksi Berhasil" })
            ] }),
            /* @__PURE__ */ jsxs("p", { className: "text-3xl lg:text-4xl font-black text-slate-900 dark:text-white tracking-tight", children: [
              historyDataToUse.filter((h) => h.status === "Berhasil").length,
              " ",
              /* @__PURE__ */ jsx("span", { className: "text-lg text-slate-400 font-medium", children: "kali" })
            ] })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "mt-8 bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-100 dark:border-slate-700/50", children: /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3", children: [
            /* @__PURE__ */ jsx("div", { className: "w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0", children: /* @__PURE__ */ jsx(Heart, { className: "w-4 h-4 fill-current" }) }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("h4", { className: "text-sm font-bold text-slate-900 dark:text-white", children: "Donasi Rutin Aktif" }),
              /* @__PURE__ */ jsx("p", { className: "text-xs text-slate-500 mt-0.5", children: "Sedekah Subuh Rp 10.000/hari" })
            ] })
          ] }) })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6", children: [
        /* @__PURE__ */ jsx("h2", { className: "text-xl font-bold text-slate-900 dark:text-white", children: "Riwayat Transaksi" }),
        /* @__PURE__ */ jsx("div", { className: "flex items-center gap-2", children: /* @__PURE__ */ jsx("div", { className: "flex items-center bg-white dark:bg-slate-900 p-1 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800", children: ["Semua", "Berhasil", "Pending"].map((tab) => /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => setActiveTab(tab),
            className: `px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === tab ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"}`,
            children: tab
          },
          tab
        )) }) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsx(AnimatePresence, { children: filteredHistory.map((item, i) => /* @__PURE__ */ jsxs(
          motion.div,
          {
            initial: { opacity: 0, y: 10 },
            animate: { opacity: 1, y: 0 },
            exit: { opacity: 0, scale: 0.95 },
            transition: { duration: 0.2 },
            className: "group bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col gap-4 sm:gap-6 hover:shadow-md transition-all sm:hover:-translate-y-0.5",
            children: [
              /* @__PURE__ */ jsxs("div", { className: "flex flex-col md:flex-row md:items-center justify-between gap-4", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4 flex-1 min-w-0", children: [
                  /* @__PURE__ */ jsx("div", { className: `w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${item.status === "Berhasil" ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500" : "bg-orange-50 dark:bg-orange-500/10 text-orange-500"}`, children: item.status === "Berhasil" ? /* @__PURE__ */ jsx(CheckCircle2, { className: "w-6 h-6" }) : /* @__PURE__ */ jsx(Clock, { className: "w-6 h-6" }) }),
                  /* @__PURE__ */ jsxs("div", { className: "min-w-0 flex-1", children: [
                    /* @__PURE__ */ jsx("h3", { className: "font-bold text-slate-900 dark:text-white text-[15px] truncate mb-0.5 group-hover:text-[#1799dc] transition-colors", children: item.program }),
                    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-medium", children: [
                      /* @__PURE__ */ jsx("span", { className: "font-mono", children: item.id }),
                      /* @__PURE__ */ jsx("span", { className: "w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600" }),
                      /* @__PURE__ */ jsx("span", { children: item.date.split(" / ")[1] || item.date })
                    ] })
                  ] })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "flex flex-col md:items-end justify-end pl-16 md:pl-0", children: [
                  /* @__PURE__ */ jsxs("p", { className: "font-black text-slate-900 dark:text-white text-lg", children: [
                    "Rp ",
                    item.amount.toLocaleString("id-ID")
                  ] }),
                  /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mt-1", children: [
                    /* @__PURE__ */ jsx("span", { className: `text-[10px] uppercase font-bold tracking-wider ${item.status === "Berhasil" ? "text-emerald-500" : "text-orange-500"}`, children: item.status }),
                    item.status === "Berhasil" && /* @__PURE__ */ jsxs(Fragment, { children: [
                      /* @__PURE__ */ jsx("span", { className: "w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600" }),
                      /* @__PURE__ */ jsxs("button", { className: "text-[10px] flex items-center gap-1 font-bold text-[#1799dc] hover:text-[#127fb8]", children: [
                        /* @__PURE__ */ jsx(Download, { className: "w-3 h-3" }),
                        " Bukti"
                      ] })
                    ] })
                  ] })
                ] })
              ] }),
              item.status === "Berhasil" && /* @__PURE__ */ jsxs("div", { className: "border-t border-slate-100 dark:border-slate-800 pt-4 mt-2", children: [
                /* @__PURE__ */ jsxs(
                  "button",
                  {
                    onClick: () => setExpandedId(expandedId === item.id ? null : item.id),
                    className: "w-full flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-[#1799dc] transition-colors",
                    children: [
                      /* @__PURE__ */ jsx("span", { children: "Detail & Laporan Penyaluran" }),
                      expandedId === item.id ? /* @__PURE__ */ jsx(ChevronUp, { className: "w-4 h-4" }) : /* @__PURE__ */ jsx(ChevronDown, { className: "w-4 h-4" })
                    ]
                  }
                ),
                /* @__PURE__ */ jsx(AnimatePresence, { children: expandedId === item.id && /* @__PURE__ */ jsx(
                  motion.div,
                  {
                    initial: { height: 0, opacity: 0 },
                    animate: { height: "auto", opacity: 1 },
                    exit: { height: 0, opacity: 0 },
                    className: "overflow-hidden",
                    children: /* @__PURE__ */ jsxs("div", { className: "pt-4 grid grid-cols-1 md:grid-cols-2 gap-4", children: [
                      /* @__PURE__ */ jsxs("div", { className: "bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl", children: [
                        /* @__PURE__ */ jsx("p", { className: "text-[10px] uppercase font-bold tracking-wide text-slate-400 mb-2", children: "Informasi Transaksi" }),
                        /* @__PURE__ */ jsxs("div", { className: "space-y-2 text-xs text-slate-600 dark:text-slate-300", children: [
                          /* @__PURE__ */ jsxs("div", { className: "flex justify-between", children: [
                            /* @__PURE__ */ jsx("span", { className: "font-medium text-slate-500", children: "Metode" }),
                            /* @__PURE__ */ jsx("span", { className: "font-bold", children: item.method || "Transfer Bank" })
                          ] }),
                          /* @__PURE__ */ jsxs("div", { className: "flex justify-between", children: [
                            /* @__PURE__ */ jsx("span", { className: "font-medium text-slate-500", children: "Waktu" }),
                            /* @__PURE__ */ jsx("span", { className: "font-bold", children: item.date.split(" / ")[0] })
                          ] })
                        ] })
                      ] }),
                      /* @__PURE__ */ jsxs("div", { className: "bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl", children: [
                        /* @__PURE__ */ jsx("p", { className: "text-[10px] uppercase font-bold tracking-wide text-slate-400 mb-4", children: "Timeline Penyaluran" }),
                        /* @__PURE__ */ jsxs("div", { className: "relative pl-4 border-l-2 border-slate-200 dark:border-slate-700 space-y-6", children: [
                          /* @__PURE__ */ jsxs("div", { className: "relative", children: [
                            /* @__PURE__ */ jsx("div", { className: "absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-50 dark:ring-emerald-900/20" }),
                            /* @__PURE__ */ jsx("h4", { className: "text-[13px] font-bold text-slate-900 dark:text-white", children: "Donasi Diterima" }),
                            /* @__PURE__ */ jsx("p", { className: "text-[11px] text-slate-500 mt-0.5", children: item.date.split(" / ")[0] })
                          ] }),
                          /* @__PURE__ */ jsxs("div", { className: "relative", children: [
                            /* @__PURE__ */ jsx("div", { className: `absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full ${item.impact ? "bg-emerald-500 ring-4 ring-emerald-50 dark:ring-emerald-900/20" : "bg-[#1799dc] ring-4 ring-blue-50 dark:ring-blue-900/20"}` }),
                            /* @__PURE__ */ jsx("h4", { className: `text-[13px] font-bold ${item.impact ? "text-slate-900 dark:text-white" : "text-[#1799dc]"}`, children: "Proses Penyaluran" }),
                            /* @__PURE__ */ jsx("p", { className: "text-[11px] text-slate-500 mt-0.5", children: item.impact ? "Selesai" : "Sedang diproses oleh tim di lapangan" })
                          ] }),
                          /* @__PURE__ */ jsxs("div", { className: "relative", children: [
                            /* @__PURE__ */ jsx("div", { className: `absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full ${item.impact ? "bg-emerald-500 ring-4 ring-emerald-50 dark:ring-emerald-900/20" : "bg-slate-300 dark:bg-slate-600"}` }),
                            /* @__PURE__ */ jsx("h4", { className: `text-[13px] font-bold ${item.impact ? "text-slate-900 dark:text-white" : "text-slate-400 dark:text-slate-500"}`, children: "Donasi Tersalurkan" }),
                            /* @__PURE__ */ jsx("p", { className: "text-[11px] text-slate-500 mt-0.5", children: item.impact ? "Laporan implementasi tersedia" : "Menunggu update laporan" }),
                            item.impact && /* @__PURE__ */ jsxs("div", { className: "mt-3 bg-emerald-50/80 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800/30 p-3 rounded-xl", children: [
                              /* @__PURE__ */ jsxs("p", { className: "text-[10px] uppercase font-bold tracking-wide text-emerald-600 dark:text-emerald-400 mb-1.5 flex items-center gap-1.5", children: [
                                /* @__PURE__ */ jsx(Heart, { className: "w-3 h-3" }),
                                " Dampak Donasi Anda"
                              ] }),
                              /* @__PURE__ */ jsx("p", { className: "text-xs text-emerald-800 dark:text-emerald-200 font-medium leading-relaxed", children: item.impact })
                            ] })
                          ] })
                        ] })
                      ] })
                    ] })
                  }
                ) })
              ] })
            ]
          },
          item.id
        )) }),
        filteredHistory.length === 0 && /* @__PURE__ */ jsxs("div", { className: "text-center py-12", children: [
          /* @__PURE__ */ jsx("div", { className: "w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4", children: /* @__PURE__ */ jsx(Search, { className: "w-6 h-6 text-slate-400" }) }),
          /* @__PURE__ */ jsx("p", { className: "text-slate-500 dark:text-slate-400 font-medium", children: "Tidak ada transaksi ditemukan." })
        ] })
      ] })
    ] })
  ] }) });
};
export default DonationHistory;
