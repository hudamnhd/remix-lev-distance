import type { MetaFunction } from "@remix-run/node";
import {
  Outlet,
  useLoaderData,
  Link,
  useMatches,
  useNavigate,
  ClientLoaderFunctionArgs,
  json,
} from "@remix-run/react";
import { getSmartContract } from "~/lib/contract.server";
import {
  contractWithAddress,
  contractEthWithAddress,
} from "~/lib/contract.client";
import { SpinnerFull } from "~/components/ui/loading";
import { Button } from "~/components/ui/button";
import { db } from "~/lib/db.server";

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

  const contract = contractWithAddress(
    JSON.parse(abi),
    deployed_address,
    network,
  );

  const ethContract = contractEthWithAddress(
    abi,
    deployed_address,
    network,
    JsonRpcProvider,
    Contract,
  );

  let accounts = null;
  let login_status = null;
  let register_status = null;
  let profile = null;
  let productById = null;

  if (productId) {
    productById = await contract.methods.getProductById(productId).call();
  }

  if (window.ethereum) {
    try {
      accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      register_status = await contract?.methods
        ?.checkRegisterStatus(accounts[0])
        .call();

      login_status = await contract.methods
        .checkLoginStatus(accounts[0])
        .call();

      if (login_status) {
        profile = await contract.methods.profileInformation(accounts[0]).call();
      }
    } catch (error) {
      console.error("User denied account access", error);
    }
  } else {
    console.log("MetaMask not detected");
  }

  const user = {
    accounts,
    login_status,
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
            Oops! You don't have permission to access this page.
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

        {/*<div className="grid h-screen place-content-center bg-white px-4">
        <h1 className="uppercase tracking-widest text-gray-500 text-center">
          Anda belum terdaftar dalam jaringan blockchain,
          <span className="block"> silahkan melakukan pendaftaran!</span>
        </h1>
        <Link
          to="/app/register"
          className="uppercase tracking-widest text-blue-500 font-bold text-center"
        >
          Daftar
        </Link>
        <Link
          to="/doc"
          className="uppercase tracking-widest text-blue-500 font-bold text-center"
        >
          Dokumentasi
        </Link>
      </div>*/}
      </div>
    );

  return <Outlet />;
}
