import { Button } from "~/components/ui/button";

import { useNavigate } from "@remix-run/react";
export default function Documentation() {
  const navigate = useNavigate();
  return (
    <div className="relative py-16 bg-white overflow-hidden">
      <Button
        variant="outline"
        className="fixed flex items-center justify-center bottom-5 left-1/2 transform -translate-x-1/2  z-20 backdrop-blur-[2px] rounded-xl"
        onClick={() => navigate(-1)}
      >
        Back
      </Button>
      <div className="hidden lg:block lg:absolute lg:inset-y-0 lg:h-full lg:w-full">
        <div
          className="relative h-full text-lg max-w-prose mx-auto"
          aria-hidden="true"
        >
          <svg
            className="absolute top-12 left-full transform translate-x-32"
            width={404}
            height={384}
            fill="none"
            viewBox="0 0 404 384"
          >
            <defs>
              <pattern
                id="74b3fd99-0a6f-4271-bef2-e80eeafdf357"
                x={0}
                y={0}
                width={20}
                height={20}
                patternUnits="userSpaceOnUse"
              >
                <rect
                  x={0}
                  y={0}
                  width={4}
                  height={4}
                  className="text-gray-200"
                  fill="currentColor"
                />
              </pattern>
            </defs>
            <rect
              width={404}
              height={384}
              fill="url(#74b3fd99-0a6f-4271-bef2-e80eeafdf357)"
            />
          </svg>
          <svg
            className="absolute top-1/2 right-full transform -translate-y-1/2 -translate-x-32"
            width={404}
            height={384}
            fill="none"
            viewBox="0 0 404 384"
          >
            <defs>
              <pattern
                id="f210dbf6-a58d-4871-961e-36d5016a0f49"
                x={0}
                y={0}
                width={20}
                height={20}
                patternUnits="userSpaceOnUse"
              >
                <rect
                  x={0}
                  y={0}
                  width={4}
                  height={4}
                  className="text-gray-200"
                  fill="currentColor"
                />
              </pattern>
            </defs>
            <rect
              width={404}
              height={384}
              fill="url(#f210dbf6-a58d-4871-961e-36d5016a0f49)"
            />
          </svg>
          <svg
            className="absolute bottom-12 left-full transform translate-x-32"
            width={404}
            height={384}
            fill="none"
            viewBox="0 0 404 384"
          >
            <defs>
              <pattern
                id="d3eb07ae-5182-43e6-857d-35c643af9034"
                x={0}
                y={0}
                width={20}
                height={20}
                patternUnits="userSpaceOnUse"
              >
                <rect
                  x={0}
                  y={0}
                  width={4}
                  height={4}
                  className="text-gray-200"
                  fill="currentColor"
                />
              </pattern>
            </defs>
            <rect
              width={404}
              height={384}
              fill="url(#d3eb07ae-5182-43e6-857d-35c643af9034)"
            />
          </svg>
        </div>
      </div>
      <div className="relative px-4 sm:px-6 lg:px-8">
        <div className="text-lg max-w-prose mx-auto">
          <h1>
            <span className="mt-2 block text-3xl text-center leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Sistem Manajemen Magang Berbasis SmartContract
            </span>
          </h1>
          <p className="mt-8 text-xl text-gray-500 leading-8">
            Dokumentasi ini menjelaskan alur kerja dan arsitektur sistem
            manajemen magang yang menggunakan blockchain untuk menyimpan hasil
            akhir dan database tradisional untuk data sementara.
          </p>
        </div>
        <div className="mt-6 prose prose-indigo prose-lg text-gray-500 mx-auto">
          <h2 id="gambaran-umum">Gambaran Umum</h2>
          <p>
            Sistem ini dirancang untuk mengelola pengajuan dan penilaian magang
            dengan pendekatan fuzzy dari daftar mata kuliah yang ditentukan
            dengan kombinasi blockchain untuk penyimpanan hasil akhir yang aman
            dan database tradisional untuk data sementara. Fitur utama meliputi:
          </p>
          <ol>
            <li>
              <strong>Koneksi Wallet</strong>: Pengguna harus menghubungkan
              wallet MetaMask untuk berinteraksi dengan sistem.
            </li>
            <li>
              <strong>Peran Pengguna</strong>: Pengguna mendaftar sebagai{" "}
              <strong>Admin</strong> atau <strong>Mahasiswa</strong>.
            </li>
            <li>
              <strong>Proses Magang</strong>: Mahasiswa mengajukan pengajuan
              magang, yang ditinjau dan diproses oleh admin.
            </li>
            <li>
              <strong>Penyimpanan Hasil Akhir</strong>: Penilaian akhir dihitung
              oleh admin, disimpan di MySQL, dan blockchain.
            </li>
            <li>
              <strong>Sertifikat Digital</strong>: Mahasiswa dapat mengakses
              sertifikat berbasis blockchain dengan kode QR yang mengarah ke
              data yang disimpan di blockchain.
            </li>
          </ol>

          <h2 id="alur-kerja">Alur Kerja</h2>
          <h3 id="1-koneksi-wallet-">
            1. <strong>Koneksi Wallet</strong>
          </h3>
          <ul>
            <li>
              Ketika pengguna membuka aplikasi, mereka akan diminta untuk
              menghubungkan wallet MetaMask.
            </li>
            <li>
              Setelah terhubung, alamat wallet diverifikasi dan digunakan
              sebagai pengenal unik untuk tindakan pengguna.
            </li>
          </ul>
          <h3 id="2-registrasi-pengguna-">
            2. <strong>Registrasi Pengguna</strong>
          </h3>
          <ul>
            <li>
              <strong>Langkah 1</strong>: Pengguna mendaftarkan detail mereka.
            </li>
            <li>
              <strong>Langkah 2</strong>: Saat mendaftar, mereka memilih peran:
              <ul>
                <li>
                  <strong>Admin</strong>: Untuk mengelola pengajuan magang dan
                  penilaian.
                </li>
                <li>
                  <strong>Mahasiswa</strong>: Untuk mengajukan dan melihat data
                  terkait magang.
                </li>
              </ul>
            </li>
            <li>
              <strong>Popup MetaMask</strong>: Registrasi diselesaikan dengan
              transaksi MetaMask untuk mengonfirmasi alamat wallet mereka.
            </li>
          </ul>
          <h3 id="3-proses-login-">
            3. <strong>Proses Login</strong>
          </h3>
          <ul>
            <li>
              Setelah wallet terhubung, sistem memverifikasi peran pengguna dari
              data blockchain.
            </li>
            <li>
              Arahkan berdasarkan peran:
              <ul>
                <li>
                  <strong>Dashboard Admin</strong>
                </li>
                <li>
                  <strong>Dashboard Mahasiswa</strong>
                </li>
              </ul>
            </li>
          </ul>
          <h3 id="4-fitur-peran-mahasiswa-">
            4. <strong>Fitur Peran Mahasiswa</strong>
          </h3>
          <h4 id="a-ajukan-pengajuan-magang-">
            a. <strong>Ajukan Pengajuan Magang</strong>
          </h4>
          <ul>
            <li>
              Mahasiswa mengisi formulir untuk mengajukan pengajuan magang.
            </li>
            <li>
              Data disimpan di <strong>database PlanetScale MySQL</strong>{" "}
              menggunakan <strong>Prisma ORM</strong>.
            </li>
          </ul>
          <h4 id="b-alur-magang-">
            b. <strong>Alur Magang</strong>
          </h4>
          <p>Alur kerja pengajuan magang mencakup langkah-langkah berikut:</p>
          <ol>
            <li>
              <strong>Ajukan Pengajuan</strong>: Data formulir disimpan di
              database.
            </li>
            <li>
              <strong>Tinjauan Admin</strong>: Admin meninjau pengajuan dan
              memperbarui status.
            </li>
            <li>
              <strong>Umpan Balik/Resubmisi</strong>: Jika diperlukan, mahasiswa
              mengajukan ulang pengajuan yang diperbarui.
            </li>
            <li>
              <strong>Persetujuan Akhir</strong>: Setelah disetujui, admin
              menyelesaikan pengajuan.
            </li>
          </ol>
          <h4 id="c-lihat-hasil-akhir-">
            c. <strong>Lihat Hasil Akhir</strong>
          </h4>
          <ul>
            <li>
              Setelah magang selesai dan dinilai, mahasiswa dapat melihat:
              <ul>
                <li>
                  <strong>Nilai Penilaian</strong>: Data diambil dari MySQL.
                </li>
                <li>
                  <strong>Sertifikat Digital</strong>: Data berbasis blockchain
                  yang dapat diakses melalui kode QR.
                </li>
              </ul>
            </li>
          </ul>
          <h3 id="5-fitur-peran-admin-">
            5. <strong>Fitur Peran Admin</strong>
          </h3>
          <h4 id="a-kelola-pengajuan-magang-">
            a. <strong>Kelola Pengajuan Magang</strong>
          </h4>
          <p>Admin dapat:</p>
          <ul>
            <li>Meninjau dan memperbarui status pengajuan.</li>
            <li>Meminta revisi dari mahasiswa jika diperlukan.</li>
          </ul>
          <h4 id="b-hitung-penilaian-akhir-">
            b. <strong>Hitung Penilaian Akhir</strong>
          </h4>
          <ul>
            <li>
              Admin menghitung nilai akhir berdasarkan semua input yang diajukan
              mahasiswa selama magang.
            </li>
            <li>
              <strong>Penyimpanan</strong>:
              <ul>
                <li>
                  Detail penilaian disimpan di <strong>MySQL</strong>.
                </li>
                <li>
                  Hasil akhir dan data sertifikat digital disimpan di{" "}
                  <strong>blockchain</strong>.
                </li>
              </ul>
            </li>
          </ul>
          <h2 id="integrasi-blockchain">Integrasi Blockchain</h2>
          <ol>
            <li>
              <p>
                <strong>Penyimpanan Hasil Akhir</strong>:
              </p>
              <ul>
                <li>
                  Nilai penilaian akhir disimpan di blockchain menggunakan smart
                  contract.
                </li>
                <li>
                  Hash transaksi digunakan sebagai bukti data yang disimpan.
                </li>
              </ul>
            </li>
            <li>
              <p>
                <strong>Sertifikat Digital</strong>:
              </p>
              <ul>
                <li>
                  Mahasiswa dapat melihat sertifikat mereka melalui dashboard.
                </li>
                <li>
                  Sertifikat mencakup kode QR yang mengarah ke catatan
                  blockchain berdasarkan ID unik yang disimpan di MySQL.
                </li>
              </ul>
            </li>
          </ol>
          <h2 id="teknologi-yang-digunakan">Teknologi yang Digunakan</h2>
          <ul>
            <li>
              <strong>Frontend</strong>: React + Tailwind CSS
            </li>
            <li>
              <strong>Backend</strong>: Remix JS dengan Prisma ORM
            </li>
            <li>
              <strong>Database</strong>: PlanetScale (MySQL)
            </li>
            <li>
              <strong>Blockchain</strong>: Jaringan Ethereum Sepolia dengan
              Smart Contract
            </li>
            <li>
              <strong>Integrasi Wallet</strong>: MetaMask
            </li>
            <li>
              <strong>Alat Tambahan</strong>:
              <ul>
                <li>Generator Kode QR untuk sertifikat digital.</li>
              </ul>
            </li>
          </ul>
          <h2 id="alur-database-dan-blockchain">
            Alur Database dan Blockchain
          </h2>
          <ol>
            <li>
              <strong>Data Sementara</strong>: Disimpan di{" "}
              <strong>PlanetScale</strong> menggunakan{" "}
              <strong>Prisma ORM</strong> selama tahap pengajuan dan peninjauan.
            </li>
            <li>
              <strong>Data Akhir</strong>: Disimpan di{" "}
              <strong>blockchain</strong> untuk pencatatan yang tidak dapat
              diubah dan transparan.
            </li>
          </ol>
          <h2 id="pengembangan-di-masa-depan">Pengembangan di Masa Depan</h2>
          <ol>
            <li>
              <strong>Notifikasi Berdasarkan Peran</strong>:
              <ul>
                <li>Memberitahu mahasiswa tentang pembaruan status.</li>
                <li>Memberitahu admin tentang pengajuan yang tertunda.</li>
              </ul>
            </li>
            <li>
              <strong>Peningkatan Integrasi Blockchain</strong>:
              <ul>
                <li>
                  Menggunakan sidechain untuk transaksi yang lebih cepat dan
                  murah.
                </li>
              </ul>
            </li>
            <li>
              <strong>Pelaporan dan Analitik</strong>:
              <ul>
                <li>
                  Laporan detail untuk admin tentang pengajuan magang dan
                  hasilnya.
                </li>
              </ul>
            </li>
          </ol>
          <h2 id="contoh-sertifikat-qr">Contoh Sertifikat QR</h2>
          <p>
            Kode QR pada sertifikat digital akan mengarahkan ke halaman web yang
            menampilkan data yang disimpan di blockchain untuk verifikasi.
          </p>
          <p>
            Tautan yang dienkode dalam kode QR mengambil data dari blockchain
            berdasarkan hash transaksi.
          </p>
        </div>
      </div>
    </div>
  );
}
