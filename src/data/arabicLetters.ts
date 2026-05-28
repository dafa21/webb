export interface ArabicLetter {
  id: string;
  arabic: string;
  latin: string;
  makhrajCategory: string;
  makhrajArea: string;
  description: string;
  positionDetails: string;
  audioUrl?: string;
}

const GITHUB_AUDIO_BASE = "https://raw.githubusercontent.com/razunatmohammed88-cyber/arabic-alphabet-audio/main";

export const arabicLetters: ArabicLetter[] = [
  { id: 'alif', arabic: 'ا', latin: 'Alif', makhrajCategory: 'Al-Jauf', makhrajArea: 'jauf', description: 'Bunyi memanjang tanpa hambatan.', positionDetails: 'Rongga mulut bagian dalam.', audioUrl: `${GITHUB_AUDIO_BASE}/alif.mp3` },
  { id: 'ba', arabic: 'ب', latin: 'Ba', makhrajCategory: 'Asy-Syafatain', makhrajArea: 'lips', description: 'Diucapkan dengan merapatkan kedua belah bibir lebih kuat.', positionDetails: 'Kedua bibir tertutup rapat', audioUrl: `${GITHUB_AUDIO_BASE}/baa.mp3` },
  { id: 'ta', arabic: 'ت', latin: 'Ta', makhrajCategory: 'Al-Lisan', makhrajArea: 'tip-gum', description: 'Ujung lidah menempel keras pada pangkal gigi seri atas.', positionDetails: 'Ujung lidah di pangkal gigi seri atas', audioUrl: `${GITHUB_AUDIO_BASE}/taa.mp3` },
  { id: 'tha', arabic: 'ث', latin: 'Tha', makhrajCategory: 'Al-Lisan', makhrajArea: 'tip-teeth', description: 'Ujung lidah sedikit keluar dan menempel lembut pada tepi gigi seri atas.', positionDetails: 'Ujung lidah ujung gigi seri atas', audioUrl: `${GITHUB_AUDIO_BASE}/thaa.mp3` },
  { id: 'jeem', arabic: 'ج', latin: 'Jeem', makhrajCategory: 'Al-Lisan', makhrajArea: 'mid-tongue', description: 'Tengah lidah diangkat dan disentuhkan kuat ke langit-langit keras.', positionDetails: 'Tengah lidah menempel langit-langit', audioUrl: `${GITHUB_AUDIO_BASE}/jiim.mp3` },
  { id: 'ha', arabic: 'ح', latin: 'Ha', makhrajCategory: 'Al-Halq', makhrajArea: 'mid-throat', description: 'Diucapkan dari tengah tenggorokan, suara bersih tanpa serak.', positionDetails: 'Tengah tenggorokan (Epiglotis)', audioUrl: `${GITHUB_AUDIO_BASE}/haa%27.mp3` },
  { id: 'kha', arabic: 'خ', latin: 'Kha', makhrajCategory: 'Al-Halq', makhrajArea: 'top-throat', description: 'Diucapkan dari tenggorokan bagian atas dengan suara serak yang tebal.', positionDetails: 'Tenggorokan bagian atas', audioUrl: `${GITHUB_AUDIO_BASE}/khaa.mp3` },
  { id: 'dal', arabic: 'د', latin: 'Dal', makhrajCategory: 'Al-Lisan', makhrajArea: 'tip-gum', description: 'Ujung lidah menempel pada pangkal gigi seri atas, diucapkan lebih ringan dari Ta.', positionDetails: 'Ujung lidah di pangkal gigi seri atas', audioUrl: `${GITHUB_AUDIO_BASE}/daal.mp3` },
  { id: 'dhal', arabic: 'ذ', latin: 'Dhal', makhrajCategory: 'Al-Lisan', makhrajArea: 'tip-teeth', description: 'Ujung lidah menempel lembut pada tepi gigi seri atas, dibaca tipis.', positionDetails: 'Ujung lidah ujung gigi seri atas', audioUrl: `${GITHUB_AUDIO_BASE}/thaal.mp3` },
  { id: 'ra', arabic: 'ر', latin: 'Ra', makhrajCategory: 'Al-Lisan', makhrajArea: 'tip-gum-back', description: 'Punggung ujung lidah menempel pada gusi, ada sedikit getaran halus.', positionDetails: 'Punggung ujung lidah menempel gusi', audioUrl: `${GITHUB_AUDIO_BASE}/raa.mp3` },
  { id: 'zay', arabic: 'ز', latin: 'Zay', makhrajCategory: 'Al-Lisan', makhrajArea: 'tip-lower', description: 'Ujung lidah berada di belakang gigi seri bawah, suara berdesing.', positionDetails: 'Ujung lidah di belakang gigi seri bawah', audioUrl: `${GITHUB_AUDIO_BASE}/zaay.mp3` },
  { id: 'seen', arabic: 'س', latin: 'Seen', makhrajCategory: 'Al-Lisan', makhrajArea: 'tip-lower', description: 'Ujung lidah di belakang gigi seri bawah, mendesis tajam.', positionDetails: 'Ujung lidah di belakang gigi seri bawah', audioUrl: `${GITHUB_AUDIO_BASE}/siin.mp3` },
  { id: 'sheen', arabic: 'ش', latin: 'Sheen', makhrajCategory: 'Al-Lisan', makhrajArea: 'mid-tongue', description: 'Tengah lidah diangkat mendekati langit-langit, udara menyebar di mulut.', positionDetails: 'Tengah lidah mendekati langit-langit', audioUrl: `${GITHUB_AUDIO_BASE}/shiin.mp3` },
  { id: 'sad', arabic: 'ص', latin: 'Sad', makhrajCategory: 'Al-Lisan', makhrajArea: 'tip-lower-thick', description: 'Ujung lidah di belakang gigi seri bawah, pangkal lidah terangkat (tebal).', positionDetails: 'Ujung lidah & pangkal lidah naik', audioUrl: `${GITHUB_AUDIO_BASE}/saad.mp3` },
  { id: 'dhad', arabic: 'ض', latin: 'Dhad', makhrajCategory: 'Al-Lisan', makhrajArea: 'side-tongue', description: 'Tepi lidah (kanan/kiri) menempel pada gigi geraham atas.', positionDetails: 'Sisi lidah & geraham atas', audioUrl: `${GITHUB_AUDIO_BASE}/daad.mp3` },
  { id: 'taa', arabic: 'ط', latin: 'Ta (Tebal)', makhrajCategory: 'Al-Lisan', makhrajArea: 'tip-gum-thick', description: 'Ujung lidah menempel keras pada pangkal gigi seri atas dengan pangkal lidah terangkat.', positionDetails: 'Ujung lidah kuat di pangkal gigi seri atas', audioUrl: `${GITHUB_AUDIO_BASE}/taa%27.mp3` },
  { id: 'zaa', arabic: 'ظ', latin: 'Za (Tebal)', makhrajCategory: 'Al-Lisan', makhrajArea: 'tip-teeth-thick', description: 'Ujung lidah sedikit keluar menempel tepi gigi seri atas, pangkal lidah terangkat.', positionDetails: 'Ujung lidah di tepi gigi seri atas', audioUrl: `${GITHUB_AUDIO_BASE}/thaa%27.mp3` },
  { id: 'ayn', arabic: 'ع', latin: 'Ayn', makhrajCategory: 'Al-Halq', makhrajArea: 'mid-throat', description: 'Tengah tenggorokan dikencangkan sedikit, suara tertahan ringan.', positionDetails: 'Tengah tenggorokan', audioUrl: `${GITHUB_AUDIO_BASE}/%C3%A0yn.mp3` },
  { id: 'ghayn', arabic: 'غ', latin: 'Ghayn', makhrajCategory: 'Al-Halq', makhrajArea: 'top-throat', description: 'Tenggorokan bagian atas, seperti berkumur namun lembut.', positionDetails: 'Tenggorokan bagian atas', audioUrl: `${GITHUB_AUDIO_BASE}/ghayn.mp3` },
  { id: 'fa', arabic: 'ف', latin: 'Fa', makhrajCategory: 'Asy-Syafatain', makhrajArea: 'lip-teeth', description: 'Bagian dalam bibir bawah menempel pada ujung gigi seri atas.', positionDetails: 'Bibir bawah dalam & gigi seri atas', audioUrl: `${GITHUB_AUDIO_BASE}/faa.mp3` },
  { id: 'qaf', arabic: 'ق', latin: 'Qaf', makhrajCategory: 'Al-Lisan', makhrajArea: 'back-tongue-top', description: 'Pangkal lidah paling belakang dinaikkan ke langit-langit lunak.', positionDetails: 'Pangkal lidah belakang & langit-langit lunak', audioUrl: `${GITHUB_AUDIO_BASE}/qaaf.mp3` },
  { id: 'kaf', arabic: 'ك', latin: 'Kaf', makhrajCategory: 'Al-Lisan', makhrajArea: 'back-tongue-mid', description: 'Pangkal lidah dinaikkan ke langit-langit keras, sedikit di bawah Qaf.', positionDetails: 'Pangkal lidah & langit-langit keras', audioUrl: `${GITHUB_AUDIO_BASE}/kaaf.mp3` },
  { id: 'lam', arabic: 'ل', latin: 'Lam', makhrajCategory: 'Al-Lisan', makhrajArea: 'tip-side', description: 'Ujung tepi lidah bertemu dengan gusi gigi seri atas hingga gigi taring.', positionDetails: 'Ujung tepi lidah ke gusi atas', audioUrl: `${GITHUB_AUDIO_BASE}/laam.mp3` },
  { id: 'meem', arabic: 'م', latin: 'Meem', makhrajCategory: 'Asy-Syafatain', makhrajArea: 'lips-nasal', description: 'Kedua bibir terkatup lembut, suara disertai dengung (ghunnah) dari hidung.', positionDetails: 'Kedua bibir rapat dengan dengungan', audioUrl: `${GITHUB_AUDIO_BASE}/miim.mp3` },
  { id: 'noon', arabic: 'ن', latin: 'Noon', makhrajCategory: 'Al-Lisan', makhrajArea: 'tip-gum-nasal', description: 'Ujung lidah menempel pada gusi atas, disertai dengung nasal.', positionDetails: 'Ujung lidah gusi atas dengan dengungan', audioUrl: `${GITHUB_AUDIO_BASE}/nuun.mp3` },
  { id: 'ha_small', arabic: 'ه', latin: 'Ha', makhrajCategory: 'Al-Halq', makhrajArea: 'bottom-throat', description: 'Pangkal tenggorokan paling dalam (katup pita suara), udara mengalir.', positionDetails: 'Pangkal tenggorokan terdalam', audioUrl: `${GITHUB_AUDIO_BASE}/haa.mp3` },
  { id: 'waw', arabic: 'و', latin: 'Waw', makhrajCategory: 'Asy-Syafatain', makhrajArea: 'lips-round', description: 'Kedua bibir membulat dan maju menyisakan celah.', positionDetails: 'Kedua bibir membulat (terbuka sedikit)', audioUrl: `${GITHUB_AUDIO_BASE}/waaw.mp3` },
  { id: 'ya', arabic: 'ي', latin: 'Ya', makhrajCategory: 'Al-Lisan', makhrajArea: 'mid-tongue-open', description: 'Tengah lidah terangkat namun menyisakan celah suara mengalir.', positionDetails: 'Tengah lidah naik (tidak menempel penuh)', audioUrl: `${GITHUB_AUDIO_BASE}/yaa.mp3` },
  { id: 'hamza', arabic: 'ء', latin: 'Hamza', makhrajCategory: 'Al-Halq', makhrajArea: 'bottom-throat', description: 'Pangkal tenggorokan, pita suara menutup dan membuka dengan tegas.', positionDetails: 'Pangkal tenggorokan terdalam', audioUrl: `${GITHUB_AUDIO_BASE}/hamzah.mp3` },
];
