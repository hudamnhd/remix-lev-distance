import type { LoaderArgs } from "@remix-run/react";
import { parseMetadata, compressData, decompressData } from "~/lib/misc";
import { Buffer } from "buffer";
import { json } from "@remix-run/node";
import { useMatches, useSubmit } from "@remix-run/react";
import { db } from "~/lib/db.server";
import { parseIfString } from "~/lib/utils";

import {
  unstable_composeUploadHandlers as composeUploadHandlers,
  unstable_createFileUploadHandler as createFileUploadHandler,
  unstable_createMemoryUploadHandler as createMemoryUploadHandler,
  unstable_parseMultipartFormData as parseMultipartFormData,
} from "@remix-run/node";
import {
  Form,
  useActionData,
  useLoaderData,
  useNavigate,
  useNavigation,
} from "@remix-run/react";
import QRCode from "qrcode";
import React from "react";
import Swal from "sweetalert2";

import type { ActionFunctionArgs } from "@remix-run/node";
import {
  adjustScores,
  fuzzySearch,
  calculateFuzzyScore,
  konversiNilai,
} from "~/lib/fuzzy";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { initialData } from "~/constants/mataKuliah";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  //DialogTrigger,
} from "~/components/ui/dialog";
import { SpinnerFull } from "~/components/ui/loading";
import { uploadImage } from "~/lib/upload.server";

const encodeBase64NoPadding = (data: string) => {
  const encoded = Buffer.from(data).toString("base64");
  return encoded.replace(/=+$/, ""); // Menghapus padding `=`
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const id = params.id;

  const p = await db.product.findUnique({
    where: { id: params.id },
  });

  const contentType = request.headers.get("Content-Type") || "";

  if (contentType.includes("multipart/form-data")) {
    const uploadHandler: UploadHandler = composeUploadHandlers(
      async ({ name, data }) => {
        if (name !== "img") {
          return undefined;
        }

        const uploadedImage = await uploadImage(data);
        console.warn(
          "DEBUGPRINT[2]: app.$id.tsx:75: uploadedImage=",
          uploadedImage,
        );
        return uploadedImage.secure_url;
      },
      createMemoryUploadHandler(),
    );
    // const uploadHandler = composeUploadHandlers(
    //   createFileUploadHandler({
    //     directory: "public/uploads",
    //     maxPartSize: 5_000_000,
    //     file: ({ filename }) => filename,
    //   }),
    //   createMemoryUploadHandler(),
    // );

    const formData = await parseMultipartFormData(request, uploadHandler);
    const images = formData.getAll("img"); // all file
    // const imageNames = images
    //   .filter((file) => file.name.trim() !== "") // Hapus file dengan nama kosong
    //   .map((file) => file.name);
    //
    // const result = imageNames.length > 0 ? imageNames : null;
    const result = images?.length > 0 ? images : null;

    if (!result) {
      return json({ error: "something wrong", imgSrc: null });
    }

    let laporanMagang = formData.get("laporanMagang");

    let data = {
      laporanMagang,
      fileLaporan: JSON.stringify(result),
    };

    const parse_product = JSON.parse(p.metadata);
    const product = { ...parse_product, ...data };
    const _product = JSON.stringify(product);

    await db.product.update({
      where: {
        id: id,
      },
      data: {
        metadata: _product,
      },
    });

    return json({
      ok: true,
      message: `Sukses Memperbarui Permintaan Magang`,
    });
  } else {
    const formData = await request.formData();
    //const updates = Object.fromEntries(formData);
    let type = formData.get("type");
    if (type === "sidang") {
      let productJson = formData.get("json");

      await db.product.update({
        where: {
          id: id,
        },
        data: {
          metadata: productJson,
        },
      });

      return json({
        ok: true,
        message: `Sukses Memperbarui Permintaan Magang`,
        id,
      });
    }

    if (request.method === "PUT") {
      let learningAgreement = formData.get("learningAgreement");
      let rancangKRS = formData.get("learningAgreement");
      let konsultasiPA = formData.get("konsultasiPA");
      let status = formData.get("status");
      let validasiDekan = formData.get("validasiDekan");
      let validasiKaprodi = formData.get("validasiKaprodi");

      let data = {
        id: id,
        status: parseInt(status),
        konsultasiPA: konsultasiPA ? new Date(konsultasiPA) : null,
        rancangKRS: rancangKRS == "on" ? true : null,
        learningAgreement: learningAgreement == "on" ? true : null,
        validasiDekan: validasiDekan == "on" ? true : null,
        validasiKaprodi: validasiKaprodi == "on" ? true : null,
      };

      const parse_product = JSON.parse(p.metadata);
      const product = { ...parse_product, ...data };
      const _product = JSON.stringify(product);

      //return json({ ok: true, message: `Sukses Memperbarui Permintaan Magang` });
      await db.product.update({
        where: {
          id: id,
        },
        data: {
          metadata: _product,
        },
      });

      return json({
        ok: true,
        message: `Sukses Memperbarui Permintaan Magang`,
      });
    }
  }
};

export const loader = async ({ params }: LoaderArgs) => {
  const product = await db.product.findUnique({
    where: { id: params.id },
  });

  if (!product) {
    throw new Response("Not Found", { status: 404 });
  }

  const data = {
    id: product.id,
    md: parseIfString(product.metadata),
  };

  return json({ data });
};

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
const threshold = 4; // Ambang batas untuk kesalahan

const getValue = (value) => {
  if (value === null || value === undefined) {
    return "";
  }
  if (typeof value === "boolean") {
    return value ? "on" : "";
  }
  return value;
};

export default function Index() {
  // the root route will always be the first match
  const { contract, user } = useMatches()[1].data;
  const { data } = useLoaderData<typeof loader>();
  const { md, url } = data;
  const actionData = useActionData<typeof action>();

  const navigate = useNavigate();

  const profile = {
    role: user?.profile?.role,
    name: user?.profile?.name,
    address: user?.profile?.id,
  };

  const laporanMagang = md?.laporanMagang
    ? parseIfString(md?.laporanMagang)
    : {};

  React.useEffect(() => {
    if (actionData?.ok && actionData?.message) {
      if (!actionData?.product) {
        Swal.fire({
          icon: "success",
          title: actionData?.message,
          showConfirmButton: false,
          timer: 500,
        });
        navigate("/app");
      } else {
        const { id, product, message } = actionData;
        console.warn("DEBUGPRINT[4]: app.$id.tsx:302: product=", product);
        // saveInBlockchain(id, product, message);
      }
    } else if (!actionData?.ok && actionData?.message) {
      Swal.fire({
        icon: "error",
        title: actionData?.message,
        showConfirmButton: false,
        timer: 500,
      });
    }
  }, [actionData]);

  return (
    <Dialog open={true} onOpenChange={() => navigate(-1)}>
      {profile?.role === "Mahasiswa" ? (
        <div>
          {md?.tanggalSidang ? (
            <ScoreRequest md={md} url={url} />
          ) : md?.validasiDekan && !md?.laporanMagang ? (
            <ReportRequest md={md} />
          ) : (
            <PlanRequest md={md} />
          )}
        </div>
      ) : (
        <div>
          {laporanMagang && Object.keys(laporanMagang).length > 0 ? (
            <SidangRequest md={md} laporanMagang={laporanMagang} />
          ) : md?.rancangKRS && md.learningAgreement ? (
            <ValidationRequest md={md} />
          ) : (
            <ApproveRequest md={md} />
          )}
        </div>
      )}
    </Dialog>
  );
}

const wait = () => new Promise((resolve) => setTimeout(resolve, 1000));

const ValidationRequest = ({ md }) => {
  const navigation = useNavigation();
  const navigate = useNavigate();
  const isSubmitting = navigation.state !== "idle";

  const [validasiDekan, setValidasiDekan] = React.useState(
    md?.validasiDekan ?? false,
  );
  const [validasiKaprodi, setValidasiKaprodi] = React.useState(
    md?.validasiKaprodi ?? false,
  );

  return (
    <DialogContent className=" sm:max-w-[425px]">
      <Form
        method="PUT"
        className="space-y-3"
        onSubmit={() => {
          wait().then(() => navigate("/app"));
        }}
      >
        {isSubmitting && <SpinnerFull />}
        <DialogHeader>
          <DialogTitle>
            Pengajuan Magang ( validasi Dekan Dan Kaprodi )
          </DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>

        <fieldset>
          <legend className="sr-only">Checkboxes</legend>

          <div className="space-y-2">
            <Label
              htmlFor="Option1"
              className="flex cursor-pointer items-start gap-4 rounded-lg border border-gray-200 p-4 transition hover:bg-gray-50 has-[:checked]:bg-blue-50"
            >
              <div className="flex items-center">
                &#8203;
                <Input
                  checked={validasiDekan}
                  name="validasiDekan"
                  type="checkbox"
                  onChange={(e) => setValidasiDekan(e.target.checked)}
                  className="size-4 rounded border-gray-300"
                  id="Option1"
                />
              </div>

              <div>
                <strong className="font-medium text-gray-900">
                  Validasi Dekan
                </strong>

                <p className="mt-1 text-pretty text-sm text-gray-700">
                  Lorem ipsum dolor sit amet consectetur adipisicing elit.
                </p>
              </div>
            </Label>

            <Label
              htmlFor="validasiKaprodi"
              className="flex cursor-pointer items-start gap-4 rounded-lg border border-gray-200 p-4 transition hover:bg-gray-50 has-[:checked]:bg-blue-50"
            >
              <Input
                checked={validasiKaprodi}
                name="validasiKaprodi"
                type="checkbox"
                onChange={(e) => setValidasiKaprodi(e.target.checked)}
                className="size-4 rounded border-gray-300"
                id="validasiKaprodi"
              />

              <div>
                <strong className="font-medium text-gray-900">
                  Validasi Kaprodix
                </strong>

                <p className="mt-1 text-pretty text-sm text-gray-700">
                  Lorem ipsum dolor sit amet consectetur.
                </p>
              </div>
            </Label>
          </div>
        </fieldset>

        <InputHidden md={md} />
        <DialogFooter>
          {validasiDekan && validasiKaprodi && (
            <Button type="submit">Submit</Button>
          )}
        </DialogFooter>
      </Form>
    </DialogContent>
  );
};
import { Printer, Eye } from "lucide-react";
const ScoreRequest = ({ md }) => {
  const [url, setUrl] = React.useState("");
  const certificateRef = React.useRef(null);
  const navigate = useNavigate();

  const printCertificate = () => {
    if (certificateRef.current === null) {
      return;
    }

    const printContents = certificateRef.current.innerHTML;
    const originalContents = document.body.innerHTML;

    document.body.innerHTML = printContents;
    window.print();
    document.body.innerHTML = originalContents;
    window.location.reload(); // To reload the page to its original state
  };

  React.useEffect(() => {
    const generateQRCode = async () => {
      const link = `${window.location.protocol}//${window.location.host}/detail/${md.id}`;
      try {
        const qrUrl = await QRCode.toDataURL(link);
        setUrl(qrUrl);
      } catch (error) {
        console.error("Error generating QR code:", error);
      }
    };

    generateQRCode();
  }, [md.id]);

  return (
    <DialogContent className="max-w-4xl">
      <DialogHeader>
        <DialogTitle>Sertifikat</DialogTitle>
        <DialogDescription>Sertifikat digital</DialogDescription>
      </DialogHeader>
      <>
        <div ref={certificateRef} className="grid gap-5 place-items-start">
          <div className="bg-gradient-to-r from-blue-800 to-indigo-900 p-10 rounded-lg shadow-lg w-full max-w-4xl">
            <div className="text-center mb-10">
              <h1 className="text-4xl font-bold text-white">
                Certificate of Completion
              </h1>
              <p className="text-xl text-gray-50">This certifies that</p>
            </div>
            <div className="text-center mb-10">
              <h2 className="text-3xl font-semibold text-white">{md?.name}</h2>
              <p className="text-lg text-gray-50">
                has successfully completed the internship program at
              </p>
              <p className="text-lg font-semibold text-white">
                {md?.jenisMagang} - {md?.mataKuliah}
              </p>
            </div>
            <div className="text-center mb-10">
              <p className="text-gray-50">Date of Completion:</p>
              <p className="text-lg font-semibold text-white">
                {new Date(md?.tanggalSidang).toLocaleDateString("en-CA")}
              </p>
            </div>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-50">Authorized by</p>
                <p className="text-lg font-semibold text-white">
                  [Authority Name]
                </p>
                <p className="text-gray-50">[Authority Position]</p>
              </div>
              <div className="text-center">
                <img
                  src={url ?? ""}
                  alt="Barcode"
                  className="w-32 h-32 mx-auto"
                />
                <p className="text-sm text-gray-50 mt-2">
                  Secured by Blockchain
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="mx-auto w-fit space-x-3">
          <Button
            onClick={() => navigate(`/app/detail/${md.id}`)}
            variant="outline"
          >
            <Eye />
            View
          </Button>
          <Button className="no-print " onClick={printCertificate}>
            <Printer />
            Print
          </Button>
        </div>
      </>
    </DialogContent>
  );
};

const ReportRequest = ({ md }) => {
  const navigation = useNavigation();
  const isSubmitting = navigation.state !== "idle";

  type Skill = {
    name: string;
    value: number;
  };

  const [skillName, setSkillName] = React.useState<string>("");
  const [skillValue, setSkillValue] = React.useState<number>(0);
  const [skillCategory, setSkillCategory] = React.useState<"hard" | "soft">(
    "hard",
  );

  const [hardSkills, setHardSkills] = React.useState<Skill[]>([
    {
      name: "A",
      value: 100,
    },
    {
      name: "B",
      value: 90,
    },
  ]);
  const [softSkills, setSoftSkills] = React.useState<Skill[]>([
    {
      name: "A",
      value: 80,
    },
    {
      name: "B",
      value: 70,
    },
  ]);

  const handleAddSkill = () => {
    if (skillName.trim() === "" && skillValue !== "")
      return Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Something went wrong!",
        showConfirmButton: false,
        timer: 500,
      });
    const newSkill: Skill = {
      name: skillName,
      value: skillValue,
    };

    if (skillCategory === "hard") {
      setHardSkills([...hardSkills, newSkill]);
    } else {
      setSoftSkills([...softSkills, newSkill]);
    }

    setSkillName("");
    setSkillValue(0);
  };

  const handleRemoveSkill = (category: "hard" | "soft", index: number) => {
    if (category === "hard") {
      const updatedHardSkills = [...hardSkills];
      updatedHardSkills.splice(index, 1);
      setHardSkills(updatedHardSkills);
    } else {
      const updatedSoftSkills = [...softSkills];
      updatedSoftSkills.splice(index, 1);
      setSoftSkills(updatedSoftSkills);
    }
  };

  const handleSkillValueChange = (value: number) => {
    const newValue = Math.min(value, 100);
    if (isNaN(value)) return setSkillValue("");
    setSkillValue(newValue);
  };

  const skils = {
    hardSkills: hardSkills,
    softSkills: softSkills,
  };

  return (
    <DialogContent className=" sm:max-w-[425px]">
      <Form method="post" encType="multipart/form-data">
        {isSubmitting && <SpinnerFull />}
        <DialogHeader>
          <DialogTitle>Upload Berkas dan Laporan</DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>

        <div className="">
          <div className="mb-3">
            <Input type="hidden" name="id" defaultValue={md?.id} />
            <Input type="hidden" name="type" defaultValue="upload" />
            <Input
              type="hidden"
              name="laporanMagang"
              defaultValue={JSON.stringify(skils)}
            />
            <Label
              className="block mb-1 text-sm font-medium text-gray-900 dark:text-white"
              htmlFor="multiple_files"
            >
              Upload multiple files
            </Label>

            <Label className="block">
              <span className="sr-only">Choose profile photo</span>
              <Input
                type="file"
                name="img"
                accept="image/*"
                multiple
                className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-muted-background file:text-primary hover:file:bg-accent h-full"
              />
            </Label>
          </div>
          <div className="mb-3">
            <Label
              htmlFor="default-input"
              className="block mb-1 text-sm font-medium text-gray-900 dark:text-white"
            >
              Skill Name
            </Label>
            <Input
              type="text"
              value={skillName}
              placeholder="Skill Name"
              onChange={(e) => setSkillName(e.target.value)}
            />
          </div>
          <div className="mb-3">
            <Label
              htmlFor="default-input"
              className="block mb-1 text-sm font-medium text-gray-900 dark:text-white"
            >
              Skill Value
            </Label>
            <Input
              type="number"
              value={skillValue}
              onChange={(e) => handleSkillValueChange(parseInt(e.target.value))}
              min={0}
              max={100}
            />
          </div>
          <div>
            <Label
              htmlFor="default-input"
              className="block mb-1 text-sm font-medium text-gray-900 dark:text-white"
            >
              Category
            </Label>

            <Select value={skillCategory} onValueChange={setSkillCategory}>
              <SelectTrigger className=" w-full text-gray-700 outline-none mt-1 focus:ring-none ring-blue-600 border border-gray-400 rounded-[10px] h-11 ">
                <SelectValue placeholder="Pilih Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hard">Hard Skill</SelectItem>
                <SelectItem value="soft">Soft Skill</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="mt-4 flex items-center justify-center">
            <button
              className="px-5 py-2.5 text-sm font-medium text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 rounded-lg text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
              onClick={handleAddSkill}
              type="button"
            >
              Add Skill
            </button>
          </div>
          <div className="mb-5">
            {hardSkills.length > 0 && (
              <>
                <h2 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
                  Hard Skills:
                </h2>
                <ol className="max-w-md space-y-1 text-gray-500 list-decimal list-inside dark:text-gray-400">
                  {hardSkills.map((skill, index) => (
                    <li key={index}>
                      <span className="font-semibold text-gray-900 dark:text-white capitalize">
                        {skill.name}
                      </span>{" "}
                      with{" "}
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {skill.value}
                      </span>{" "}
                      points
                      <button
                        type="button"
                        className="translate-y-1.5 ml-2 focus:outline-none text-red-700  hover:ring-2 hover:ring-red-700 font-medium rounded-lg text-sm"
                        onClick={() => handleRemoveSkill("hard", index)}
                      >
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
                            strokeWidth="2"
                          >
                            <path
                              strokeDasharray="60"
                              strokeDashoffset="60"
                              d="M12 3C16.9706 3 21 7.02944 21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3Z"
                            >
                              <animate
                                fill="freeze"
                                attributeName="stroke-dashoffset"
                                dur="0.5s"
                                values="60;0"
                              ></animate>
                            </path>
                            <path
                              strokeDasharray="8"
                              strokeDashoffset="8"
                              d="M12 12L16 16M12 12L8 8M12 12L8 16M12 12L16 8"
                            >
                              <animate
                                fill="freeze"
                                attributeName="stroke-dashoffset"
                                begin="0.6s"
                                dur="0.2s"
                                values="8;0"
                              ></animate>
                            </path>
                          </g>
                        </svg>
                      </button>
                    </li>
                  ))}
                </ol>
              </>
            )}
          </div>
          <div>
            {softSkills.length > 0 && (
              <>
                <h2 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
                  Soft Skills:
                </h2>
                <ol className="max-w-md space-y-1 text-gray-500 list-decimal list-inside dark:text-gray-400">
                  {softSkills.map((skill, index) => (
                    <li key={index}>
                      <span className="font-semibold text-gray-900 dark:text-white capitalize">
                        {skill.name}
                      </span>{" "}
                      with{" "}
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {skill.value}
                      </span>{" "}
                      points
                      <button
                        type="button"
                        className="translate-y-1.5 ml-2 focus:outline-none text-red-700  hover:ring-2 hover:ring-red-700 font-medium rounded-lg text-sm"
                        onClick={() => handleRemoveSkill("soft", index)}
                      >
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
                            strokeWidth="2"
                          >
                            <path
                              strokeDasharray="60"
                              strokeDashoffset="60"
                              d="M12 3C16.9706 3 21 7.02944 21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3Z"
                            >
                              <animate
                                fill="freeze"
                                attributeName="stroke-dashoffset"
                                dur="0.5s"
                                values="60;0"
                              ></animate>
                            </path>
                            <path
                              strokeDasharray="8"
                              strokeDashoffset="8"
                              d="M12 12L16 16M12 12L8 8M12 12L8 16M12 12L16 8"
                            >
                              <animate
                                fill="freeze"
                                attributeName="stroke-dashoffset"
                                begin="0.6s"
                                dur="0.2s"
                                values="8;0"
                              ></animate>
                            </path>
                          </g>
                        </svg>
                      </button>
                    </li>
                  ))}
                </ol>
              </>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button type="submit">Submit</Button>
        </DialogFooter>
      </Form>
    </DialogContent>
  );
};

const SidangRequest = ({ laporanMagang, md }) => {
  const navigation = useNavigation();
  const isSubmitting = navigation.state !== "idle";

  const [tanggalSidang, setTanggalSidang] = React.useState("");
  const [selectedPersons, setSelectedPersons] = React.useState<any[]>([]);
  const [resultCombine, setResultCombine] = React.useState<any[]>([]);
  const [addtPerc, setAddtPerc] = React.useState<number>(30);

  let softSkillsScore = 0;
  let hardSkillsScore = 0;

  if (laporanMagang?.softSkills?.length > 0) {
    let totalSoftSkills = 0;
    laporanMagang?.softSkills.forEach((skill) => {
      totalSoftSkills += skill.value;
    });
    softSkillsScore = totalSoftSkills / laporanMagang?.softSkills?.length / 10;
  }

  if (laporanMagang?.hardSkills?.length > 0) {
    let totalHardSkills = 0;
    laporanMagang?.hardSkills.forEach((skill) => {
      totalHardSkills += skill.value;
    });
    hardSkillsScore = totalHardSkills / laporanMagang?.hardSkills?.length / 10;
  }

  const _score = {
    softSkillsScore,
    hardSkillsScore,
  };
  const findMK = initialData.filter((d) => d.code === md?.codeKuliah);
  let resultFuzzy = [];
  let query = null;
  if (findMK?.length > 0) {
    query = findMK[0];
    // resultFuzzy = fuzzySearch(query, initialData, threshold);

    resultFuzzy = initialData.map((course) => ({
      ...course,
      score: calculateFuzzyScore(course, query),
    }));
  }

  const courses = initialData;
  // Fungsi untuk menghitung skor fuzzy

  // Fungsi untuk menghitung skor fuzzy
  {
    /*const calculateFuzzyScore = (course, query) => {
        let score = 0;

        // Bobot skor untuk kategori
        const categoryWeights = {
            1: 5, // Skor penuh jika kategori cocok
            2: 3, // Skor tambahan untuk kategori 2 jika tidak cocok
            3: 2, // Skor tambahan untuk kategori 3 jika tidak cocok
            4: 1  // Skor tambahan untuk kategori 4 jika tidak cocok
        };

        // Bobot skor untuk kode
        const codeWeight = 3; // Skor maksimal untuk kecocokan kode

        // Cek kecocokan kategori dan beri skor atau bonus
        if (course.category === query.category) {
            score += categoryWeights[1]; // Kategori cocok, beri skor penuh
        } else {
            // Kategori tidak cocok, beri bonus tergantung kategori yang berbeda
            const diff = Math.abs(course.category - query.category);
            score += categoryWeights[diff] || 0; // Gunakan skor tambahan sesuai perbedaan kategori
        }

        // Jika kategori cocok, periksa kode
        if (course.category === query.category) {
            const levenshteinDistance = (a, b) => {
                let tmp;
                let i, j;
                const alen = a.length;
                const blen = b.length;
                const dp = [];

                if (alen === 0) { return blen; }
                if (blen === 0) { return alen; }

                for (i = 0; i <= alen; i++) { dp[i] = [i]; }
                for (j = 0; j <= blen; j++) { dp[0][j] = j; }

                for (i = 1; i <= alen; i++) {
                    for (j = 1; j <= blen; j++) {
                        tmp = a[i - 1] === b[j - 1] ? 0 : 1;
                        dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + tmp);
                    }
                }

                return dp[alen][blen];
            };

            const maxLen = Math.max(query.code.length, course.code.length);
            const distance = levenshteinDistance(course.code, query.code);
            const codeScore = Math.max(0, codeWeight - (distance / maxLen) * codeWeight);

            score += codeScore;
        }

        // Normalisasi skor agar berada dalam rentang 0-5
        const maxScore = categoryWeights[1] + codeWeight; // Total maksimal jika kategori cocok dan kode sempurna
        const normalizedScore = (score / maxScore) * 5;

        return normalizedScore;
    };

    // Hitung skor dan urutkan berdasarkan skor tertinggi
    const scoredCourses = courses.map(course => ({
        ...course,
        score: calculateFuzzyScore(course, query)
    }));

    const sortedCourses = scoredCourses.sort((a, b) => b.score - a.score);

    // Tampilkan hasil
    sortedCourses.forEach(course => {
        console.log(`Course: ${course.matakuliah}, Category: ${course.category}, Code: ${course.code}, Score: ${course.score.toFixed(2)}`);
    });
*/
  }
  const toggleSelection = (person: any) => {
    setResultCombine([]);
    const index = selectedPersons.findIndex((p) => p.code === person.code);
    if (index === -1) {
      if (selectedPersons.length === 5) return alert("Max 5 matakuliah");
      setSelectedPersons([...selectedPersons, person]);
    } else {
      const updatedSelection = selectedPersons.filter(
        (p) => p.code !== person.code,
      );
      setSelectedPersons(updatedSelection);
    }
  };

  const handleAddtPercChange = (value: number) => {
    setResultCombine([]);
    const newValue = Math.min(value, 100);
    if (isNaN(value)) return setAddtPerc("");
    setAddtPerc(newValue);
  };

  const handleConvert = (_score, _addtPerc) => {
    const _resultFuzzy = selectedPersons.map((person) => ({ ...person }));
    const softSkillsScore = _score?.softSkillsScore ?? 0; // Jumlah nilai soft skills dalam rentang 1-10
    const hardSkillsScore = _score?.hardSkillsScore ?? 0; // Jumlah nilai hard skills dalam rentang 1-10
    const addtPerc = _addtPerc; // Presebtasi nilai tambahan dalam mempengaruhi data hasil fuzzy
    const totalGrade = 5; // A B+ B C+ C (total semua grade)

    // prettier-ignore
    const adjustedResults = adjustScores(
      _resultFuzzy,
      softSkillsScore,
      hardSkillsScore,
      totalGrade,
      addtPerc,
    );
    setResultCombine(adjustedResults);
  };
  const { user, contract } = useMatches()[1].data;
  const { data } = useLoaderData<typeof loader>();
  const submit = useSubmit();
  const navigate = useNavigate();

  return (
    <DialogContent className="max-w-7xl">
      {isSubmitting && <SpinnerFull />}
      <DialogHeader>
        <DialogTitle>Prosesi Sidang dan Konversi Nilai</DialogTitle>
        <DialogDescription></DialogDescription>
      </DialogHeader>
      <div className="max-h-[80vh] overflow-y-auto pr-3">
        <div>
          <Label
            htmlFor="UserEmail"
            className="block text-xs sm:text-sm  font-medium text-gray-700"
          >
            Tanggal Sidang
          </Label>

          <Input
            value={tanggalSidang}
            onChange={(e) => setTanggalSidang(e.target.value)}
            placeholder="Test Laporan"
            type="date"
            className="disabled:bg-gray-200 mt-1.5  px-4 py-2.5 w-full rounded-[10px] border border-gray-400 outline-none focus:ring-2 focus:border-blue-600 ring-blue-600 shadow-sm sm:text-sm"
          />
        </div>

        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-1">
            <AccordionTrigger className="text-sm border-none text-gray-700 px-3">
              Daftar Mata Kuliah
            </AccordionTrigger>
            <AccordionContent className="grid grid-cols-2 gap-5 max-w-6xl">
              <div className="col-span-2 grid gap-5 border border-gray-300">
                <div className="overflow-x-auto max-w-full max-h-[24vh]">
                  <table className="min-w-full divide-y-2 divide-gray-200 bg-white text-sm">
                    <thead className="hidden ltr:text-left rtl:text-right sticky top-0 bg-slate-300 font-bold shadow-xl">
                      <tr>
                        <th className="px-4 py-2 text-gray-900 text-left">
                          Name
                        </th>
                        <th className="px-4 py-2 text-gray-900 hidden">
                          Category
                        </th>
                        <th className="px-4 py-2 text-gray-900 hiddenj">
                          Code
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-200">
                      {resultFuzzy.map((person, index) => (
                        <tr
                          onClick={() => toggleSelection(person)}
                          key={index}
                          className={`cursor-pointer ${
                            selectedPersons.some((p) => p.code === person.code)
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
                          <td className="px-4 py-2 font-medium text-gray-900 hidden">
                            {person.code}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="grid gap-5 mt-5 place-items-start">
                <h2 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
                  Fuzzy Match By Code & Category
                </h2>
                <div className="overflow-x-auto rounded-lg border border-gray-300 w-full">
                  <table className="min-w-full divide-y-2 divide-gray-300 bg-white text-sm">
                    <thead className="ltr:text-left rtl:text-right">
                      <tr>
                        <th className="px-4 py-2 font-medium text-gray-900 text-left">
                          Mata Kuliah
                        </th>
                        <th className="px-4 py-2 font-medium text-gray-900 text-left">
                          Fuzzy Score
                        </th>
                        <th className="px-4 py-2 font-medium text-gray-900 text-left">
                          Nilai
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-200">
                      {selectedPersons?.length > 0 &&
                        selectedPersons
                          ?.sort((a, b) => a.score - b.score)
                          .map((person, index) => (
                            <tr
                              onClick={() => toggleSelection(person)}
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
                              <td className="px-4 py-2 font-medium text-gray-900 text-left">
                                {person.score}
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
              </div>

              {resultCombine?.length > 0 && (
                <div className="grid gap-5 mt-5 place-items-start">
                  <h2 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
                    Fuzzy Match + Nilai Soft Skills & Hard Skills ( {addtPerc}%
                    Effect )
                  </h2>
                  <div className="overflow-x-auto rounded-lg border border-gray-300 w-full">
                    <table className="min-w-full divide-y-2 divide-gray-300 bg-white text-sm">
                      <thead className="ltr:text-left rtl:text-right">
                        <tr>
                          <th className="px-4 py-2 font-medium text-gray-900 text-left">
                            Mata Kuliah
                          </th>
                          <th className="px-4 py-2 font-medium text-gray-900 text-left">
                            Fuzzy Score
                          </th>
                          <th className="px-4 py-2 font-medium text-gray-900 text-left">
                            Nilai
                          </th>
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-gray-200">
                        {resultCombine?.length > 0 &&
                          resultCombine
                            ?.sort((a, b) => a.score - b.score)
                            .map((person, index) => (
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
                                <td className="px-4 py-2 font-medium text-gray-900 text-left">
                                  {person.score}
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
                </div>
              )}

              <div className="mt-3 col-span-2 mx-2 max-w-sm">
                <Label
                  htmlFor="default-input"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Presentase Efek untuk mempengaruhi Score Fuzzy (%)
                </Label>
                <Input
                  type="number"
                  value={addtPerc}
                  onChange={(e) =>
                    handleAddtPercChange(parseInt(e.target.value))
                  }
                  min={0}
                  max={100}
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                />
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
      <DialogFooter>
        <Button
          className="bg-emerald-600 hover:bg-emerald-700"
          onClick={() => {
            const _addtPerc = addtPerc / 100;
            if (query) {
              handleConvert(_score, _addtPerc);
            } else {
              Swal.fire({
                icon: "error",
                title: "Oops...",
                text: "Error",
                showConfirmButton: false,
                timer: 1000,
              });
            }
          }}
        >
          Convert
        </Button>

        <Form method="PUT" key="request_magang">
          {resultCombine?.length > 3 && tanggalSidang !== "" && (
            <Button
              type="button"
              onClick={async () => {
                let payload = {
                  ...md,
                  tanggalSidang,
                  nilai: JSON.stringify(resultCombine),
                };

                const x = {
                  metadata: JSON.stringify(payload),
                };
                const all = parseMetadata(x);
                const compressedData = compressData(all);

                try {
                  const res = await contract.methods
                    .createProduct(data?.id, JSON.stringify(compressedData))
                    .send({
                      from: user.accounts[0],
                    });

                  // Transaction Hash dari transaksi yang baru saja dikirim
                  if (
                    typeof res?.status === "bigint" &&
                    Number(res?.status) === 1
                  ) {
                    const {
                      transactionHash,
                      transactionIndex,
                      blockNumber,
                      blockHash,
                      from,
                      to,
                      cumulativeGasUsed,
                      gasUsed,
                    } = res;

                    // Mengonversi BigInt ke Number dengan aman
                    const transaction = {
                      transactionHash,
                      transactionIndex: safeBigIntToNumber(transactionIndex),
                      blockNumber: safeBigIntToNumber(blockNumber),
                      blockHash,
                      from,
                      to,
                      cumulativeGasUsed: safeBigIntToNumber(cumulativeGasUsed),
                      gasUsed: safeBigIntToNumber(gasUsed),
                    };
                    // const transaction = {
                    //   transactionHash:
                    //     "0x63fc61d0002aad8d195101d8f1bdfb9bd9211f7ab0d556ac1eeb444d2c537e51",
                    //   transactionIndex: 0,
                    //   blockNumber: 15,
                    //   blockHash:
                    //     "0x7abb161a5fe9c672ac2c9b732fefa8a3f9ef4a1f061ca282a298104abb168031",
                    //   from: "0x14bc8b0f5d88a2554a813282c420609333bcaf59",
                    //   to: "0x28c2d710f0dd94de4bb68664100d56ac2969d768",
                    //   cumulativeGasUsed: 620569,
                    //   gasUsed: 620569,
                    // };
                    let newPayload = {
                      ...md,
                      tanggalSidang,
                      nilai: JSON.stringify(resultCombine),
                      transaction,
                    };

                    const newMetadata = {
                      metadata: JSON.stringify(payload),
                    };
                    submit(
                      {
                        type: "sidang",
                        id: md?.id,
                        json: JSON.stringify(newPayload),
                      },
                      { method: "put", route: "relative", navigate: false },
                    );
                    console.log(transaction);
                  }
                } catch (error) {
                  console.warn(
                    "DEBUGPRINT[6]: app.$id.tsx:1295: error=",
                    error,
                  );
                }
              }}
            >
              Submit
            </Button>
          )}

          {/*{resultCombine?.length > 3 && tanggalSidang !== "" && (
            <Button type="submit">Submit</Button>
          )}*/}
        </Form>
      </DialogFooter>
    </DialogContent>
  );
};

const PlanRequest = ({ md }) => {
  //const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  //const navigate = useNavigate();
  const isSubmitting = navigation.state !== "idle";

  const [konsultasiPA, setKonsultasiPA] = React.useState(
    md.konsultasiPA
      ? new Date(md?.konsultasiPA).toLocaleDateString("en-CA")
      : "",
  );
  const [rancangKRS, setRancangKRS] = React.useState(md.rancangKRS ?? false);
  const [learningAgreement, setLearningAgreement] = React.useState(
    md.learningAgreement ?? false,
  );

  const navigate = useNavigate();

  return (
    <DialogContent className=" sm:max-w-[425px]">
      {isSubmitting && <SpinnerFull />}
      <DialogHeader>
        <DialogTitle>Pengajuan Magang ( konsultasi PA )</DialogTitle>
        <DialogDescription></DialogDescription>
      </DialogHeader>

      <Form
        method="PUT"
        className="space-y-3"
        onSubmit={() => {
          wait().then(() => navigate("/app"));
        }}
      >
        <div className="">
          <Label
            htmlFor="konsultasiPA"
            className="block text-xs sm:text-sm  font-medium text-gray-700"
          >
            Rencana konsultasi PA
          </Label>
          <Input
            onChange={(e) => setKonsultasiPA(e.target.value)}
            name="konsultasiPA"
            value={konsultasiPA}
            type="date"
            className="disabled:bg-gray-200 mt-1.5  px-4 py-2.5 w-full rounded-[10px] border border-gray-400 outline-none focus:ring-2 focus:border-blue-600 ring-blue-600 shadow-sm sm:text-sm"
          />
        </div>
        <fieldset>
          <legend className="sr-only">Checkboxes</legend>

          <div className="space-y-2">
            <Label
              htmlFor="Option1"
              className="flex cursor-pointer items-start gap-4 rounded-lg border border-gray-200 p-4 transition hover:bg-gray-50 has-[:checked]:bg-blue-50"
            >
              <div className="flex items-center">
                &#8203;
                <Input
                  checked={rancangKRS}
                  name="rancangKRS"
                  type="checkbox"
                  onChange={(e) => setRancangKRS(e.target.checked)}
                  className="size-4 rounded border-gray-300"
                  id="Option1"
                />
              </div>

              <div>
                <strong className="font-medium text-gray-900">
                  Rancang KRS
                </strong>

                <p className="mt-1 text-pretty text-sm text-gray-700">
                  Lorem ipsum dolor sit amet consectetur adipisicing elit.
                </p>
              </div>
            </Label>

            <Label
              htmlFor="Option2"
              className="flex cursor-pointer items-start gap-4 rounded-lg border border-gray-200 p-4 transition hover:bg-gray-50 has-[:checked]:bg-blue-50"
            >
              <div className="flex items-center">
                &#8203;
                <Input
                  checked={learningAgreement}
                  type="checkbox"
                  name="learningAgreement"
                  onChange={(e) => setLearningAgreement(e.target.checked)}
                  className="size-4 rounded border-gray-300"
                  id="Option2"
                />
              </div>

              <div>
                <strong className="font-medium text-gray-900">
                  Rancang Learning Agreement
                </strong>

                <p className="mt-1 text-pretty text-sm text-gray-700">
                  Lorem ipsum dolor sit amet consectetur.
                </p>
              </div>
            </Label>
          </div>
        </fieldset>
        <InputHidden md={md} />
        <DialogFooter>
          {konsultasiPA !== "" && learningAgreement && rancangKRS && (
            <Button type="submit">Submit</Button>
          )}
        </DialogFooter>
      </Form>
    </DialogContent>
  );
};

const ApproveRequest = ({ md }) => {
  const navigation = useNavigation();
  const isSubmitting = navigation.state !== "idle";
  const data = useActionData();
  const navigate = useNavigate();

  const [status, setStatus] = React.useState("");

  React.useEffect(() => {
    if (data?.ok && data?.message) {
      navigate("/app");
    }

    setStatus(md?.status && md?.status > 1 ? md.status.toString() : "");
  }, [data]);

  return (
    <DialogContent className=" sm:max-w-[425px]">
      {isSubmitting && <SpinnerFull />}
      <DialogHeader>
        <DialogTitle>Pengajuan Magang</DialogTitle>
        <DialogDescription>Form Pengajuan Magang</DialogDescription>
      </DialogHeader>
      <div className="">
        <Label
          htmlFor="jenisMagang"
          className="block text-xs sm:text-sm  font-medium text-gray-700"
        >
          Jenis Magang
        </Label>

        <Input
          defaultValue={md?.jenisMagang}
          placeholder="Jenis Magang"
          type="text"
          id="jenisMagang"
          disabled
          className="disabled:bg-gray-200 mt-1.5  px-4 py-2.5 w-full rounded-[10px] border border-gray-400 outline-none focus:ring-2 focus:border-blue-600 ring-blue-600 shadow-sm sm:text-sm"
        />
      </div>
      <div className="">
        <Label
          htmlFor="mataKuliah"
          className="block text-xs sm:text-sm  font-medium text-gray-700"
        >
          Mata Kuliah
        </Label>

        <Input
          id="mataKuliah"
          defaultValue={md?.mataKuliah}
          placeholder="Mata Kuliah"
          type="text"
          disabled
          className="disabled:bg-gray-200 mt-1.5  px-4 py-2.5 w-full rounded-[10px] border border-gray-400 outline-none focus:ring-2 focus:border-blue-600 ring-blue-600 shadow-sm sm:text-sm"
        />
      </div>
      <div className="items-center gap-2 mb-10">
        <Label htmlFor="status" className="text-left">
          Status
        </Label>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className=" w-full text-gray-700 outline-none mt-1 focus:ring-none ring-blue-600 border border-gray-400 rounded-[10px] h-11 ">
            <SelectValue placeholder="Pilih Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="2">Approve</SelectItem>
            <SelectItem value="3">Reject</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DialogFooter>
        <Form method="PUT" key="request_magang">
          <Input name="id" type="hidden" defaultValue={md?.id} />
          <Input name="status" type="hidden" defaultValue={status} />
          {status !== "" && <Button type="submit">Submit</Button>}
        </Form>
      </DialogFooter>
    </DialogContent>
  );
};

const InputHidden = ({ md }) => {
  return (
    <>
      {Object.entries(md).map(([key, value]) => {
        if (value) {
          return (
            <Input
              key={key}
              name={key}
              type="hidden"
              defaultValue={getValue(value)}
            />
          );
        }
      })}
    </>
  );
};
