/**
 * Data types for equran.id API v2
 */

export interface SurahListItem {
  nomor: number;
  nama: string;
  namaLatin: string;
  jumlahAyat: number;
  tempatTurun: string;
  arti: string;
  deskripsi: string;
}

export interface Ayah {
  nomorAyat: number;
  teksArab: string;
  teksLatin: string;
  teksIndonesia: string;
  audio: {
    "01": string; // Abdullah-Al-Juhany
    "02": string; // Abdul-Muhsin-Al-Qasim
    "03": string; // Abdurrahman-as-Sudais
    "04": string; // Ibrahim-Al-Dossari
    "05": string; // Misyari-Rasyid-Al-Afasi
  };
}

export interface SurahDetail extends SurahListItem {
  ayat: Ayah[];
}

const BASE_URL = "https://equran.id/api/v2";

export const quranService = {
  async getSurahList(): Promise<SurahListItem[]> {
    const response = await fetch(`${BASE_URL}/surat`);
    const result = await response.json();
    return result.data;
  },

  async getSurahDetail(nomor: number): Promise<SurahDetail> {
    const response = await fetch(`${BASE_URL}/surat/${nomor}`);
    const result = await response.json();
    return result.data;
  }
};
