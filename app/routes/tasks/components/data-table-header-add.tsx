"use client";

import { Spinner } from "~/components/ui/loading";
import Swal from "sweetalert2";
import { Plus } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "~/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "~/components/ui/alert-dialog";
import { useMatches } from "@remix-run/react";
import React from "react";

export function SheetSide() {
  const { contract, user } = useMatches()[1].data;

  const [loading, setLoading] = React.useState(false);
  const [name, setName] = React.useState("");
  const [role, setRole] = React.useState("");
  const [address, setAddress] = React.useState("");

  const roles = [
    {
      name: "Admin",
    },
    {
      name: "Mahasiswa",
    },
  ];

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="ml-auto hidden h-8 lg:flex"
        >
          <Plus />
          Add User
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Register New User</SheetTitle>
          <SheetDescription>Click save when you're done.</SheetDescription>
        </SheetHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input
              onChange={(e) => setName(e.target.value)}
              value={name}
              id="name"
              placeholder="Nama"
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="address" className="text-right">
              Address
            </Label>
            <Input
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="0x3293938014CE7a641177d45bF1c06bd7CD1e7b09"
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="role" className="text-right">
              Role
            </Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger id="role" className="col-span-3">
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
          </div>
        </div>
        <SheetFooter>
          <SheetClose asChild>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  disabled={name.length === 0 || role.length === 0}
                  type="button"
                >
                  Submit
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    Apakah anda yakin akan mendaftarkan {name} sebagai {role}?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    Setelah menekan iya anda akan diminta melanjutkan transaksi
                    di wallet etherum.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Batal</AlertDialogCancel>
                  <AlertDialogAction
                    disabled={loading}
                    onClick={async (e) => {
                      e.preventDefault();

                      try {
                        setLoading(true);

                        await contract.methods
                          .registerFor(
                            address, // Alamat pengguna yang akan didaftarkan
                            name, // Nama pengguna
                            role, // Peran pengguna
                          )
                          .send({
                            from: user.accounts[0],
                            gas: "800000",
                          });

                        Swal.fire({
                          icon: "success",
                          title: "success register user",
                          showConfirmButton: false,
                          timer: 500,
                        });

                        return location.replace("/app");
                      } catch (error: any) {
                        console.log(error);
                        setLoading(false);
                        return Swal.fire({
                          icon: "error",
                          title: error,
                        });
                      }
                    }}
                  >
                    {loading && <Spinner />} Iya
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
