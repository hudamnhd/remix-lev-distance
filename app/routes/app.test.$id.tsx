import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  getSmartContract,
  getContractWithAddress,
} from "~/lib/contract.server";

export const loader = async ({ params }: LoaderArgs) => {
  const sc = await getSmartContract();
  const { abi, deployed_address, network } = sc;

  const contract = await getContractWithAddress(
    JSON.parse(abi),
    deployed_address,
    network,
  );

  const tx = await contract.methods.getProductTransactionHash(params.id).call();

  return json({ tx });
};
