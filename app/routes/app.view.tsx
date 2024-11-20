import { parseMetadata, compressData, decompressData } from "~/lib/misc";
import Swal from "sweetalert2";
import { parseIfString } from "~/lib/utils";
import { Debug } from "~/components/debug";
import { Button } from "~/components/ui/button";
import React from "react";
import {
  useMatches,
  useSubmit,
  useRevalidator,
  useLoaderData,
} from "@remix-run/react";
import { json } from "@remix-run/node";
import {
  getSmartContract,
  getContractWithAddress,
  getProducts,
} from "~/lib/contract.server";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";

function processData(data) {
  return data?.map((item) => {
    // Konversi BigInt ke number (pastikan aman dalam jangkauan Number)
    const createdAt = Number(item.created_at);

    // Jika konversi BigInt menjadi number terlalu besar, Anda bisa menggunakan alternatif lain, misalnya menggunakan Date
    const formattedCreatedAt = createdAt
      ? new Date(createdAt * 1000).toLocaleString()
      : null; // Mengonversi timestamp menjadi format tanggal yang bisa dibaca

    return {
      id: item.id,
      owner: item.owner,
      status: item.status,
      metadata: item.metadata,
      createdAt: formattedCreatedAt, // Menampilkan tanggal yang diformat
    };
  });
}

export const loader = async () => {
  const sc = await getSmartContract();
  const { abi, deployed_address, network } = sc;

  const contract = await getContractWithAddress(
    JSON.parse(abi),
    deployed_address,
    network,
  );

  const _data = await getProducts(contract);

  const data = processData(_data);

  return json({ data });
};

function Reloader() {
  const { ethContract } = useMatches()[1].data;
  const revalidator = useRevalidator();

  ethContract.on(
    "productTransaction",
    async (sender, product_id, status, note, timestamp) => {
      console.warn(
        "sender:",
        sender,
        "product_id",
        product_id,
        "status",
        status,
        "note",
        note,
        "timestamp",
        timestamp,
      );
      revalidator.revalidate();
    },
  );
  ethContract.on("registerAction", async (user, role, name, timestamp) => {
    console.warn(
      "user:",
      user,
      "role",
      role,
      "name",
      name,
      "timestamp",
      timestamp,
    );
    localStorage.removeItem("registeredAddresses");
    revalidator.revalidate();
  });

  return <div></div>;
}
export default function DashboardPage() {
  const { data } = useLoaderData<typeof loader>();
  const { listPengajuan, user, contract } = useMatches()[1].data;

  return (
    <React.Fragment>
      <Reloader />
      <div className="grid grid-cols-2">
        <UserPage />
        <DataPage />
      </div>
    </React.Fragment>
  );
}

import React, { useState, useEffect } from "react";

// Fungsi untuk memeriksa dan menyimpan data
async function checkAndStoreRegistrations(users, contract) {
  // Cek apakah data sudah ada di localStorage
  const registeredAddresses = localStorage.getItem("registeredAddresses");
  if (registeredAddresses) {
    // Jika sudah ada, ambil dari localStorage
    console.log(
      "Data sudah ada di localStorage. Tidak perlu memanggil contract.",
    );
    return JSON.parse(registeredAddresses); // Mengembalikan data yang sudah tersimpan
  }

  // Jika belum ada, lakukan pengecekan terhadap address
  const registered = [];
  const notRegistered = [];

  for (const user of users) {
    const address = user.address;

    try {
      // Memanggil kontrak untuk mengecek apakah address sudah terdaftar
      const isRegistered = await contract.methods.is_registered(address).call();

      // Jika sudah terdaftar, masukkan ke array registered
      if (isRegistered) {
        registered.push(user);
      } else {
        notRegistered.push(user);
      }
    } catch (error) {
      console.error(`Error mengecek address ${address}:`, error);
    }
  }

  // Menyimpan hasil ke localStorage untuk penggunaan selanjutnya
  localStorage.setItem(
    "registeredAddresses",
    JSON.stringify({ registered, notRegistered }),
  );

  // Mengembalikan daftar alamat yang sudah dan belum terdaftar
  return { registered, notRegistered };
}

function JsonView(data) {
  return (
    <pre className="text-xs hyphens-auto break-word whitespace-pre-wrap break-all text-md border border-gray-300 p-2 rounded-l max-h-[20vh] overflow-y-auto">
      {JSON.stringify(data, null, 2)}
    </pre>
  );
}

function UserPage() {
  const [registeredAddresses, setRegisteredAddresses] = useState([]);
  const [notRegisteredAddresses, setNotRegisteredAddresses] = useState([]);

  const { listPengajuan, contract, user } = useMatches()[1].data;

  const users = listPengajuan?.map((data, index) => {
    const meta = parseIfString(data?.metadata);
    const result = { id: data.id, ...meta };
    return result;
  });

  useEffect(() => {
    async function fetchRegistrationStatus() {
      const { registered, notRegistered } = await checkAndStoreRegistrations(
        users,
        contract,
      );

      // Set state dengan hasil yang sudah didapat
      setRegisteredAddresses(registered);
      setNotRegisteredAddresses(notRegistered);
    }

    fetchRegistrationStatus();
  }, []);

  const isRegisteredAddresses = registeredAddresses
    .sort((a, b) =>
      a?.name?.localeCompare(b?.name, undefined, {
        numeric: true,
        sensitivity: "base",
      }),
    )
    .sort((a, b) => b.isMatch - a.isMatch);

  const isNotRegisteredAddresses = notRegisteredAddresses
    .sort((a, b) =>
      a?.name?.localeCompare(b?.name, undefined, {
        numeric: true,
        sensitivity: "base",
      }),
    )
    .sort((a, b) => b.isMatch - a.isMatch);

  return (
    <div className="prose lg:prose-md m-5">
      <h1>Status Registrasi Pengguna</h1>

      <Accordion type="single" collapsible className="w-fit">
        <AccordionItem value="item-1">
          <AccordionTrigger className="font-semibold flex items-center gap-x-5">
            Alamat yang Sudah Terdaftar {registeredAddresses?.length}
          </AccordionTrigger>
          <AccordionContent>
            <ul className="prose">
              {isRegisteredAddresses?.length > 0 ? (
                isRegisteredAddresses?.map((d, index) => (
                  <li key={index}>
                    <strong>{d.name}</strong>-{d.address}
                  </li>
                ))
              ) : (
                <li>Tidak ada alamat yang terdaftar.</li>
              )}
            </ul>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <h2>Alamat yang Belum Terdaftar {notRegisteredAddresses?.length}</h2>
      <ul className="list-decimal marker:text-primary max-h-screen overflow-y-auto pr-3">
        {isNotRegisteredAddresses?.length > 0 ? (
          isNotRegisteredAddresses?.map((d, index) => {
            const data = {
              address: d.address,
              name: d.name,
              role: "Mahasiswa",
            };
            return (
              <li key={index} className="border border-gray-500 rounded-md p-3">
                <strong>{d.name}</strong>-{d.address}
                <h4>Data yang di simpan ke database blockchain</h4>
                <JsonView data={data} />
                <Button
                  onClick={async (e) => {
                    try {
                      await contract.methods
                        .registerFor(
                          d.address, // Alamat pengguna yang akan didaftarkan
                          d.name, // Nama pengguna
                          "Mahasiswa", // Peran pengguna
                        )
                        .send({
                          from: user.accounts[0],
                          // gas: "800000",
                        });

                      Swal.fire({
                        icon: "success",
                        title: "success register user",
                        showConfirmButton: false,
                        timer: 500,
                      });
                      localStorage.removeItem("registeredAddresses");
                      window.location.reload();
                    } catch (error: any) {
                      console.log(error);
                      return Swal.fire({
                        icon: "error",
                        title: error,
                      });
                    }
                  }}
                >
                  Register
                </Button>
              </li>
            );
          })
        ) : (
          <li>Semua alamat sudah terdaftar.</li>
        )}
      </ul>
    </div>
  );
}

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

function DataPage() {
  const { listPengajuan, contract, user } = useMatches()[1].data;
  const submit = useSubmit();
  const { data } = useLoaderData<typeof loader>();

  const dataUploaded = listPengajuan
    .map((x) => data.find((item) => item.id === x.id)) // Temukan elemen yang cocok
    .filter((found) => found !== undefined); // Saring elemen yang ditemukan

  const dataNotUploaded = listPengajuan.filter(
    (x) => !data.some((item) => item.id === x.id),
  );

  return (
    <div className="prose lg:prose-md m-5">
      <h1>Data Table Mahasiswa</h1>

      <Accordion type="single" collapsible className="w-fit">
        <AccordionItem value="item-1">
          <AccordionTrigger className="font-semibold flex items-center gap-x-5">
            Data yang Sudah Terupload {dataUploaded?.length}
          </AccordionTrigger>
          <AccordionContent>
            <ul className="prose">
              {dataUploaded?.length > 0 ? (
                dataUploaded?.map((x, index) => {
                  const all = parseIfString(x.metadata);
                  const decompressedData = decompressData(all);
                  return (
                    <li key={index}>
                      <strong>{decompressedData?.name}</strong>-
                      {decompressedData?.mataKuliah}{" "}
                    </li>
                  );
                })
              ) : (
                <li>Semua data sudah terupload.</li>
              )}
            </ul>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <h2>Data yang Belum Terupload {dataNotUploaded?.length}</h2>

      <Button
        onClick={async () => {
          const res = await contract.methods
            .updateProduct(
              "7ce54eb8-e5ee-4f5b-bf6e-9c00441b60ae",
              "MENGUBAH LAGI TEST",
              "UPDATED",
            )
            .send({
              from: user.accounts[0],
            });

          // Transaction Hash dari transaksi yang baru saja dikirim
          if (typeof res?.status === "bigint" && Number(res?.status) === 1) {
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

            console.log("UPDATED", transaction);
          }
        }}
      >
        Upload
      </Button>
      <ul className="list-decimal marker:text-primary max-h-screen overflow-y-auto pr-3">
        {dataNotUploaded?.length > 0 ? (
          dataNotUploaded?.map((x, index) => {
            const all = parseMetadata(x);
            const compressedData = compressData(all);
            const decompressedData = decompressData(compressedData);
            return (
              <li key={index} className="border border-gray-500 rounded-md p-3">
                <strong>{all?.name}</strong>-{all?.mataKuliah}{" "}
                <div className="grid items-center">
                  <h4>Data yang di simpan ke database mysql</h4>
                  <JsonView data={decompressedData} />
                  <a href={`/app/detail/${all.id}`}>view</a>
                  <h4>Data yang di simpan ke database blockchain</h4>
                  <JsonView data={compressedData} />
                </div>
                <Button
                  onClick={async () => {
                    const res = await contract.methods
                      .createProduct(all.id, JSON.stringify(compressedData))
                      .send({
                        from: user.accounts[0],
                      });

                    // Transaction Hash dari transaksi yang baru saja dikirim
                    console.warn("DEBUGPRINT[9]: app.view.tsx:420: res=", res);
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
                        cumulativeGasUsed:
                          safeBigIntToNumber(cumulativeGasUsed),
                        gasUsed: safeBigIntToNumber(gasUsed),
                      };

                      let newPayload = {
                        ...all,
                        transaction,
                      };

                      submit(
                        {
                          type: "sidang",
                          id: all?.id,
                          json: JSON.stringify(newPayload),
                        },
                        {
                          method: "post",
                          action: `/app/${all?.id}`,
                          navigate: false,
                        },
                      );
                      console.log(transaction);
                      console.log(transaction);
                    }

                    // Tunggu transaksi diproses (confirmations)
                    // const txReceipt = await txResponse.wait();
                    // console.log(
                    //   "Transaction was mined in block:",
                    //   txReceipt.blockNumber,
                    // );
                  }}
                >
                  Upload
                </Button>
              </li>
            );
          })
        ) : (
          <li>Semua data sudah terupload.</li>
        )}
      </ul>
    </div>
  );
}
