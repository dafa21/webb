import { ReactNode } from 'react';

export interface MakhrajDetail {
  id: string;
  name: string;
  arabicName: string;
  shortDesc: string;
  description: string;
  letters: string[];
  parts?: { name: string; letters: string[]; desc: string }[];
  imageUrl?: string;
  icon?: string;
}

export const makhrajData: MakhrajDetail[] = [
  {
    id: "al-jauf",
    name: "Al-Jauf",
    arabicName: "الجَوْف",
    shortDesc: "Rongga Mulut & Tenggorokan",
    description: "Al-Jauf adalah ruang kosong atau rongga yang memanjang dari tenggorokan hingga ke mulut. Ini adalah tempat keluarnya huruf-huruf mad (panjang) di mana suara mengalir tanpa hambatan pada organ berbicara.",
    letters: ["ا", "و", "ي"],
    parts: [
      {
        name: "Huruf Mad",
        letters: ["ا", "و", "ي"],
        desc: "Alif yang didahului fathah, Wawu sukun yang didahului dhommah, dan Ya sukun yang didahului kasrah. Suaranya berakhir selesainya udara."
      }
    ],
    imageUrl: "https://images.unsplash.com/photo-1579781354186-012d7e850eb7?auto=format&fit=crop&q=80&w=800", // Placeholder abstract air/breath
    icon: "Wind"
  },
  {
    id: "al-halq",
    name: "Al-Halq",
    arabicName: "الحَلْق",
    shortDesc: "Tenggorokan",
    description: "Al-Halq adalah saluran tenggorokan tempat keluarnya enam huruf idzhar halqi. Area ini memanjang dari pita suara ke bagian atas laring.",
    letters: ["ء", "ه", "ع", "ح", "غ", "خ"],
    parts: [
      {
        name: "Pangkal Tenggorokan (Aqshal Halq)",
        letters: ["ء", "ه"],
        desc: "Keluar dari titik yang paling dalam di dekat pita suara."
      },
      {
        name: "Tengah Tenggorokan (Wasathul Halq)",
        letters: ["ع", "ح"],
        desc: "Keluar dari tengah tenggorokan pada area katup epiglotis."
      },
      {
        name: "Ujung Tenggorokan (Adnal Halq)",
        letters: ["غ", "خ"],
        desc: "Keluar dari bagian atas tenggorokan, tepat mengarah ke rongga mulut."
      }
    ],
    imageUrl: "https://images.unsplash.com/photo-1544365558-35aa4afcf11f?auto=format&fit=crop&q=80&w=800", 
    icon: "Activity"
  },
  {
    id: "al-lisan",
    name: "Al-Lisan",
    arabicName: "اللِّسَان",
    shortDesc: "Lidah (18 Huruf)",
    description: "Al-Lisan adalah organ artikulasi utama untuk mengucapkan sebagian besar huruf Arab. Terdapat 10 titik keluarnya suara di lidah yang secara keseluruhan menghasilkan 18 huruf.",
    letters: ["ق", "ك", "ج", "ش", "ي", "ض", "ل", "ن", "ر", "ط", "د", "ت", "ص", "س", "ز", "ظ", "ذ", "ث"],
    parts: [
      {
        name: "Pangkal Lidah Paling Dalam",
        letters: ["ق"],
        desc: "Pangkal lidah paling belakang dinaikkan ke langit-langit lunak."
      },
      {
        name: "Pangkal Lidah Depan",
        letters: ["ك"],
        desc: "Pangkal lidah dinaikkan ke langit-langit agak keras (di bawah makhraj Qof)."
      },
      {
        name: "Tengah Lidah",
        letters: ["ج", "ش", "ي"],
        desc: "Tengah lidah diangkat dan disentuhkan ke langit-langit."
      },
      {
        name: "Tepi Lidah",
        letters: ["ض"],
        desc: "Sisi lidah menempel pada gigi geraham atas (kanan, kiri, atau keduanya)."
      },
      {
        name: "Ujung Tepi Lidah",
        letters: ["ل"],
        desc: "Ujung tepi lidah bertemu dengan gusi gigi seri atas."
      },
      {
        name: "Ujung Lidah Bawah",
        letters: ["ن"],
        desc: "Ujung lidah menempel pada gusi gigi atas, di bawah tempat lam."
      },
      {
        name: "Punggung Ujung Lidah",
        letters: ["ر"],
        desc: "Punggung ujung lidah menempel pada gusi, agak lebih ke depan."
      },
      {
        name: "Pangkal Seri Atas",
        letters: ["ط", "د", "ت"],
        desc: "Ujung lidah menempel keras ke pangkal gigi seri atas."
      },
      {
        name: "Ujung Seri Bawah",
        letters: ["ص", "س", "ز"],
        desc: "Ujung lidah berada di belakang gigi seri bawah, suara keluar di selanya."
      },
      {
        name: "Ujung Seri Atas",
        letters: ["ظ", "ذ", "ث"],
        desc: "Ujung lidah menempel sedikit ke ujung gigi seri atas dan sedikit keluar."
      }
    ],
    imageUrl: "https://images.unsplash.com/photo-1588718090710-18451b5ca817?auto=format&fit=crop&q=80&w=800",
    icon: "MessageCircle"
  },
  {
    id: "asy-syafatain",
    name: "Asy-Syafatain",
    arabicName: "الشَّفَتَان",
    shortDesc: "Dua Bibir",
    description: "Asy-Syafatain merujuk pada artikulasi menggunakan kedua bibir, baik dengan mengatupkannya atau membulatkannya.",
    letters: ["ف", "و", "ب", "م"],
    parts: [
      {
        name: "Bibir Bawah Dalam & Gigi Seri Atas",
        letters: ["ف"],
        desc: "Bagian dalam bibir bawah menempel lembut pada ujung gigi seri atas."
      },
      {
        name: "Kedua Bibir Tertutup Rapat",
        letters: ["ب", "م"],
        desc: "B diucapkan lebih kuat. M memiliki dengungan di hidung."
      },
      {
        name: "Kedua Bibir Membulat",
        letters: ["و"],
        desc: "Bibir membulat (terbuka sedikit) dengan menaikkan pangkal lidah."
      }
    ],
    imageUrl: "https://images.unsplash.com/photo-1595123550441-d377e017ea3e?auto=format&fit=crop&q=80&w=800",
    icon: "Smile"
  },
  {
    id: "al-khaisyum",
    name: "Al-Khaisyum",
    arabicName: "الخَيْشُوم",
    shortDesc: "Rongga Hidung (Ghunnah)",
    description: "Al-Khaisyum adalah rongga hidung. Alih-alih tempat keluarnya huruf tertentu, ini adalah tempat keluarnya sifat 'Ghunnah' (suara dengung/nasal) untuk huruf mim dan nun dalam kondisi tertentu (seperti tasydid atau ikhfa).",
    letters: ["ن", "م"],
    parts: [
      {
        name: "Ghunnah (Dengung Nasal)",
        letters: ["m"], // Represents sound
        desc: "Suara dengung yang menyertai huruf Nun dan Mim bertasydid, serta hukum Ikhfa dan Idgham Bighunnah."
      }
    ],
    imageUrl: "https://images.unsplash.com/photo-1601314986884-6338b556b6fb?auto=format&fit=crop&q=80&w=800",
    icon: "Box"
  }
];
