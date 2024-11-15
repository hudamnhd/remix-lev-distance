import type { LoaderArgs } from "@remix-run/node";
import { parseIfString } from "~/lib/utils";
import { konversiNilai } from "~/lib/fuzzy";
import { useLoaderData } from "@remix-run/react";
import { json } from "@remix-run/node";
import {
  getSmartContract,
  getContractWithAddress,
  getProductById,
  getProducts,
} from "~/lib/contract.server";
import { Buffer } from "buffer";

const decodeBase64WithPadding = (encoded: string) => {
  const padded = encoded.padEnd(
    encoded.length + ((4 - (encoded.length % 4)) % 4),
    "=",
  );
  return Buffer.from(padded, "base64").toString("utf-8");
};

export const loader = async ({ params }: LoaderArgs) => {
  const sc = await getSmartContract();
  const { abi, deployed_address, network } = sc;

  const contract = await getContractWithAddress(
    JSON.parse(abi),
    deployed_address,
    network,
  );

  const products = await getProducts(contract);
  const _product = await getProductById(contract, params.id);

  if (!_product || _product?.id === "") {
    throw new Response("Not Found", { status: 404 });
  }
  const parseData = decodeBase64WithPadding(_product.metadata);

  const p = parseIfString(parseData);
  const l = parseIfString(p.laporanMagang);
  const n = parseIfString(p.nilai);
  const f = parseIfString(p?.fileLaporan);

  const product = {
    metadata: {
      ...p,
      fileLaporan: f,
      laporanMagang: l,
      nilai: n,
    },
  };

  return json({ product });
};

function parseDate(dateString) {
  const date = new Date(dateString);

  // Opsi untuk memformat tanggal
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
export default function DetailData() {
  const { product } = useLoaderData<typeof loader>();
  return (
    <div className="max-w-4xl my-10 mx-auto px-4 sm:px-6 lg:px-8 ">
      <div className="bg-gradient-to-r from-slate-50 to-white border shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Informasi
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Rincian data {product.metadata.id}
          </p>
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
          <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Nama</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {product.metadata.name}
              </dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">
                Tanggal Sidang
              </dt>
              <dd className="mt-1 text-sm text-gray-900">
                {parseDate(product.metadata.tanggalSidang)}
              </dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Mata Kuliah</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {product.metadata.mataKuliah}
              </dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">
                Jenis Magang
              </dt>
              <dd className="mt-1 text-sm text-gray-900">
                {product.metadata.jenisMagang}
              </dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Hard Skills</dt>
              <dd className="mt-1 text-sm text-gray-900">
                <ol className="max-w-md space-y-1 text-gray-500 list-decimal list-inside dark:text-gray-400">
                  {product?.metadata?.laporanMagang?.hardSkills?.map(
                    (skill, index) => (
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
                    ),
                  )}
                </ol>
              </dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Soft Skills</dt>
              <dd className="mt-1 text-sm text-gray-900">
                <ol className="max-w-md space-y-1 text-gray-500 list-decimal list-inside dark:text-gray-400">
                  {product?.metadata?.laporanMagang?.softSkills?.map(
                    (skill, index) => (
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
                    ),
                  )}
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
                      {product?.metadata?.nilai &&
                        product?.metadata?.nilai?.map((person, index) => (
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
                  {product?.metadata?.fileLaporan &&
                  product?.metadata?.fileLaporan?.length > 0
                    ? product?.metadata?.fileLaporan?.map((d, index) => (
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
      </div>
    </div>
  );
}
