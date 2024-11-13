import Web3 from "web3";
//import { JsonRpcProvider, Contract } from "ethers";
import abi from "../../scm.json";
import deployed_address from "../../scm_address.json";

export function contract() {
    const web3 = new Web3(new Web3.providers.HttpProvider(process.env.BLOCKHAIN_NETWORK))
    let contract = new web3.eth.Contract(abi, deployed_address);
    return contract
}

export function contractWithAddress(abi: any, deployed_address: any, network) {
    const web3 = new Web3(new Web3.providers.HttpProvider(network))
    let contract = new web3.eth.Contract(abi, deployed_address);
    return contract
}

export function contractEthWithAddress(abi, deployed_addres, network, JsonRpcProvider, Contract) {
    let provider = new JsonRpcProvider(network)
    const contract = new Contract(deployed_addres, abi, provider);
    return contract;
}

export async function ethEnabled() {
  if (window?.web3) {
    await window.ethereum.request({ method: "eth_requestAccounts" });
    window.web3 = new Web3(window.ethereum);
    return window.web3;
  }
  return false;
}

