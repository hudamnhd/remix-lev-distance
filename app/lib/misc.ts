import { parseIfString } from "~/lib/utils";

export function parseMetadata(data) {
  const m = parseIfString(data?.metadata);
  if (!m) return null;
  const fileLaporan = parseIfString(m?.fileLaporan);
  const lm = parseIfString(m?.laporanMagang);
  if (!lm) return null;
  const hardSkills = parseIfString(lm?.hardSkills);
  const softSkills = parseIfString(lm?.softSkills);
  const nilai = parseIfString(m?.nilai);
  if (!nilai) return null;
  const all = {
    ...m,
    hardSkills,
    softSkills,
    fileLaporan,
    nilai,
  };
  return all;
}

export function compressData(data) {
  const abbreviations = {
    name: "na",
    address: "ad",
    jenisMagang: "jm",
    status: "st",
    mataKuliah: "mk",
    codeKuliah: "ck",
    id: "id",
    konsultasiPA: "kp",
    rancangKRS: "rk",
    learningAgreement: "la",
    validasiDekan: "vd",
    validasiKaprodi: "vk",
    fileLaporan: "fl",
    tanggalSidang: "ts",
    nilai: "nl",
    hardSkills: "ha",
    softSkills: "sa",
    value: "va",
    category: "ca",
    code: "co",
    matakuliah: "ma",
    score: "sc",
  };

  // Membantu untuk convert object key menjadi dua huruf
  const convertToAbbr = (obj) => {
    const result = {};
    for (const key in obj) {
      const abbr = abbreviations[key];
      if (abbr) {
        // Jika key ada dalam dictionary, ganti dengan dua huruf
        if (Array.isArray(obj[key])) {
          // Jika nilai adalah array, kita perlu handle array (contohnya laporanMagang, nilai, dll.)
          result[abbr] = obj[key].map((item) => {
            if (item && typeof item === "object") {
              // Jika objek di dalam array, pilih hanya field yang dibutuhkan (code, score)
              if (key === "nilai") {
                return {
                  co: item.code,
                  sc: item.score,
                };
              }
              return convertToAbbr(item); // Rekursif jika ada objek di dalam array
            }
            return item;
          });
        } else {
          // Jika nilainya boolean, ubah ke 0 atau 1
          if (typeof obj[key] === "boolean") {
            result[abbr] = obj[key] ? 1 : 0;
          }
          // Jika key adalah tanggal, ubah menjadi Unix timestamp
          else if (key.includes("tanggal") || key.includes("PA")) {
            // Mengubah string tanggal menjadi timestamp Unix
            result[abbr] = new Date(obj[key]).getTime();
          } else {
            result[abbr] = obj[key];
          }
        }
      }
    }
    return result;
  };

  return convertToAbbr(data);
}

export function decompressData(data) {
  const abbreviations = {
    na: "name",
    ad: "address",
    jm: "jenisMagang",
    st: "status",
    mk: "mataKuliah",
    ck: "codeKuliah",
    id: "id",
    kp: "konsultasiPA",
    rk: "rancangKRS",
    la: "learningAgreement",
    vd: "validasiDekan",
    vk: "validasiKaprodi",
    fl: "fileLaporan",
    ts: "tanggalSidang",
    nl: "nilai",
    ha: "hardSkills",
    sa: "softSkills",
    va: "value",
    ca: "category",
    co: "code",
    ma: "matakuliah",
    sc: "score",
  };

  // Membantu untuk mengembalikan object key yang telah dipendekkan ke aslinya
  const convertToOriginal = (obj) => {
    const result = {};
    for (const key in obj) {
      const originalKey = abbreviations[key];
      if (originalKey) {
        // Jika key ditemukan dalam dictionary, ganti dengan nama aslinya
        if (Array.isArray(obj[key])) {
          // Jika nilai adalah array, kita perlu handle array (contohnya laporanMagang, nilai, dll.)
          result[originalKey] = obj[key].map((item) => {
            if (item && typeof item === "object") {
              // Jika objek di dalam array, kita rekursif kembali untuk konversi
              if (key === "nl") {
                return {
                  code: item.co,
                  score: item.sc,
                };
              }
              return convertToOriginal(item); // Rekursif jika ada objek di dalam array
            }
            return item;
          });
        } else {
          // Jika nilai adalah 0 atau 1 (boolean), ubah kembali menjadi boolean
          if (
            typeof obj[key] === "number" &&
            (obj[key] === 0 || obj[key] === 1)
          ) {
            result[originalKey] = obj[key] === 1;
          }
          // Jika nilai adalah Unix timestamp, ubah kembali menjadi tanggal
          else if (key === "ts" || key === "kp") {
            result[originalKey] = new Date(obj[key]).toISOString(); // Mengubah Unix timestamp ke string ISO 8601
          } else {
            result[originalKey] = obj[key];
          }
        }
      }
    }
    return result;
  };

  return convertToOriginal(data);
}
