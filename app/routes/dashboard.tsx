import {
  type LoaderFunctionArgs,
  Outlet,
  redirect,
  useOutletContext,
} from "react-router";
import Layout from "~/components/Layout";
import { createClient } from "~/lib/supabase";

export const config = { runtime: "edge" };

export async function loader({ request }: LoaderFunctionArgs) {
  const { supabase } = createClient(request);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/login");
  }

  const [
    { data: partners },
    { data: people },
    { data: categories },
    { data: states },
    { data: priorities },
    { data: areas },
    { data: sprints },
    { data: celebrations },
    { data: configs },
    { data: topics },
  ] = await Promise.all([
    supabase
      .from("partners")
      .select("*")
      .is("archived", false)
      .contains("users_ids", [user.id])
      .order("title", { ascending: true })
      .returns<Partner[]>(),
    supabase
      .from("people")
      .select("*")
      .match({ visible: true })
      .order("name", { ascending: true })
      .returns<Person[]>(),
    supabase
      .from("categories")
      .select("*")
      .order("order", { ascending: true })
      .returns<Category[]>(),
    supabase
      .from("states")
      .select("*")
      .order("order", { ascending: true })
      .returns<State[]>(),
    supabase
      .from("priorities")
      .select("*")
      .order("order", { ascending: true })
      .returns<Priority[]>(),
    supabase
      .from("areas")
      .select("*")
      .order("order", { ascending: true })
      .returns<Area[]>(),
    supabase
      .from("sprints")
      .select("*")
      .match({ user_id: user.id })
      .returns<Sprint[]>(),
    supabase.from("celebrations").select("*").returns<Celebration[]>(),
    supabase
      .from("config")
      .select("*")
      .match({ user_id: user.id })
      .returns<Config[]>(),
    supabase.from("topics").select("*").returns<Topic[]>(),
  ]);

  const config = configs?.[0] || {
    id: 1,
    created_at: new Date().toISOString(),
    creative: user.id,
    theme: "light",
    user_id: user.id,
  };

  const person = people?.find((person) => person.user_id === user.id) as Person;
  const url = new URL(request.url);

  return {
    url,
    partners,
    people,
    categories,
    user,
    states,
    priorities,
    person,
    areas,
    sprints,
    celebrations,
    config,
    topics,
  } as DashboardRootType;
}

export default function Dashboard() {
  const {
    setShowFeed,

    showFeed,
    isTransitioning,
    setTransitioning,
    stateFilter,
    setStateFilter,
  } = useOutletContext() as ContextType;

  return (
    <Layout>
      <Outlet
        context={{
          setShowFeed,
          showFeed,
          isTransitioning,
          setTransitioning,
          stateFilter,
          setStateFilter,
        }}
      />
    </Layout>
  );
}
