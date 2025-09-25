import {
  AlertCircleIcon,
  EyeIcon,
  EyeOffIcon,
  LogInIcon,
  ViewIcon,
} from "lucide-react";
import { useState } from "react";
import {
  redirect,
  useActionData,
  type ActionFunctionArgs,
  type MetaFunction,
} from "react-router";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { createClient } from "~/lib/database/supabase";
import { Bussola } from "~/lib/helpers";

export const config = { runtime: "edge" };

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const { supabase, headers } = await createClient(request);

  const {
    data: { user },
  } = await supabase.auth.signInWithPassword({ email, password });

  if (user) {
    return redirect("/dashboard", { headers });
  } else {
    return { errors: { email: "Verifique o email ou a senha usada." } };
  }
};

export const meta: MetaFunction = () => {
  return [
    { title: "ʙússoʟa - Domine, Crie e Conquiste." },
    {
      name: "description",
      content:
        "Aplicativo de Gestão de Projetos Criado e Mantido pela Agência CNVT®. ",
    },
  ];
};

const Login = () => {
  const actionData = useActionData<typeof action>();
  const [showPassword, setShowPassword] = useState(false);
  return (
    <div className="grid min-h-dvh grid-cols-[2rem_20rem_2rem] justify-center overflow-x-hidden md:grid-cols-[2rem_30rem_2rem]">
      <div className="border-r"></div>
      <div className="flex flex-col justify-center">
        <div className="bg-popover before:bg-border after:bg-border relative p-8 before:absolute before:top-0 before:-left-[100vw] before:h-px before:w-[200vw] after:absolute after:bottom-0 after:-left-[100vw] after:h-px after:w-[200vw] dark:after:bg-white/10">
          <div className="mb-8 flex">
            <Bussola />
          </div>
          {actionData && (
            <div className="my-8 flex items-center gap-4 rounded-lg bg-rose-600 p-4 leading-none text-rose-50">
              <AlertCircleIcon className="size-10" />
              <div>{actionData.errors.email}</div>
            </div>
          )}

          <form method="post">
            <div className="mb-4">
              <span className="mb-2 block w-full font-medium">E-mail</span>
              <Input type="email" name="email" className="border" />
            </div>

            <div className="relative mb-4">
              <span className="mb-2 block w-full font-medium">Senha</span>
              <Input
                type={showPassword ? "text" : "password"}
                name="password"
                className="border pr-12"
              />
              <Button
                size={"icon"}
                className="absolute top-8 right-0"
                variant={"ghost"}
                onClick={(event) => {
                  event.preventDefault();
                  setShowPassword(!showPassword);
                }}
              >
                {showPassword ? <EyeIcon /> : <EyeOffIcon />}
              </Button>
            </div>

            <div className="flex justify-end">
              <Button type="submit">
                Fazer Login <LogInIcon className="ml-2 size-3" />
              </Button>
            </div>
          </form>
        </div>
      </div>
      <div className="border-l"></div>
    </div>
  );
};

export default Login;
