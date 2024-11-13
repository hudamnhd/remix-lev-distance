import type { LoaderArgs } from "@remix-run/node";
import { parseIfString } from "~/lib/utils";
import { konversiNilai } from "~/lib/fuzzy";
import { useLoaderData } from "@remix-run/react";
import { json } from "@remix-run/node";
import {
  getSmartContract,
  getContractWithAddress,
  getProductById,
} from "~/lib/contract.server";

export const loader = async ({ params }: LoaderArgs) => {
  const sc = await getSmartContract();
  const { abi, deployed_address, network } = sc;

  const contract = await getContractWithAddress(
    JSON.parse(abi),
    deployed_address,
    network,
  );

  const _product = await getProductById(contract, params.id);

  if (!_product || _product?.id === "") {
    throw new Response("Not Found", { status: 404 });
  }

  const p = parseIfString(_product.metadata);
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
export default function DetailData() {
  const { product } = useLoaderData<typeof loader>();

  return (
    <div>
      <div className="m-5 flow-root rounded-lg border border-gray-300 py-3 shadow-sm">
        <dl className="-my-3 divide-y divide-gray-200 text-sm">
          <div className="grid grid-cols-1 gap-1 p-3 sm:grid-cols-3 sm:gap-4">
            <dt className="font-medium text-gray-900">ID</dt>
            <dd className="text-gray-700 sm:col-span-2">
              {product.metadata.id}
            </dd>
          </div>
          <div className="grid grid-cols-1 gap-1 p-3 sm:grid-cols-3 sm:gap-4">
            <dt className="font-medium text-gray-900">Nama</dt>
            <dd className="text-gray-700 sm:col-span-2">
              {product.metadata.name}
            </dd>
          </div>
          <div className="grid grid-cols-1 gap-1 p-3 sm:grid-cols-3 sm:gap-4">
            <dt className="font-medium text-gray-900">Mata Kuliah</dt>
            <dd className="text-gray-700 sm:col-span-2">
              {product.metadata.mataKuliah}
            </dd>
          </div>
          <div className="grid grid-cols-1 gap-1 p-3 sm:grid-cols-3 sm:gap-4">
            <dt className="font-medium text-gray-900">Jenis Magang</dt>
            <dd className="text-gray-700 sm:col-span-2">
              {product.metadata.jenisMagang}
            </dd>
          </div>
          <div className="grid grid-cols-1 gap-1 p-3 sm:grid-cols-3 sm:gap-4">
            <dt className="font-medium text-gray-900">File</dt>
            <dd className="text-gray-700 sm:col-span-2 grid gap-2 max-w-md">
              {product?.metadata?.fileLaporan &&
              product?.metadata?.fileLaporan?.length > 0
                ? product?.metadata?.fileLaporan?.map((d, index) => (
                    <div key={index}>
                      <a
                        className="line-clamp-1 break-all"
                        href={`/uploads/${d}`}
                        target="blank"
                      >
                        {d}
                      </a>
                    </div>
                  ))
                : null}
            </dd>
          </div>
          <div className="grid grid-cols-1 gap-1 p-3 sm:grid-cols-3 sm:gap-4">
            <dt className="font-medium text-gray-900">Skill</dt>
            <dd className="text-gray-700 sm:col-span-2">
              <div className="mb-5">
                {product?.metadata?.laporanMagang?.hardSkills?.length > 0 && (
                  <>
                    <h2 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
                      Hard Skills:
                    </h2>
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
                  </>
                )}
              </div>
              <div>
                {product?.metadata?.laporanMagang?.softSkills?.length > 0 && (
                  <>
                    <h2 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
                      Soft Skills:
                    </h2>
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
                  </>
                )}
              </div>
            </dd>
          </div>
          <div className="grid grid-cols-1 gap-1 p-3 sm:grid-cols-3 sm:gap-4">
            <dt className="font-medium text-gray-900">Nilai</dt>
            <div className="overflow-x-auto rounded-lg border border-gray-300 w-full">
              <table className="min-w-full divide-y-2 divide-gray-200 bg-white text-sm">
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
                      <tr
                        key={index}
                        className={`cursor-pointer ${
                          person.category === 1
                            ? "bg-yellow-50"
                            : person.category === 2
                              ? "bg-blue-50"
                              : person.category === 3
                                ? "bg-green-50"
                                : person.category === 4
                                  ? "bg-red-50"
                                  : ""
                        }`}
                      >
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
            <dd className="text-gray-700 sm:col-span-2"></dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
