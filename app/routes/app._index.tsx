import { columns } from "~/routes/tasks/components/columns";
import { parseIfString } from "~/lib/utils";
import { DataTable } from "~/routes/tasks/components/data-table";
import { UserNav } from "~/routes/tasks/components/user-nav";
import { Debug } from "~/components/debug";
import data from "~/constants/db.json";
import React from "react";
import { useMatches } from "@remix-run/react";

const getStatus = (md) => {
  if (!md) return "Tidak Lolos";

  if (md.tanggalSidang) return "Selesai";
  if (md.laporanMagang) return "Menunggu Sidang";
  if (md.rancangKRS && !md.validasiDekan)
    return "Menunggu Validasi Dekan & Kaprodi";
  if (md.validasiDekan) return "Proses Magang";

  switch (md.status) {
    case 1:
      return "Menunggu Disetujui";
    case 2:
      return "Disetujui";
    default:
      return "Tidak Lolos";
  }
};

export default function DashboardPage() {
  const { listPengajuan, user } = useMatches()[1].data;

  const profile = {
    role: user?.profile?.role,
    name: user?.profile?.name,
    address: user?.profile?.id,
  };
  const isAdmin = user?.profile?.role === "Admin";

  const memoizedData = React.useMemo(
    () => listPengajuan,
    [JSON.stringify(listPengajuan)],
  );

  const resources = isAdmin
    ? memoizedData
    : memoizedData?.filter((d) => {
        const md = parseIfString(d.metadata);
        return md.address === user?.profile?.id;
      });

  const tasks = resources
    ?.map((data, index) => {
      const meta = parseIfString(data?.metadata);

      meta.laporanMagang = parseIfString(meta?.laporanMagang);
      meta.nilai = parseIfString(meta?.nilai);
      meta.fileLaporan = parseIfString(meta?.fileLaporan);
      meta.no = index + 1;
      meta.tanggal = data.createdAt;
      meta.isAdmin = isAdmin;
      meta.info = getStatus(meta);

      const result = { ...data, ...meta };
      const { metadata, ...final } = result;
      return final;
    })
    .reverse();

  return (
    <>
      <div className=" h-full flex-1 flex-col space-y-8 p-8 flex max-w-screen-2xl mx-auto">
        <div className="flex items-center justify-between space-y-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              Welcome back, {profile?.role} {profile?.name}!
            </h2>
            <div className="text-sm my-1">{profile?.address}</div>
            <p className="text-muted-foreground">
              Here&apos;s a list of request!
            </p>
          </div>
        </div>
        <DataTable data={tasks} columns={columns} profile={profile} />
        {/*<Debug data={tasks} />*/}
      </div>
    </>
  );
}
