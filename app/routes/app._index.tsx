import type { ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, useMatches, useRevalidator } from "@remix-run/react";
import { db } from "~/lib/db.server";
import { Header } from "~/components/pages/header.index";
import Swal from "sweetalert2";
import { parseIfString } from "~/lib/utils";
import React from "react";

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  let request_magang = formData.get("request_magang");

  if (request_magang && request.method === "POST") {
    const listPengajuan = await db.product.findMany();

    const _data = JSON.parse(request_magang);
    const _md = JSON.parse(_data.metadata);

    const isTrue = listPengajuan?.filter((d) => {
      const md = JSON.parse(d.metadata);
      return md.name === _md?.name && md?.codeKuliah === _md.codeKuliah;
    });

    if (isTrue?.length > 0)
      return json({
        ok: false,
        message: `Gagal Mengajukan Permintaan Magang`,
      });

    await db.product.create({
      data: _data,
    });

    return json({ ok: true, message: `Sukses Mengajukan Permintaan Magang` });
  }
};

export default function Index() {
  const { listPengajuan, user } = useMatches()[1].data;
  const dataMahasiswa = listPengajuan.filter((d) => {
    const md = parseIfString(d.metadata);
    return md.address === user?.profile?.id;
  });

  const profile = {
    role: user?.profile?.role,
    name: user?.profile?.name,
    address: user?.profile?.id,
  };

  const { revalidate } = useRevalidator();

  React.useEffect(() => {
    let id = setInterval(revalidate, 1000);
    return () => clearInterval(id);
  }, [revalidate]);

  return (
    <div className="font-sans p-4">
      <Header profile={profile} />
      {profile?.role === "Mahasiswa" ? (
        <DashboardMahasiswa listPengajuan={dataMahasiswa} />
      ) : (
        <DashboardAdmin listPengajuan={listPengajuan} />
      )}
    </div>
  );
}

const DashboardAdmin = ({ listPengajuan }) => {
  return (
    <div className="max-w-screen-xl lg:mx-auto mx-5 mt-5">
      <h2 className="mb-2.5 text-xl font-semibold">Laporan Admin</h2>
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full divide-y-2 divide-gray-200 bg-white text-sm">
          <Thead />
          <tbody className="divide-y divide-gray-200">
            {listPengajuan && listPengajuan?.length > 0 ? (
              listPengajuan?.map((d, index) => {
                const md = parseIfString(d?.metadata);
                return (
                  <tr key={index} className="text-center">
                    <td className="whitespace-nowrap px-4 py-2 font-medium text-gray-900">
                      {index + 1}
                    </td>
                    <td className="whitespace-nowrap px-4 py-2 text-gray-700">
                      {md?.name}
                    </td>
                    <td className="whitespace-nowrap px-4 py-2 text-gray-700">
                      {md?.mataKuliah}
                    </td>
                    <td className="whitespace-nowrap px-4 py-2 text-gray-700">
                      {md?.jenisMagang}
                    </td>
                    <td className="whitespace-nowrap px-4 py-2 text-gray-700">
                      <StatusRequest md={md} />
                    </td>
                    <td className="whitespace-nowrap px-4 py-2 text-blue-700">
                      {md?.tanggalSidang ? (
                        "-"
                      ) : (
                        <Link
                          to={`/app/${d.id}`}
                          className="flex items-center justify-center"
                        >
                          <IconEdit />
                        </Link>
                      )}
                    </td>
                  </tr>
                );
              })
            ) : (
              <EmptyData />
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const DashboardMahasiswa = ({ listPengajuan }) => {
  return (
    <div className="max-w-screen-xl mx-auto mx-5">
      <h2 className="mb-2.5 text-xl font-semibold">Laporan MHS</h2>
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full divide-y-2 divide-gray-200 bg-white text-sm">
          <Thead />
          <tbody className="divide-y divide-gray-200">
            {listPengajuan && listPengajuan?.length > 0 ? (
              listPengajuan?.map((d, index) => {
                let md = parseIfString(d.metadata);
                return (
                  <tr key={index} className="text-center">
                    <td className="whitespace-nowrap px-4 py-2 font-medium text-gray-900">
                      {index + 1}
                    </td>
                    <td className="whitespace-nowrap px-4 py-2 font-medium text-gray-900">
                      {md?.name}
                    </td>
                    <td className="whitespace-nowrap px-4 py-2 text-gray-700">
                      {md?.mataKuliah}
                    </td>
                    <td className="whitespace-nowrap px-4 py-2 text-gray-700">
                      {md?.jenisMagang}
                    </td>
                    <td className="whitespace-nowrap px-4 py-2 text-gray-700">
                      <StatusRequest md={md} />
                    </td>
                    <td className="whitespace-nowrap px-4 py-2 text-blue-700">
                      {md?.laporanMagang && !md.tanggalSidang ? (
                        "-"
                      ) : md.status === 2 ? (
                        <Link
                          to={`/app/${d.id}`}
                          className="flex items-center justify-center"
                        >
                          <IconEdit />
                        </Link>
                      ) : (
                        <button
                          onClick={() => {
                            Swal.fire({
                              icon: "warning",
                              title: "Oops...",
                              text: "Masih dalam Propses pengajuan",
                              showConfirmButton: true,
                            });
                          }}
                          className="inline-block rounded-[10px] bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                          type="button"
                        >
                          View
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            ) : (
              <EmptyData />
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const Thead = () => {
  return (
    <thead className="ltr:text-left rtl:text-right">
      <tr>
        <th className="whitespace-nowrap px-4 py-2 font-medium text-gray-900">
          No
        </th>
        <th className="whitespace-nowrap px-4 py-2 font-medium text-gray-900">
          Nama
        </th>
        <th className="whitespace-nowrap px-4 py-2 font-medium text-gray-900">
          Mata Kuliah
        </th>
        <th className="whitespace-nowrap px-4 py-2 font-medium text-gray-900">
          Jenis Magang
        </th>
        <th className="whitespace-nowrap px-4 py-2 font-medium text-gray-900">
          Status
        </th>
        <th className="whitespace-nowrap px-4 py-2 font-medium text-gray-900">
          Action
        </th>
      </tr>
    </thead>
  );
};

const StatusRequest = ({ md }) => {
  return (
    <>
      {md?.tanggalSidang ? (
        <Badge content="Selesai" bg="bg-green-100" text="text-green-700" />
      ) : md?.laporanMagang ? (
        <Badge content="Menunggu Sidang" bg="bg-sky-100" />
      ) : md?.rancangKRS && !md.validasiDekan ? (
        <Badge
          content="Menunggu Validasi Dekan & Kaprodi"
          bg="bg-slate-100"
          text="text-slate-700"
        />
      ) : md?.validasiDekan ? (
        <Badge
          content="Proses Magang"
          bg="bg-indigo-100"
          text="text-indigo-700"
        />
      ) : md?.status === 1 ? (
        <Badge
          content="Menunggu Disetujui"
          bg="bg-amber-100"
          text="text-amber-700"
        />
      ) : md?.status === 2 ? (
        <Badge
          content="Disetujui"
          bg="bg-emerald-100"
          text="text-emerald-7-00"
        />
      ) : (
        <Badge content="Tidak Lolos" bg="bg-red-100" text="text-red-700" />
      )}
    </>
  );
};

const Badge = ({ bg, text, content }) => {
  return (
    <span
      className={`inline-flex items-center justify-center rounded-full  px-2.5 py-0.5 ${bg} ${text}`}
    >
      {content}
    </span>
  );
};

const EmptyData = () => {
  return (
    <tr className="text-center">
      <td
        colSpan="6"
        className="whitespace-nowrap px-4 py-2 font-medium text-gray-900"
      >
        No data
      </td>
    </tr>
  );
};

const IconEdit = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24px"
      height="24px"
      viewBox="0 0 24 24"
    >
      <g
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      >
        <path strokeDasharray="20" strokeDashoffset="20" d="M3 21H21">
          <animate
            fill="freeze"
            attributeName="stroke-dashoffset"
            dur="0.3s"
            values="20;0"
          ></animate>
        </path>
        <path
          strokeDasharray="44"
          strokeDashoffset="44"
          d="M7 17V13L17 3L21 7L11 17H7"
        >
          <animate
            fill="freeze"
            attributeName="stroke-dashoffset"
            begin="0.4s"
            dur="0.6s"
            values="44;0"
          ></animate>
        </path>
        <path strokeDasharray="8" strokeDashoffset="8" d="M14 6L18 10">
          <animate
            fill="freeze"
            attributeName="stroke-dashoffset"
            begin="1s"
            dur="0.2s"
            values="8;0"
          ></animate>
        </path>
      </g>
    </svg>
  );
};
