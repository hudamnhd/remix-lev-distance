import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const products = [
    {
      id: "b1b0bf4b-8ee2-4a5e-befc-4af1c6a35517",
      createdAt: new Date("2024-09-09T03:52:28.199Z"), // Konversi ke Date
      metadata:
        '{"name":"MHS2","address":"0x3293938014CE7a641177d45bF1c06bd7CD1e7b09","jenisMagang":"DIKTI","status":2,"mataKuliah":"Machine Learning","codeKuliah":"CIE407","id":"b1b0bf4b-8ee2-4a5e-befc-4af1c6a35517","konsultasiPA":"2024-09-09T00:00:00.000Z","rancangKRS":true,"learningAgreement":true,"validasiDekan":true,"validasiKaprodi":true,"laporanMagang":"{\\"hardSkills\\":[{\\"name\\":\\"Teknis Coding\\",\\"value\\":86}],\\"softSkills\\":[{\\"name\\":\\"Kedisiplinan\\",\\"value\\":92}]}","fileLaporan":"[\\"Screenshot 2024-09-09 at 09.20.39.png\\"]","tanggalSidang":"Tue Sep 10 2024 07:00:00 GMT+0700 (Western Indonesia Time)","nilai":"[{\\"category\\":4,\\"code\\":\\"UNV211\\",\\"matakuliah\\":\\"Kewirausahaan 1\\",\\"score\\":3.93},{\\"category\\":4,\\"code\\":\\"UEU101\\",\\"matakuliah\\":\\"Bahasa Inggris 1\\",\\"score\\":3.93},{\\"category\\":1,\\"code\\":\\"CIE510\\",\\"matakuliah\\":\\"Kecerdasan Artifisial\\",\\"score\\":6.79},{\\"category\\":1,\\"code\\":\\"CIE516\\",\\"matakuliah\\":\\"Perancangan Aplikasi Mobile\\",\\"score\\":6.79}]"}',
    },
    {
      id: "51dce7aa-3423-4e96-904a-001d081f6847",
      createdAt: new Date("2024-09-09T04:19:05.095Z"), // Konversi ke Date
      metadata:
        '{"name":"MHS3","address":"0xe0B73A0b85009CAc88E2EB67551C4Ee59Ca18f41","jenisMagang":"DIKTI","status":2,"mataKuliah":"Machine Learning","codeKuliah":"CIE407","id":"51dce7aa-3423-4e96-904a-001d081f6847","konsultasiPA":"2024-09-09T00:00:00.000Z","rancangKRS":true,"learningAgreement":true,"validasiDekan":true,"validasiKaprodi":true,"laporanMagang":"{\\"hardSkills\\":[{\\"name\\":\\"Teknis Program\\",\\"value\\":70}],\\"softSkills\\":[{\\"name\\":\\"Keaktifan\\",\\"value\\":80}]}","fileLaporan":"[\\"Screenshot 2024-09-09 at 09.20.39-1725855734135.png\\"]","tanggalSidang":"Mon Sep 09 2024 07:00:00 GMT+0700 (Western Indonesia Time)","nilai":"[{\\"category\\":3,\\"code\\":\\"CIE723\\",\\"matakuliah\\":\\"Kapita Selekta Informatika\\",\\"score\\":4.02},{\\"category\\":2,\\"code\\":\\"CIE722\\",\\"matakuliah\\":\\"Jaringan Komputer lanjut\\",\\"score\\":5.45},{\\"category\\":1,\\"code\\":\\"CIE510\\",\\"matakuliah\\":\\"Kecerdasan Artifisial\\",\\"score\\":6.17},{\\"category\\":1,\\"code\\":\\"CIE408\\",\\"matakuliah\\":\\"Arsitektur Berbasis Layanan\\",\\"score\\":6.63}]"}',
    },
  ];

  for (const product of products) {
    await prisma.product.create({
      data: product,
    });
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
