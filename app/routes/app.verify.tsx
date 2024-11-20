import type { LoaderArgs } from "@remix-run/node";
import { parseIfString } from "~/lib/utils";
import { cn } from "~/lib/utils";
import { decompressData } from "~/lib/misc";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { json } from "@remix-run/node";
import { useFetcher } from "@remix-run/react";
import {
  getSmartContract,
  getContractWithAddress,
} from "~/lib/contract.server";
import { getProductById } from "~/lib/contract.server";

const isValidTransactionHash = (transactionHash) => {
  const emptyHash =
    "0x0000000000000000000000000000000000000000000000000000000000000000";
  return transactionHash !== emptyHash;
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

export const loader = async ({ request }: LoaderArgs) => {
  const url = new URL(request.url);
  const id = url.searchParams.get("id");

  if (id) {
    const sc = await getSmartContract();
    const { abi, deployed_address, network } = sc;

    const contract = await getContractWithAddress(
      JSON.parse(abi),
      deployed_address,
      network,
    );

    const transactionHash = await contract.methods
      .getProductTransactionHash(id)
      .call();

    const verify = isValidTransactionHash(transactionHash);
    if (verify) {
      const _data = await getProductById(contract, id);
      const parserData = parseIfString(_data.metadata);
      const parseData = decompressData(parserData);
      const p = parseIfString(parseData);
      const m = {
        id: p?.id,
        name: p?.name,
        created_at: new Date(
          safeBigIntToNumber(_data?.created_at) * 1000,
        ).toISOString(),
        sertificateHash: _data?.transactionHash,
      };

      return json({ verify, ...m });
    }

    return json({ verify });
  }
  return json({ ok: false });
};

const formatDateID = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};
const isoDateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/;

const getMaxKeyLengthForLevel = (data: any) => {
  let maxLength = 0;
  for (const key in data) {
    if (typeof data[key] === "object" && data[key] !== null) {
      continue;
    }
    maxLength = Math.max(maxLength, key.length);
  }
  return maxLength;
};

const formatTomlManually = (data, indent = 0) => {
  let tomlString = "";
  const spaces = " ".repeat(indent);
  const maxKeyLength = getMaxKeyLengthForLevel(data);

  for (const key in data) {
    const value = data[key];
    const paddedKey = key.padEnd(maxKeyLength);

    if (typeof value === "string" && isoDateRegex.test(value)) {
      tomlString += `${spaces}<strong>${paddedKey}</strong> = ${formatDateID(value)}\n`;
    } else if (typeof value === "object" && value !== null) {
      tomlString += `\n${spaces}<strong>[${key}]</strong>\n${formatTomlManually(value, indent + 4)}`;
    } else {
      tomlString += `${spaces}<strong>${paddedKey}</strong> = ${JSON.stringify(value)}\n`;
    }
  }

  return tomlString;
};
function JsonView(data) {
  return (
    <pre
      className={cn(
        "my-1 overflow-scroll rounded-md border p-2 pb-4 text-xs leading-relaxed ",
        "bg-white",
        "whitespace-pre-wrap",
      )}
      dangerouslySetInnerHTML={{ __html: formatTomlManually(data) }}
    />
  );
}
const Route = () => {
  const fetcher = useFetcher();
  const result = fetcher.data;
  return (
    <div>
      <fetcher.Form className="flex flex-col items-center justify-center h-screen w-full ">
        <div className="grid gap-2 max-w-sm w-full">
          <h4>
            <h4 className="prose prose-indigo prose-lg mb-2 block text-center leading-8 font-extrabold tracking-tight text-gray-900">
              Validasi Sertificate Id
            </h4>
          </h4>
          <Label htmlFor="address">Sertificate Id</Label>
          <Input id="id" name="id" placeholder="sertificat id" />
          <Button type="submit" className="w-full">
            Verify
          </Button>
          {result && <JsonView data={result} />}
        </div>
      </fetcher.Form>
    </div>
  );
};

export default Route;
