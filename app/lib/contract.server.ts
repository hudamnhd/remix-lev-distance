import deployed_address from "../../scm_address.json";
import abi from "../../scm.json";
import Web3 from "web3";

export const getSmartContract = async () => {
  return {
    abi: JSON.stringify(abi),
    deployed_address: deployed_address?.toString(),
    network: process.env.BLOCKHAIN_NETWORK,
  };
};

export const getContractWithAddress = async (abi: any, deployed_address: any, network) => {
    const web3 = new Web3(new Web3.providers.HttpProvider(network))
    let contract = new web3.eth.Contract(abi, deployed_address);
    return contract
}

export const getProducts = async (contract) => {
  return contract.methods.getAllProducts().call();
};

export const getProductById = async (contract, id) => {
  return contract.methods.getProductById(id).call();
};

