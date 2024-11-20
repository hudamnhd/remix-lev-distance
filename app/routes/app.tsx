import type { MetaFunction, ActionFunctionArgs } from "@remix-run/node";
import Web3 from "web3";
import React from "react";
import {
  Outlet,
  useLoaderData,
  useMatches,
  useNavigate,
  ClientLoaderFunctionArgs,
  json,
} from "@remix-run/react";
import { getSmartContract } from "~/lib/contract.server";
import { contractEthWithAddress } from "~/lib/contract.client";
import { SpinnerFull } from "~/components/ui/loading";
import { Button } from "~/components/ui/button";
import { db } from "~/lib/db.server";

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

export const loader = async () => {
  const sc = await getSmartContract();

  return json({
    listPengajuan: await db.product.findMany(),
    sc,
  });
};

const getEthers = () =>
  import("ethers").then((Module) => {
    return Module;
  });

export async function clientLoader({
  serverLoader,
  params,
}: ClientLoaderFunctionArgs) {
  const productId = params?.id;
  const [serverData, clientData] = await Promise.all([
    serverLoader(),
    getEthers(),
  ]);
  const { sc } = serverData;
  const { abi, deployed_address, network } = sc;
  const { JsonRpcProvider, Contract } = clientData;

  const web3 = new Web3(window.ethereum);
  let contract = new web3.eth.Contract(JSON.parse(abi), deployed_address);

  const ethContract = contractEthWithAddress(
    abi,
    deployed_address,
    network,
    JsonRpcProvider,
    Contract,
  );

  let accounts = null;
  let register_status = null;
  let profile = null;
  let productById = null;

  if (productId) {
    productById = await contract.methods.getProductById(productId).call();
  }

  if (window.ethereum) {
    window.ethereum.on("accountsChanged", () => {
      window.location.reload();
    });
    try {
      accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      register_status = await contract.methods
        ?.is_registered(accounts[0])
        .call();

      profile = await contract.methods.profileInformation(accounts[0]).call();
    } catch (error) {
      console.error("User denied account access", error);
    }
  } else {
    console.log("MetaMask not detected");
  }

  const user = {
    accounts,
    register_status,
    profile,
  };

  return {
    ...serverData,
    contract,
    ethContract,
    user,
    productById,
  };
}

clientLoader.hydrate = true;

export function HydrateFallback() {
  return <SpinnerFull />;
}

export const meta: MetaFunction = () => {
  return [
    { title: "Smart Contract App" },
    { name: "description", content: "Smart Contract App by Riya Widayanti" },
  ];
};

export default function Index() {
  const { user } = useLoaderData<typeof loader>();
  const match = useMatches();
  const navigate = useNavigate();

  if (!user.accounts)
    return (
      <div className="grid h-screen place-content-center bg-white px-4">
        <h1 className="uppercase tracking-widest text-gray-500 text-center">
          Oops, there is an error!
        </h1>
        <button
          onClick={() => {
            window.location.reload();
          }}
          className="uppercase tracking-widest text-blue-500 font-medium text-center"
        >
          Try again?
        </button>
      </div>
    );

  if (!user.register_status && match[2]?.pathname !== "/app/register")
    return (
      <div className="h-svh">
        <div className="m-auto flex h-full w-full flex-col items-center justify-center gap-2">
          <h1 className="text-[7rem] font-bold leading-tight">401</h1>
          <span className="font-medium">
            Ups! Anda tidak memiliki izin untuk mengakses halaman ini.
          </span>
          <p className="text-center text-muted-foreground">
            Anda belum terdaftar dalam jaringan blockchain,
            <br />
            silahkan melakukan pendaftaran!
          </p>
          <div className="mt-6 flex gap-4">
            <Button variant="outline" onClick={() => navigate("/doc")}>
              Dokumentasi
            </Button>
            <Button onClick={() => navigate("/app/register")}>Daftar</Button>
          </div>
        </div>
      </div>
    );

  return <Outlet />;
}
