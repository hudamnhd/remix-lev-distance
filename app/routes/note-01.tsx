import { Button } from "~/components/ui/button";

import { useNavigate } from "@remix-run/react";
export default function Documentation() {
  const navigate = useNavigate();
  return (
    <div className="relative py-16 bg-white overflow-hidden">
      <div className="fixed grid grid-cols-2 gap-x-2 items-center justify-center bottom-5 left-1/2 transform -translate-x-1/2  z-20 bg-muted p-1.5 backdrop-blur-[2px] rounded-lg">
        <Button
          size="sm"
          variant="outline"
          className="hover:bg-white"
          onClick={() => navigate(-1)}
        >
          Back
        </Button>
        <Button size="sm" variant="default" onClick={() => navigate("/app")}>
          Dashboard
        </Button>
      </div>

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
              Sistem Penyimpanan Blockchain
            </span>
          </h1>
          <p className="mt-8 text-xl text-gray-500 leading-8">
            Catatan tentang Penyimpanan di Blockchain
          </p>
        </div>
        <div className="mt-6 prose prose-indigo prose-lg text-gray-500 mx-auto">
          <>
            <h3 id="1-immutability-di-blockchain-">
              1. <strong>Immutability di Blockchain</strong>
            </h3>
            <p>
              Immutability berarti bahwa{" "}
              <strong>
                setelah data masuk ke dalam blockchain, tidak bisa diubah atau
                dihapus
              </strong>
              . Namun, hal ini hanya berlaku untuk{" "}
              <strong>
                data yang sudah terkonfirmasi dan tercatat dalam blok yang telah
                ditambahkan
              </strong>{" "}
              ke blockchain. Artinya,{" "}
              <strong>
                data yang sudah ada di blockchain tidak bisa diubah
              </strong>{" "}
              (misalnya transaksi yang sudah dicatat tidak bisa dibatalkan).
            </p>
            <p>
              Tetapi, ketika anda <strong>mengubah data</strong> dalam smart
              contract atau blockchain, itu sebenarnya adalah{" "}
              <strong>transaksi baru</strong> yang{" "}
              <strong>menambahkan data baru</strong> ke dalam blockchain. Jadi,
              anda <strong>tidak mengubah data yang lama</strong>, tetapi anda
              menambahkan data yang baru ke dalam blockchain dengan perubahan
              yang di inginkan.
            </p>
            <h3 id="2-mengubah-state-dalam-smart-contract-">
              2. <strong>Mengubah State dalam Smart Contract</strong>
            </h3>
            <p>
              Dalam konteks smart contract (misalnya Ethereum), saat ada
              perubahan state (misalnya, mengubah nilai <code>is_login</code>{" "}
              menjadi <code>true</code>), anda sebenarnya membuat{" "}
              <strong>transaksi baru</strong> yang menambah perubahan state
              tersebut ke dalam blockchain. Perubahan ini tercatat sebagai{" "}
              <strong>transaksi baru</strong> di blockchain, yang memerlukan
              biaya gas dan waktu konfirmasi.
            </p>
            <p>Contoh:</p>
            <ul>
              <li>
                Misalnya data smart contract yang menyimpan informasi pengguna.
                Jika <code>is_login</code> adalah <code>false</code> dan
                melakukan perubahan menjadi <code>true</code>, itu adalah proses
                transaksi untuk memperbarui status tersebut.
              </li>
              <li>
                Transaksi ini akan dimasukkan ke dalam blockchain sebagai
                transaksi baru, yang ditambahi ke blok terbaru.{" "}
                <strong>
                  Namun, transaksi sebelumnya yang menyatakan{" "}
                  <code>is_login: false</code> tetap ada di blockchain
                </strong>
                , dan tidak diubah. Jadi, meskipun statusnya berubah,{" "}
                <strong>immutable</strong> berarti tidak bisa dihapus atau
                diubah transaksi yang sudah tercatat, tetapi bisa menambahkan
                data baru yang mencerminkan perubahan tersebut.
              </li>
            </ul>
            <h3 id="3-gas-fee-">
              3. <strong>Gas Fee</strong>
            </h3>
            <p>
              Gas fee diperlukan karena perubahan data dalam blockchain
              memerlukan proses verifikasi dan konsensus. Setiap perubahan state
              dalam smart contract harus melalui proses yang disebut{" "}
              <strong>mining</strong> (atau dalam model Proof of Stake disebut{" "}
              <strong>staking</strong>), di mana node-node jaringan
              memverifikasi bahwa transaksi valid dan menambahkannya ke dalam
              blok. Proses ini membutuhkan daya komputasi dan itu yang dikenakan
              biaya gas.
            </p>
            <h3 id="4-apa-yang-membuat-blockchain-immutability-tetap-terjaga-">
              4.{" "}
              <strong>
                Apa yang Membuat Blockchain Immutability Tetap Terjaga?
              </strong>
            </h3>
            <ul>
              <li>
                <strong>Penyimpanan Terdistribusi</strong>: Blockchain
                menggunakan <strong>distributed ledger</strong>, yang artinya
                salinan data ada di banyak node di seluruh jaringan. Jika
                seseorang mencoba mengubah data di satu titik, itu akan
                bertentangan dengan salinan yang ada di node lain, sehingga
                perubahan tersebut akan terdeteksi.
              </li>
              <li>
                <strong>Proof of Work / Proof of Stake</strong>: Dalam sistem
                konsensus seperti Proof of Work (PoW) atau Proof of Stake (PoS),
                untuk mengubah data yang sudah ada, seseorang harus
                mengendalikan mayoritas dari jaringan atau melakukan serangan
                yang sangat mahal dan rumit. Itu hampir tidak mungkin dilakukan.
              </li>
            </ul>
            <h3 id="ringkasan-">Ringkasan:</h3>
            <ul>
              <li>
                Mengubah state (seperti mengubah <code>is_login</code> menjadi{" "}
                <code>true</code>){" "}
                <strong>tidak mengubah data yang sudah ada</strong> di
                blockchain. Ini hanya menambah <strong>transaksi baru</strong>{" "}
                ke dalam blockchain yang menyimpan informasi terbaru.
              </li>
              <li>
                Blockchain tetap <strong>immutable</strong> karena data yang
                sudah tercatat tidak bisa diubah atau dihapus. Hanya transaksi
                dan data baru yang bisa ditambahkan.
              </li>
              <li>
                <strong>Gas fee</strong> diperlukan karena setiap perubahan atau
                transaksi dalam smart contract memerlukan pemrosesan dan
                verifikasi oleh jaringan blockchain.
              </li>
            </ul>
            <p>
              Jadi, meskipun kita "mengubah" data dalam blockchain, sifat{" "}
              <strong>immutable</strong> tetap terjaga karena blockchain tidak
              memungkinkan penghapusan atau perubahan data yang sudah ada, hanya
              menambahkan data baru yang mencerminkan perubahan tersebut.
            </p>
            <h3 id="perhitungan-biaya-gas-dalam-rupiah">
              Perhitungan Biaya Gas dalam Rupiah
            </h3>
            <p>Untuk menghitung biaya gas dalam Rupiah, kita perlu rumus:</p>
            <p>
              [ \text{"{"}Biaya Gas{"}"} = \text{"{"}Gas Used{"}"} \times \text
              {"{"}Gas Price{"}"}]
            </p>
            <p>Dengan angka yang sudah diberikan:</p>
            <ul>
              <li>
                <strong>Gas Used</strong>: 549119
              </li>
              <li>
                <strong>Gas Price</strong>: 2500000007 (dalam Gwei)
              </li>
            </ul>
            <p>Langkah-langkah untuk menghitung biaya gas:</p>
            <ol>
              <li>
                <p>
                  <strong>Konversi Gas Price ke ETH</strong>: Gas price yang
                  diberikan dalam Gwei, dan kita perlu mengonversinya ke ETH. 1
                  ETH = 1,000,000,000 Gwei, jadi:
                </p>
                <p>
                  [ \text{"{"}Gas Price dalam ETH{"}"} = \frac{"{"}2500000007
                  {"}"}
                  {"{"}1000000000{"}"} = 2.500000007 \, \text{"{"}ETH{"}"}]
                </p>
              </li>
              <li>
                <p>
                  <strong>Hitung total biaya gas dalam ETH</strong>:
                </p>
                <p>
                  [ \text{"{"}Biaya Gas dalam ETH{"}"} = 549119 \times
                  2.500000007 \times 10^{"{"}-9{"}"} = 0.0013727975175 \, \text
                  {"{"}ETH{"}"}]
                </p>
              </li>
              <li>
                <p>
                  <strong>Konversi ETH ke Rupiah</strong>: Sekarang, kita
                  tinggal mengalikan biaya gas yang didapatkan dengan harga 1
                  ETH dalam IDR (harga pasar saat ini). Misalkan harga ETH saat
                  ini adalah <strong>Rp 30,000,000</strong> (sebagai contoh,
                  kita bisa cek harga aktualnya).
                </p>
                <p>
                  [ \text{"{"}Biaya Gas dalam Rupiah{"}"} = 0.0013727975175
                  \times 30,000,000 = 41,183.93 \, \text{"{"}IDR{"}"}]
                </p>
              </li>
            </ol>
            <p>
              Jadi, <strong>biaya gas untuk transaksi tersebut</strong> adalah
              sekitar <strong>Rp 41,184</strong> (dengan asumsi harga ETH saat
              ini adalah Rp 30,000,000).
            </p>
            <p>
              Perlu dicatat bahwa <strong>nilai ETH</strong> bisa sangat
              bervariasi, jadi pastikan untuk mengecek harga terkini.
            </p>
          </>
        </div>
      </div>
    </div>
  );
}
