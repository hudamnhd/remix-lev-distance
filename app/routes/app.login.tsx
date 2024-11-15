import { Button } from "~/components/ui/button";
import { Spinner } from "~/components/ui/loading";
import React from "react";
import { useMatches } from "@remix-run/react";
import Swal from "sweetalert2";

export default function RegisterAccount() {
  const { contract, user } = useMatches()[1].data;

  if (user?.login_status) {
    return location.replace("/app");
  }

  if (user?.register_status) {
    return location.replace("/app/register");
  }

  const [loading, setLoading] = React.useState(false);

  return (
    <>
      <div className="container relative hidden h-screen flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
        <div className="relative hidden h-full flex-col bg-muted p-10 text-white dark:border-r lg:flex">
          <div className="absolute inset-0 bg-[url(https://images.unsplash.com/photo-1529236183275-4fdcf2bc987e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1467&q=80)]" />
          <div className="relative z-20 mt-auto">
            <blockquote className="space-y-2">
              <footer className="text-sm bg-slate-50/50 w-fit text-black p-1.5 rounded-md font-semibold">
                Riya Widayanti
              </footer>
            </blockquote>
          </div>
        </div>
        <div className="lg:p-8">
          <div className="mx-auto flex w-full flex-col justify-center space-y-4 sm:w-[350px]">
            <div className="flex flex-col space-y-2 text-center">
              <h1 className="text-2xl font-semibold tracking-tight">
                Login account
              </h1>
              <p className="text-sm text-muted-foreground">Klik login</p>
            </div>

            <Button
              type="button"
              onClick={async (e) => {
                e.preventDefault();

                try {
                  setLoading(true);
                  await contract.methods.login().send({
                    from: user.accounts[0],
                  });

                  return location.replace("/app");
                } catch (error: any) {
                  console.log(error);
                  setLoading(false);
                  return Swal.fire({
                    icon: "error",
                    title: error,
                  });
                }
              }}
              disabled={loading}
            >
              {loading && <Spinner />} Login
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
