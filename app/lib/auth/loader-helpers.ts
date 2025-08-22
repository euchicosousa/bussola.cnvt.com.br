import { redirect } from "react-router";
import { createClient } from "~/lib/database/supabase";
import invariant from "tiny-invariant";

/**
 * Authenticates user and returns user data with Supabase client
 */
export async function authenticateUser(request: Request) {
  const { supabase } = createClient(request);
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw redirect("/login");
  }
  
  return { supabase, user };
}

/**
 * Gets user with permissions data (person and partners)
 */
export async function getUserWithPermissions(request: Request) {
  const { supabase, user } = await authenticateUser(request);
  
  const [
    { data: people },
    { data: partners }
  ] = await Promise.all([
    supabase
      .from("people")
      .select("*")
      .match({ user_id: user.id }),
    supabase
      .from("partners")
      .select("*")
      .is("archived", false)
      .contains("users_ids", [user.id])
      .order("title", { ascending: true })
  ]);

  invariant(people, "People data not found");
  invariant(partners, "Partners data not found");
  
  const person = people[0];
  invariant(person, "Person not found");

  return {
    supabase,
    person,
    people,
    partners
  };
}

/**
 * Gets actions for user with optional filters
 */
export async function getActionsForUser(
  supabase: any,
  person: Person,
  partners: Partner[],
  options: {
    partnersFilter?: string[];
    dateRange?: { start: string; end: string };
    stateFilter?: string;
    includeArchived?: boolean;
  } = {}
) {
  const {
    partnersFilter = partners.map(p => p.slug),
    includeArchived = false,
    dateRange,
    stateFilter
  } = options;

  let query = supabase
    .from("actions")
    .select("*")
    .is("archived", includeArchived ? null : false)
    .contains("responsibles", person?.admin ? [] : [person.user_id])
    .containedBy("partners", partnersFilter)
    .order("date", { ascending: true });

  if (dateRange) {
    query = query
      .gte("date", dateRange.start)
      .lte("date", dateRange.end);
  }

  if (stateFilter) {
    query = query.eq("state", stateFilter);
  }

  const { data: actions } = await query;
  
  return actions || [];
}