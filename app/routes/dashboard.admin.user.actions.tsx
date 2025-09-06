import { CheckCircleIcon } from "lucide-react";
import { useState } from "react";
import {
  Link,
  redirect,
  useLoaderData,
  type LoaderFunctionArgs,
  type MetaFunction,
} from "react-router";
import invariant from "tiny-invariant";
import { ActionsContainer } from "~/components/features/actions";
import { Heading } from "~/components/common/forms/Headings";
import { Button } from "~/components/ui/button";
import { Avatar } from "~/lib/helpers";
import { createClient } from "~/lib/database/supabase";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const { supabase } = await createClient(request);

  const id = params["id"];

  invariant(id);
  const [{ data: people }, { data: partners }] = await Promise.all([
    supabase
      .from("people")
      .select("*")
      .match({ user_id: id })
      .returns<Person[]>(),
    supabase
      .from("partners")
      .select("slug")
      .match({ archived: false })
      .returns<{ slug: string }[]>(),
  ]);

  const person = people?.[0];

  invariant(person);
  invariant(partners);

  const { data: actions } = await supabase
    .from("actions")
    .select("*")
    .is("archived", false)
    .contains("responsibles", [id])
    .order("date", { ascending: true })
    .containedBy("partners", partners.map((p) => p.slug)!)
    .returns<Action[]>();

  if (!person) throw redirect("/dashboard/admin/users");

  return { person, actions };
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
  const { person, actions } = useLoaderData<typeof loader>();
  const [viewFinished, setViewFinished] = useState(false);

  return (
    <div className="scrollbars-v px-2 py-8 md:px-8 lg:py-24">
      <div className="container mx-auto">
        <Heading className="text-center">
          <Link to={"/dashboard/admin/users"}>Ações do usuário</Link>
        </Heading>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 py-4" key={person.id}>
            <Avatar
              item={{
                image: person.image,
                short: person.initials!,
              }}
              size="lg"
            />
            <div className="text-2xl font-bold tracking-tighter">
              Ações de {`${person.name} ${person.surname}`}
            </div>
          </div>
          <div>
            <Button
              variant={viewFinished ? "secondary" : "ghost"}
              onClick={() => {
                setViewFinished(!viewFinished);
              }}
              title="Filtre entre todas as ações ou apenas as que não foram finalizadas."
            >
              <span className="hidden lg:block">Mostrar ações concluídas</span>
              <span className="lg:hidden">
                <CheckCircleIcon className="size-4" />
              </span>
            </Button>
          </div>
        </div>
        {/* <div className="flex flex-col gap-2">
          {actions
            ?.filter((action) =>
              viewFinished ? true : action.state !== "finished",
            )
            .map((action) => <ActionLine action={action} key={action.id} />)}
        </div> */}

        <ActionsContainer
          actions={actions?.filter((action) =>
            viewFinished ? true : action.state !== "finished",
          )}
          long
          orderBy="time"
          showCategory
          showPartner
          date={{ dateFormat: 2, timeFormat: 1 }}
        />
      </div>
    </div>
  );
}
