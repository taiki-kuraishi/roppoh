import { useOidcClient } from "@roppoh/better-auth-query/query";
import { Avatar, AvatarFallback, AvatarImage } from "@roppoh/shadcn/components/ui/avatar";
import { Card, CardContent } from "@roppoh/shadcn/components/ui/card";
import { ArrowLeftRight, ArrowUpRight, Mail, User } from "lucide-react";
import { useQueryStates } from "nuqs";
import { useEffect } from "react";
import { useNavigate } from "react-router";

import { authClient } from "@/client/libs/better-auth";

import { ConsentBtns } from "./components/consent-buttons";
import { consentPageParams } from "./params";

export default function () {
  const navigate = useNavigate();
  const [params] = useQueryStates(consentPageParams);

  useEffect(() => {
    if (!params.client_id || !params.redirect_uri || !params.scope) {
      void navigate("/sign-in");
    }
  }, [params]);

  const { data: session } = authClient.useSession();
  const { data: client } = useOidcClient({ client_id: params.client_id });

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6 text-center">Authorize Application</h1>
      <div className="min-h-screen bg-black text-white flex flex-col">
        <div className="flex flex-col items-center justify-center max-w-2xl mx-auto px-4">
          <div className="flex items-center gap-8 mb-8">
            <div className="w-16 h-16 border rounded-full flex items-center justify-center">
              <svg
                width="60"
                height="45"
                viewBox="0 0 60 45"
                fill="none"
                className="w-5 h-5"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M0 0H15V15H30V30H15V45H0V30V15V0ZM45 30V15H30V0H45H60V15V30V45H45H30V30H45Z"
                  className="fill-black dark:fill-white"
                />
              </svg>
            </div>
            <ArrowLeftRight className="h-6 w-6" />
            <div className="w-16 h-16 rounded-full overflow-hidden">
              <Avatar className="hidden h-16 w-16 sm:flex ">
                <AvatarImage
                  src={session?.user?.image || "#"}
                  alt="Avatar"
                  className="object-cover"
                />
                <AvatarFallback>{session?.user?.name?.charAt(0)}</AvatarFallback>
              </Avatar>
            </div>
          </div>

          <h1 className="text-3xl font-semibold text-center mb-8">
            {client?.client_name} is requesting access to your Better Auth account
          </h1>

          <Card className="w-full bg-zinc-900 border-zinc-800 rounded-none">
            <CardContent className="p-6">
              <div className="flex items-center justify-between p-4 bg-zinc-800 rounded-lg mb-6">
                <div>
                  <div className="font-medium">{session?.user?.name}</div>
                  <div className="text-zinc-400">{session?.user?.email}</div>
                </div>
                <ArrowUpRight className="h-5 w-5 text-zinc-400" />
              </div>
              <div className="flex flex-col gap-1">
                <div className="text-lg mb-4">
                  Continuing will allow Sign in with {client?.client_name} to:
                </div>
                {params?.scope?.includes("profile") && (
                  <div className="flex items-center gap-3 text-zinc-300">
                    <User className="h-5 w-5" />
                    <span>Read your Better Auth user data.</span>
                  </div>
                )}

                {params?.scope?.includes("email") && (
                  <div className="flex items-center gap-3 text-zinc-300">
                    <Mail className="h-5 w-5" />
                    <span>Read your email address.</span>
                  </div>
                )}
              </div>
            </CardContent>
            <ConsentBtns />
          </Card>
        </div>
      </div>
    </div>
  );
}
