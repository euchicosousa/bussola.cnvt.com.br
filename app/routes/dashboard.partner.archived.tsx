import { format } from "date-fns";
import {
  Link,
  type LoaderFunctionArgs,
  type MetaFunction,
  redirect,
  useLoaderData,
} from "react-router";
import { ActionsContainer } from "~/components/features/actions";
import { DATE_FORMAT, TIME_FORMAT } from "~/lib/constants";
import { createClient } from "~/lib/database/supabase";

export const config = { runtime: "edge" };

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const { supabase } = createClient(request);

  const partner_slug = params["partner"];

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/login");
  }

  const { data: person } = await supabase
    .from("people")
    .select("*")
    .eq("user_id", user.id)
    .single();

  const [{ data: actions }, { data: actionsChart }, { data: partner }] =
    await Promise.all([
      supabase
        .from("actions")
        .select("*")
        .is("archived", true)
        .like("partner", partner_slug || "%")
        .contains("responsibles", person?.admin ? [] : [user.id])
        .neq("state", "finished")
        .lte("date", format(new Date(), "yyyy-MM-dd HH:mm:ss"))
        .order("title", { ascending: true })
        .returns<Action[]>(),

      supabase
        .from("actions")
        .select("state, date")
        .is("archived", false)
        .like("partner", partner_slug || "%")
        .contains("responsibles", person?.admin ? [] : [user.id])
        .neq("state", "finished")
        .lte("date", format(new Date(), "yyyy-MM-dd HH:mm:ss"))
        .returns<{ state: string; date: string }[]>(),
      supabase
        .from("partners")
        .select()
        .eq("slug", params["partner"]!)
        .single(),
    ]);

  return { actions, actionsChart, partner };
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

export default function LatePage() {
  const { actions } = useLoaderData<typeof loader>();
  return (
    <div className="scrollbars">
      <div className="px-4 md:px-8">
        <h2 className="py-4 text-3xl font-bold tracking-tighter">
          <Link to={"/dashboard/admin/users"}>Ações em atraso</Link>
        </h2>
        <div className="mx-auto pb-32">
          <ActionsContainer
            actions={actions}
            dateDisplay={{ dateFormat: DATE_FORMAT.FULL, timeFormat: TIME_FORMAT.WITH_TIME }}
            orderBy="time"
            showCategory
          />
        </div>
      </div>
    </div>
  );
}
