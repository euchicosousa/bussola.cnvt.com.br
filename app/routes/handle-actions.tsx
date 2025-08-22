import { type ActionFunctionArgs } from "react-router";
import { INTENTS, PRIORITIES, TIMES } from "~/lib/constants";
import { createClient } from "~/lib/database/supabase";

export const config = { runtime: "edge" };

export const action = async ({ request }: ActionFunctionArgs) => {
  const { supabase } = createClient(request);

  const formData = await request.formData();
  let { intent, id, ids, ...values } = Object.fromEntries(formData.entries());

  if (id) id = id.toString();

  if (!intent) throw new Error("No intent was defined");

  if (intent === INTENTS.createAction) {
    const actionToInsert = {
      id: id.toString(),
      created_at: values["created_at"].toString(),
      updated_at: values["updated_at"].toString(),

      category: values["category"].toString(),
      state: values["state"].toString(),

      priority: PRIORITIES.medium,
      date: values["date"].toString(),
      instagram_date: values["instagram_date"].toString(),
      time:
        Number(values["time"]) || (TIMES as any)[values["category"].toString()],

      description: values["description"].toString(),
      title: values["title"].toString(),
      responsibles: values["responsibles"].toString().split(","),
      partners: values["partners"].toString().split(","),
      topics: values["topics"] ? values["topics"].toString().split(",") : null,
      user_id: values["user_id"].toString(),
      color: values["color"].toString(),
      instagram_caption: "",
    };

    const { data, error } = await supabase
      .from("actions")
      .insert(actionToInsert as any)
      .select()
      .single();
    if (error) console.log({ error });

    return { data, error };
  } else if (intent === INTENTS.updateActions) {
    if (ids) {
      if (values["responsibles"] && values["responsibles"] !== "null") {
        //@ts-ignore
        values["responsibles"] = values["responsibles"].toString().split(",");
      }

      const { data, error } = await supabase
        .from("actions")
        .update({ ...values } as any)
        .select()
        // @ts-ignore
        .in("id", ids.toString().split(","));

      if (error) console.log({ error });

      return { data, error };
    }
  } else if (intent === INTENTS.updateAction) {
    if (!id) throw new Error("No id was provided");

    // delete values.priority;
    // delete values.category;
    // delete values.state;
    // delete values.partner;
    // delete values.slug;
    delete values.topics;
    delete values.archived;

    if (values.color === "" || values.color === null) delete values.color;

    if (values["files"] !== "null") {
      //@ts-ignore
      values["files"] = values["files"].toString().split(",");
    } else {
      //@ts-ignore
      values["files"] = null;
    }
    if (values["responsibles"] !== "null") {
      //@ts-ignore
      values["responsibles"] = values["responsibles"].toString().split(",");
    }

    //@ts-ignore
    values["partners"] = values["partners"].toString().split(",");
    //@ts-ignore
    values["topics"] = values["topics"]
      ? values["topics"].toString().split(",")
      : null;

    const { data, error } = await supabase
      .from("actions")
      .update({
        ...values,
      } as any)
      .match({ id });

    if (error) console.log({ from: "UPDATE ACTION", error });

    return { data, error };
  } else if (intent === INTENTS.duplicateAction) {
    const { data: oldAction } = await supabase
      .from("actions")
      .select("*")
      .match({ id })
      .single();
    if (oldAction) {
      const newId = values["newId"].toString();
      const created_at = values["created_at"].toString();
      const updated_at = values["updated_at"].toString();
      const { data: newAction, error } = await supabase
        .from("actions")
        .insert({
          ...(oldAction as any),
          id: newId,
          created_at,
          updated_at,
        })
        .select()
        .single();

      return { newAction, error };
    }
  } else if (intent === INTENTS.deleteAction) {
    const data = await supabase
      .from("actions")
      .update({ archived: true } as any)
      .match({ id: id });

    return { data };
  } else if (intent === INTENTS.recoverAction) {
    const data = await supabase
      .from("actions")
      .update({ archived: false } as any)
      .match({ id: id });

    return { data };
  } else if (intent === INTENTS.destroyAction) {
    const data = await supabase.from("actions").delete().match({ id });

    return { data };
  } else if (intent === INTENTS.updatePerson) {
    if (!id) throw new Error("No id was provided");
    const { data, error } = await supabase
      .from("people")
      .update({
        ...values,
      } as any)
      .match({ id });

    if (error) console.log({ error });

    return { data, error };
  } else if (intent === INTENTS.updatePartner) {
    if (!id) throw new Error("No id was provided");

    if (values.users_ids) {
      //@ts-ignore
      values["users_ids"] = String(values["users_ids"]).split(",");
    }

    const { data, error } = await supabase
      .from("partners")
      .update({
        ...values,
      } as any)
      .match({ id });

    if (error) console.log({ error });

    return { data, error };
  } else if (intent === INTENTS.setSprint) {
    const sprint = {
      id: id.toString(),
      created_at: values["created_at"].toString(),
      action_id: values["action_id"].toString(),
      user_id: values["user_id"].toString(),
    };

    const { data, error } = await supabase
      .from("sprints")
      .insert({ ...sprint } as any)
      .select()
      .single();

    if (error) console.log({ error });

    return { data, error };
  } else if (intent === INTENTS.unsetSprint) {
    const sprint = {
      action_id: values["action_id"].toString(),
      user_id: values["user_id"].toString(),
    };

    const { data, error } = await supabase
      .from("sprints")
      .delete()
      .match(sprint)
      .select()
      .single();

    if (error) console.log({ error });

    return { data, error };
  } else if (intent === INTENTS.createTopic) {
    const topic = {
      partner_slug: values["partner_slug"].toString(),
      title: values["title"].toString(),
      color: values["color"].toString(),
      foreground: values["foreground"].toString(),
    };

    const { data, error } = await supabase
      .from("topics")
      .insert({ ...topic } as any)
      .select()
      .single();

    if (error) console.log({ error });

    return { data, error };
  }

  return {};
};
