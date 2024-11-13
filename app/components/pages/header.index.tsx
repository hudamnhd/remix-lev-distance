import { Form, useActionData, useNavigation } from "@remix-run/react";
import React from "react";
import Swal from "sweetalert2";
import { v4 } from "uuid";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Label } from "~/components/ui/label";
import { LoadingSpinner } from "~/components/ui/loading";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { initialData } from "~/constants/mataKuliah";

export const Header = ({ profile }) => {
  const navigation = useNavigation();
  const data = useActionData();
  const isSubmitting = navigation.state !== "idle";

  const [open, setOpen] = React.useState(false);
  const [jenisMagang, setJenisMagang] = React.useState("");
  const [selectedMKOne, setSelectedMKOne] = React.useState<any[]>([]);

  const toggleMKone = (person: any) => {
    const index = selectedMKOne.findIndex((p) => p.code === person.code);
    if (index === -1) {
      setSelectedMKOne([person]);
    } else {
      setSelectedMKOne(selectedMKOne.filter((p) => p.code !== person.code));
    }
  };

  const product = JSON.stringify({
    name: profile?.name,
    address: profile?.address,
    jenisMagang,
    status: 1,
    mataKuliah: selectedMKOne[0]?.matakuliah,
    codeKuliah: selectedMKOne[0]?.code,
  });

  const id_product = v4();

  const _data = {
    id: id_product,
    metadata: product,
  };

  React.useEffect(() => {
    if (data?.ok && data?.message) {
      setSelectedMKOne([]);
      setJenisMagang("");
      Swal.fire({
        icon: "success",
        title: data?.message,
        showConfirmButton: false,
        timer: 500,
      });
      setOpen(false);
    } else if (!data?.ok && data?.message) {
      Swal.fire({
        icon: "error",
        title: data?.message,
        showConfirmButton: false,
        timer: 500,
      });
    }
  }, [data]);

  return (
    <header>
      <div className="mx-auto max-w-screen-xl py-8 px-2 sm:py-12">
        <div className="lg:flex lg:items-center lg:justify-between">
          <div className="text-center sm:text-left">
            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
              Welcome Back, {profile?.role} {profile?.name}!
            </h1>
            <div className="text-sm">{profile?.address}</div>
          </div>

          <div className="mt-4 flex flex-col gap-4 lg:mt-0 sm:flex-row sm:items-center">
            {profile?.role !== "Admin" && (
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger className=" mb-5 inline-flex items-center justify-center gap-1.5 rounded-lg border border-gray-200 px-5 py-3 text-gray-500 transition hover:bg-gray-50 hover:text-gray-700 focus:outline-none focus:ring">
                  <span className="text-sm font-bold">Pengajuan Magang</span>

                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                </DialogTrigger>
                <DialogContent className=" sm:max-w-[425px]">
                  {isSubmitting && (
                    <div className="absolute h-full w-full flex items-center justify-center bg-white/20">
                      <LoadingSpinner stroke={`#000`} size={55} />
                    </div>
                  )}
                  <DialogHeader>
                    <DialogTitle>Pengajuan Magang</DialogTitle>
                    <DialogDescription></DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid items-center gap-2">
                      <Label htmlFor="name" className="text-left">
                        Jenis Magang
                      </Label>
                      <Select
                        value={jenisMagang}
                        onValueChange={setJenisMagang}
                      >
                        <SelectTrigger className=" w-full text-gray-700 outline-none mt-1 focus:ring-none ring-blue-600 border border-gray-400 rounded-[10px] h-11 ">
                          <SelectValue placeholder="Pilih Magang" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="DIKTI">DIKTI</SelectItem>
                          <SelectItem value="Mandiri">Mandiri</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <div className="mb-3">
                      <label
                        htmlFor="UserEmail"
                        className="block text-xs sm:text-sm  font-medium text-gray-700"
                      >
                        Mata Kuliah
                      </label>
                      <input
                        defaultValue={selectedMKOne[0]?.matakuliah ?? ""}
                        placeholder="Mata Kuliah"
                        type="text"
                        readOnly
                        className="disabled:bg-gray-200 mt-1.5  px-4 py-2.5 w-full rounded-[10px] border border-gray-400 outline-none focus:ring-2 focus:border-blue-600 ring-blue-600 shadow-sm sm:text-sm"
                      />
                    </div>

                    <ListData
                      selectedMKOne={selectedMKOne}
                      toggleMKone={toggleMKone}
                    />
                  </div>
                  <DialogFooter>
                    <Form method="POST">
                      <input
                        name="request_magang"
                        type="hidden"
                        defaultValue={JSON.stringify(_data)}
                      />
                      {jenisMagang !== "" && selectedMKOne.length === 1 && (
                        <Button type="submit">Submit</Button>
                      )}
                    </Form>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

const ListData = ({ selectedMKOne, toggleMKone }) => {
  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="item-1">
        <AccordionTrigger className="text-sm border-none text-gray-700 px-3">
          Daftar Mata Kuliah
        </AccordionTrigger>
        <AccordionContent>
          <div className="grid ">
            <div className="overflow-x-auto max-w-3xl max-h-[24vh]">
              <table className="min-w-full divide-y-2 divide-gray-200 bg-white text-sm border">
                <thead className="hidden ltr:text-left rtl:text-right sticky top-0 bg-slate-300 font-bold shadow-xl">
                  <tr>
                    <th className="px-4 py-2 text-gray-900 text-left">Name</th>
                    <th className="px-4 py-2 text-gray-900 hidden">Category</th>
                    <th className="hidden px-4 py-2 text-gray-900">Code</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-200">
                  {initialData.map((person, index) => (
                    <tr
                      onClick={() => toggleMKone(person)}
                      key={index}
                      className={`cursor-pointer ${
                        selectedMKOne.some((p) => p.code === person.code)
                          ? "bg-slate-200"
                          : person.category === 1
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
                      <td className="px-4 py-2 font-medium text-gray-900 hidden">
                        {person.category}
                      </td>
                      <td className="hidden px-4 py-2 font-medium text-gray-900">
                        {person.code}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};