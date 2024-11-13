import { redirect } from "@remix-run/node"; // or cloudflare/deno

export const loader = async () => {
	return redirect("/app");
};
