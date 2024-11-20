import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Button } from "~/components/ui/button";
import { Spinner } from "~/components/ui/loading";
import React from "react";
import { useMatches, Link } from "@remix-run/react";
import Swal from "sweetalert2";
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

  const [loading, setLoading] = React.useState(false);
  const [name, setName] = React.useState("");
  const [role, setRole] = React.useState("");

  return (
    <>
      <div className="container relative hidden h-screen flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
        <div className="relative hidden h-full flex-col bg-muted p-10 text-white dark:border-r lg:flex">
          <div className="absolute inset-0 bg-[url(https://images.unsplash.com/photo-1529236183275-4fdcf2bc987e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1467&q=80)]" />
          <div className="relative z-20 mt-auto">
            <blockquote className="space-y-2">
              <footer className="text-sm bg-slate-50/50 w-fit text-black p-1.5 rounded-md font-semibold">
                Riya Widayanti
              </footer>
            </blockquote>
          </div>
        </div>
        <div className="lg:p-8">
          <div className="mx-auto flex w-full flex-col justify-center space-y-4 sm:w-[350px]">
            <div className="flex flex-col space-y-2 text-center">
              <h1 className="text-2xl font-semibold tracking-tight">
                Create an account
              </h1>
              <p className="text-sm text-muted-foreground">
                Enter your details
              </p>
            </div>
            <div>
              <Label htmlFor="name">Nama</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                type="text"
                id="name"
                name="name"
                placeholder="Nama"
              />
            </div>
            <div>
              <Label htmlFor="UserNama">Sebagai</Label>
              <Select value={role} onValueChange={setRole} name="role">
                <SelectTrigger>
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
                    Apakah anda yakin akan daftar sebagai {role}?
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
                        await contract.methods.register(name, role).send({
                          from: user.accounts[0],
                          // gas: "800000",
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

            <p className="px-8 text-center text-sm text-muted-foreground">
              Please read{" "}
              <Link
                to="/doc"
                className="underline underline-offset-4 hover:text-primary"
              >
                Documentation
              </Link>
            </p>
            <p className="px-8 text-center text-sm text-muted-foreground">
              By Riya Widayanti
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
