import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import React from "react";
import { useMatches } from "@remix-run/react";
import Swal from "sweetalert2";

export default function RegisterAccount() {
  const { contract, user } = useMatches()[1].data;

  const roles = [
    {
      name: "Admin",
    },
    {
      name: "Mahasiswa",
    },
  ];

  if (user.register_status) {
    return location.replace("/app");
  }

  const [name, setName] = React.useState("");
  const [role, setRole] = React.useState("");

  return (
    <div>
      <div className="flex flex-row justify-center pt-12">
        <div className="flex-col w-[90%]  lg:w-[30%] bg-white shadow-lg p-8">
          <div className="mb-3">
            <label
              htmlFor="UserNama"
              className="block text-sm font-semibold text-gray-700"
            >
              Nama
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              type="text"
              id="UserNama"
              name="name"
              placeholder="Nama"
              className="mt-1 w-full rounded-[10px]  shadow-sm sm:text-sm p-2.5 border border-gray-400 outline-none"
            />
          </div>
          <label
            htmlFor="UserNama"
            className="block text-sm font-semibold text-gray-700"
          >
            Sebagai
          </label>
          <Select value={role} onValueChange={setRole} name="role">
            <SelectTrigger className=" w-full text-gray-700 outline-none mt-1 focus:ring-none ring-blue-600 border border-gray-400 rounded-[10px] h-11 ">
              <SelectValue placeholder="Pilih Role" />
            </SelectTrigger>
            <SelectContent>
              {roles.map((e) => (
                <SelectItem key={e?.name} value={e?.name}>
                  {e?.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex items-center justify-center">
            <button
              type="button"
              onClick={() => {
                if (name.length > 0 && role.length > 0) {
                  Swal.fire({
                    icon: "info",
                    text: `Apakah anda yakin akan daftar sebagai ${role}`,
                  }).then(async (res) => {
                    if (res.isConfirmed) {
                      try {
                        await contract.methods.register(name, role).send({
                          from: user.accounts[0],
                          gas: "800000",
                        });

                        return location.replace("/app");
                      } catch (error: any) {
                        console.log(error);
                        return Swal.fire({
                          icon: "error",
                          title: error,
                        });
                      }
                    }
                  });
                }
              }}
              className="rounded-[10px] mt-4 group relative inline-block overflow-hidden border border-indigo-600 px-8 py-3 focus:outline-none focus:ring"
            >
              <span className="absolute inset-y-0 left-0 w-[2px] bg-indigo-600 transition-all group-hover:w-full group-active:bg-indigo-500"></span>

              <span className="relative text-sm font-semibold text-indigo-600 transition-colors group-hover:text-white">
                Masuk
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
