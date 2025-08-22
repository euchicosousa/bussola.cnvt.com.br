import { Link, useLoaderData, type MetaFunction } from "react-router";
import { type LoaderFunctionArgs } from "react-router";
import { Edit3Icon, ListIcon } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Avatar } from "~/lib/helpers";
import { createClient } from "~/lib/database/supabase";
import { Heading } from "~/components/common/forms/Headings";

export const config = { runtime: "edge" };

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { supabase } = await createClient(request);

  const { data: people } = await supabase
    .from("people")
    .select("*")
    .order("name", { ascending: true })
    .returns<Person[]>();

  return { people };
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

export default function AdminPartners() {
  const { people } = useLoaderData<typeof loader>();
  return (
    <div className="bg-background min-h-screen w-full py-8 lg:py-24">
      <div className="px-2 pb-8 md:px-8">
        <Heading className="text-center">Usuários</Heading>

        <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {people?.map((person: Person) => (
            <div
              className="bg-card flex flex-col gap-1 rounded-2xl p-4"
              key={person.id}
            >
              <div className="flex items-center gap-4">
                <Avatar
                  item={{
                    image: person.image,
                    short: person.initials!,
                  }}
                  size="lg"
                />
                <div className="text-left text-2xl leading-none font-medium tracking-tighter">
                  {`${person.name} ${person.surname}`}
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button asChild size={"sm"} variant={"ghost"}>
                  <Link
                    className="items-center gap-2"
                    to={`/dashboard/admin/user/${person.user_id}/actions`}
                  >
                    Ver Ações
                    <ListIcon className="size-4" />
                  </Link>
                </Button>
                <Button asChild size={"sm"} variant={"ghost"}>
                  <Link
                    className="items-center gap-2"
                    to={`/dashboard/admin/user/${person.user_id}`}
                  >
                    Editar
                    <Edit3Icon className="size-4" />
                  </Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
