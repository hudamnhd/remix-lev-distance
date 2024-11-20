import type { LoaderArgs } from "@remix-run/node";
import { parseIfString } from "~/lib/utils";
import { decompressData } from "~/lib/misc";
import { konversiNilai } from "~/lib/fuzzy";
import { useLoaderData } from "@remix-run/react";
import { initialData } from "~/constants/mataKuliah";
import { json } from "@remix-run/node";
import { db } from "~/lib/db.server";
import {
  getSmartContract,
  getContractWithAddress,
  getProductById,
  // getProducts,
} from "~/lib/contract.server";

function safeBigIntToNumber(bigIntValue) {
  // Memeriksa apakah BigInt berada dalam rentang Number yang valid
  if (
    bigIntValue <= Number.MAX_SAFE_INTEGER &&
    bigIntValue >= Number.MIN_SAFE_INTEGER
  ) {
    return Number(bigIntValue);
  } else {
    // Jika nilai terlalu besar, kembalikan sebagai BigInt atau lakukan penanganan lain
    console.warn("Value too large to convert to Number, returning BigInt");
    return JSON.stringify(bigIntValue);
  }
}

export const loader = async ({ params }: LoaderArgs) => {
  const { id } = params;
  const sc = await getSmartContract();
  const { abi, deployed_address, network } = sc;

  const contract = await getContractWithAddress(
    JSON.parse(abi),
    deployed_address,
    network,
  );

  // const datas = await getProducts(contract);
  const _data = await getProductById(contract, id);

  if (!_data || _data?.id === "") {
    throw new Response("Not Found", { status: 404 });
  }

  const parserData = parseIfString(_data.metadata);
  const parseData = decompressData(parserData);

  const addt = {
    created_at: new Date(
      safeBigIntToNumber(_data?.created_at) * 1000,
    ).toISOString(),
    transactionHash: _data?.transactionHash,
  };
  const p = parseIfString(parseData);

  const dataFromDatabase = await db.product.findUnique({
    where: {
      id, // Ganti dengan ID yang ingin Anda cari
    },
  });

  if (!dataFromDatabase || dataFromDatabase?.id === "") {
    throw new Response("Not Found", { status: 404 });
  }
  const parserDataDb = parseIfString(dataFromDatabase.metadata);

  const data = {
    metadata: {
      ...p,
    },
  };

  return json({ data, addt, local: parserDataDb });
};

function parseDate(dateString) {
  const date = new Date(dateString);

  const options = {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "long",
    year: "numeric",
  };

  // Format menjadi HH:MM, DD Month Year
  return date.toLocaleString("id-ID", options).replace(",", "");
}
import { Debug } from "~/components/debug";
export default function DetailData() {
  const { data, addt, local } = useLoaderData<typeof loader>();
  const transaction = local?.transaction;

  function getInitialData(initialData, nilai) {
    return nilai.reduce((result, itemNilai) => {
      const codeNilai = itemNilai.code;

      const matchingData = initialData.find((item) => item.code === codeNilai);

      if (matchingData) {
        result.push({
          ...matchingData,
          score: itemNilai.score,
        });
      }

      return result;
    }, []);
  }
  const listMataKuliah = getInitialData(initialData, data?.metadata?.nilai);
  return (
    <div className="max-w-screen-2xl my-10 mx-auto px-4 sm:px-6 lg:px-8 grid sm:grid-cols-2 gap-5">
      <div className="bg-gradient-to-r from-slate-50 to-white border shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 bg-gradient-to-r from-blue-600 to-sky-700">
          <h3 className="text-lg leading-6 font-bold text-white">Informasi</h3>
          <p className="mt-1 max-w-2xl text-sm text-white font-semibold">
            Rincian data {data.metadata.id}
          </p>
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
          <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Nama</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {data.metadata.name}
              </dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">
                Tanggal Sidang
              </dt>
              <dd className="mt-1 text-sm text-gray-900">
                {parseDate(data.metadata.tanggalSidang)}
              </dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Mata Kuliah</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {data.metadata.mataKuliah}
              </dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">
                Jenis Magang
              </dt>
              <dd className="mt-1 text-sm text-gray-900">
                {data.metadata.jenisMagang}
              </dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Hard Skills</dt>
              <dd className="mt-1 text-sm text-gray-900">
                <ol className="max-w-md space-y-1 text-gray-500 list-decimal list-inside dark:text-gray-400">
                  {data?.metadata?.hardSkills?.map((skill, index) => (
                    <li key={index}>
                      <span className="font-semibold text-gray-900 dark:text-white capitalize">
                        {skill.name}
                      </span>{" "}
                      with{" "}
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {skill.value}
                      </span>{" "}
                      points
                    </li>
                  ))}
                </ol>
              </dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Soft Skills</dt>
              <dd className="mt-1 text-sm text-gray-900">
                <ol className="max-w-md space-y-1 text-gray-500 list-decimal list-inside dark:text-gray-400">
                  {data?.metadata?.softSkills?.map((skill, index) => (
                    <li key={index}>
                      <span className="font-semibold text-gray-900 dark:text-white capitalize">
                        {skill.name}
                      </span>{" "}
                      with{" "}
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {skill.value}
                      </span>{" "}
                      points
                    </li>
                  ))}
                </ol>
              </dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-sm font-medium text-gray-500">Nilai</dt>
              <dd className="mt-1 text-sm text-gray-900">
                <div className="overflow-x-auto rounded-md border w-full">
                  <table className="min-w-full divide-y-2 divide-gray-200 bg-gradient-to-r from-slate-50 to-white text-sm">
                    <thead className="ltr:text-left rtl:text-right">
                      <tr>
                        <th className="px-4 py-2 font-medium text-gray-900 text-left">
                          Mata Kuliah
                        </th>
                        <th className="px-4 py-2 font-medium text-gray-900 text-left">
                          Nilai
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-200">
                      {listMataKuliah?.length > 0 &&
                        listMataKuliah?.map((person, index) => (
                          <tr key={index} className={`cursor-pointer`}>
                            <td className="px-4 py-2 font-medium text-gray-900 text-left">
                              {person.matakuliah}
                            </td>
                            <td className="px-6 py-2 font-medium text-gray-900 text-left">
                              {person?.score === null
                                ? "-"
                                : konversiNilai(person?.score)}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-sm font-medium text-gray-500">File</dt>
              <dd className="mt-1 text-sm text-gray-900">
                <ul
                  role="list"
                  className="border border-gray-200 rounded-md divide-y divide-gray-200"
                >
                  {data?.metadata?.fileLaporan &&
                  data?.metadata?.fileLaporan?.length > 0
                    ? data?.metadata?.fileLaporan?.map((d, index) => (
                        <li
                          key={index}
                          className="pl-3 pr-4 py-3 flex items-center justify-between text-sm"
                        >
                          <div className="w-0 flex-1 flex items-center">
                            <svg
                              className="flex-shrink-0 h-5 w-5 text-gray-400"
                              x-description="Heroicon name: solid/paper-clip"
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                              aria-hidden="true"
                            >
                              <path
                                fillRule="evenodd"
                                d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 012 0v4a1 1 0 102 0V7a3 3 0 00-3-3z"
                                clipRule="evenodd"
                              />
                            </svg>
                            <span className="ml-2 flex-1 w-0 truncate">
                              {d?.split("/")?.pop()}
                            </span>
                          </div>
                          <div className="ml-4 flex-shrink-0">
                            <a
                              href={d}
                              className="font-medium text-indigo-600 hover:text-indigo-500"
                            >
                              Download
                            </a>
                          </div>
                        </li>
                      ))
                    : null}
                </ul>
              </dd>
            </div>
          </dl>
        </div>
        <div>
          <a
            href="#"
            className="hidden block bg-slate-100 text-sm font-medium text-gray-500 text-center px-4 py-4 hover:text-gray-700 sm:rounded-b-lg"
          >
            Read full
          </a>
        </div>
      </div>
      <div className="bg-gradient-to-r from-slate-50 to-white border shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 bg-gradient-to-r from-green-600 to-indigo-700">
          <h3 className="text-lg leading-6 font-bold text-white">
            Sertifikat Verifikasi Blockchain
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-white font-semibold">
            Data ini sudah diverifikasi oleh Blockchain dan tercatat dengan aman
            di jaringan Ethereum.
          </p>
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
          <div className="flex items-center gap-x-1 mb-2">
            <h3 class="text-xl font-bold">Transaksi Blockchain</h3>
            <svg
              stroke="currentColor"
              fill="currentColor"
              strokeWidth={0}
              viewBox="0 0 24 24"
              className="ml-1 text-blue-500"
              height={18}
              width={18}
              xmlns="http://www.w3.org/2000/svg"
            >
              <title>User Verified</title>
              <path fill="none" d="M0 0h24v24H0z" />
              <path d="M23 12l-2.44-2.79.34-3.69-3.61-.82-1.89-3.2L12 2.96 8.6 1.5 6.71 4.69 3.1 5.5l.34 3.7L1 12l2.44 2.79-.34 3.7 3.61.82L8.6 22.5l3.4-1.47 3.4 1.46 1.89-3.19 3.61-.82-.34-3.69L23 12zm-12.91 4.72l-3.8-3.81 1.48-1.48 2.32 2.33 5.85-5.87 1.48 1.48-7.33 7.35z" />
            </svg>
          </div>
          <dl className="grid grid-cols-1 gap-x-4 gap-y-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <dt className="text-sm font-medium text-gray-500">
                Sertifikat Id
              </dt>
              <dd className="mt-1 text-sm text-gray-900">{data.metadata.id}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-sm font-medium text-gray-500">
                Verifikasi Sertifikat Hash
              </dt>
              <dd className="mt-1 text-sm text-gray-900">
                {addt?.transactionHash}
              </dd>
              <ul
                role="list"
                className="border border-gray-200 rounded-md divide-y divide-gray-200 mt-2"
              >
                <li className="pl-3 pr-4 py-2 flex items-center justify-between text-sm">
                  <div className="w-0 flex-1 flex items-center">
                    <span className="flex-1 w-0 text-xs">
                      Hash ini dihasilkan berdasarkan data Sertifikat dan waktu
                      transaksi untuk memastikan integritas. Anda bisa
                      menggunakan hash ini untuk memverifikasi bahwa sertifikat
                      yang tercatat tidak diubah.
                    </span>
                  </div>
                </li>
              </ul>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-sm font-medium text-gray-500">
                Transaction Hash
              </dt>
              <dd className="mt-1 text-sm text-gray-900">
                {transaction?.transactionHash}
              </dd>
              <ul
                role="list"
                className="border border-gray-200 rounded-md divide-y divide-gray-200 mt-2"
              >
                <li className="pl-3 pr-4 py-2 flex items-center justify-between text-sm">
                  <div className="w-0 flex-1 flex items-center">
                    <span className="flex-1 w-0 text-xs">
                      Hash transaksi ini menunjukkan bahwa data produk telah
                      berhasil diproses dan terverifikasi di blockchain
                      Ethereum.
                    </span>
                  </div>
                </li>
              </ul>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-sm font-medium text-gray-500">
                Transaction Index
              </dt>
              <dd className="mt-1 text-sm text-gray-900">
                {transaction?.transactionIndex}
              </dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-sm font-medium text-gray-500">Block Hash</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {transaction?.blockHash}
              </dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-sm font-medium text-gray-500">
                Block Number
              </dt>
              <dd className="mt-1 text-sm text-gray-900">
                {transaction?.blockNumber}
              </dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-sm font-medium text-gray-500">
                From Address
              </dt>
              <dd className="mt-1 text-sm text-gray-900">
                {transaction?.from}
              </dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-sm font-medium text-gray-500">To Address</dt>
              <dd className="mt-1 text-sm text-gray-900">{transaction?.to}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-sm font-medium text-gray-500">Dibuat</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {parseDate(addt?.created_at)}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}
