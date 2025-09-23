import {
  addMonths,
  endOfDay,
  endOfMonth,
  endOfWeek,
  format,
  parseISO,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import {
  redirect,
  useLoaderData,
  useSearchParams,
  type LoaderFunctionArgs,
  type MetaFunction,
} from "react-router";
import invariant from "tiny-invariant";
import { createClient } from "~/lib/database";
import { sortActions } from "~/lib/helpers";
import { useIDsToRemoveSafe, usePendingDataSafe } from "~/lib/hooks";
import { TodayView } from "~/components/features/actions/views/TodayView";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { supabase } = createClient(request);

  // const result = await fetch("https://br.storage.bunnycdn.com/agencia-cnvt/", {
  //   method: "GET",
  //   headers: { AccessKey: ACCESS_KEY!, accept: "application/json" },
  // });
  // const folders = await result.json() as [];

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/login");
  }

  const [{ data: people }, { data: partners }] = await Promise.all([
    supabase.from("people").select("*").match({ user_id: user.id }),
    supabase.from("partners").select("slug").match({ archived: false }),
  ]);

  invariant(people);
  invariant(partners);

  const person = people[0];

  let start = startOfWeek(startOfMonth(new Date()));
  let end = endOfDay(endOfWeek(endOfMonth(addMonths(new Date(), 1))));

  const [{ data: actions }, { data: actionsChart }] = await Promise.all([
    supabase
      .from("actions")
      .select("*")
      .is("archived", false)
      .contains("responsibles", person.admin ? [] : [user.id])
      .containedBy("partners", partners.map((p) => p.slug)!)
      .gte("date", format(start, "yyyy-MM-dd HH:mm:ss"))
      .lte("date", format(end, "yyyy-MM-dd HH:mm:ss"))
      .order("title", { ascending: true }),
    supabase
      .from("actions")
      .select("id, category, state, date, partners, instagram_date")
      .is("archived", false)
      .contains("responsibles", person?.admin ? [] : [user.id])
      .containedBy("partners", partners.map((p) => p.slug)!)
      .gte("date", format(start, "yyyy-MM-dd HH:mm:ss"))
      .lte("date", format(end, "yyyy-MM-dd HH:mm:ss")),
  ]);

  return { actions, actionsChart };
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

export default function Day() {
  let { actions } = useLoaderData<typeof loader>();
  const [searchParams] = useSearchParams();
  const params = new URLSearchParams(searchParams);
  const date = params.get("date")
    ? parseISO(params.get("date") as string)
    : new Date();

  actions = actions || [];

  const { actions: pendingActions } = usePendingDataSafe();
  const { actions: deletingIDsActions } = useIDsToRemoveSafe();

  //Actions
  // Transform into a Map
  const actionsMap = new Map<string, Action>(
    actions.map((action) => [action.id, action]),
  );
  // Add pending Created/Updated Actions
  for (const action of pendingActions as Action[]) {
    actionsMap.set(action.id, action);
  }
  // Remove pending deleting Actions
  for (const id of deletingIDsActions) {
    actionsMap.delete(id);
  }
  // transform and sort
  actions = sortActions(Array.from(actionsMap, ([, v]) => v));

  return (
    <TodayView
      actions={actions as Action[]}
      className="px-2 py-4 md:px-8 lg:py-8"
      fullSize
      date={date}
    />
  );
}
