import { format } from "date-fns";
import { type ActionFunctionArgs } from "react-router";
import { INTENTS, PRIORITIES, TIMES } from "~/lib/constants";
import { createClient } from "~/lib/database/supabase";

export const config = { runtime: "edge" };
const ACCESS_KEY = process.env.BUNNY_ACCESS_KEY;

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
      content_files: null,
      work_files: null,
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


    // Handle content_files
    if (values["content_files"] && values["content_files"] !== "null" && values["content_files"] !== "") {
      //@ts-ignore
      values["content_files"] = values["content_files"].toString().split(",").filter(Boolean);
    } else {
      //@ts-ignore
      values["content_files"] = null;
    }

    // Handle work_files
    if (values["work_files"] && values["work_files"] !== "null" && values["work_files"] !== "") {
      //@ts-ignore
      values["work_files"] = values["work_files"].toString().split(",").filter(Boolean);
    } else {
      //@ts-ignore
      values["work_files"] = null;
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
  } else if (intent === INTENTS.uploadFiles) {
    // File upload logic
    const files = formData.getAll("files") as File[];
    const filenames = String(formData.get("filenames")).split(",");
    const partner = formData.get("partner") as string;
    const actionId = formData.get("actionId") as string;

    // Security validations
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    const ALLOWED_TYPES = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
      "application/pdf",
      "text/plain",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileName = file.name || filenames[i] || `file_${i}`;

      if (file.size > MAX_FILE_SIZE) {
        return {
          error: `File ${fileName} is too large. Max size: 10MB`,
          success: false,
        };
      }

      // Get file extension for fallback validation
      const extension = fileName.toLowerCase().split(".").pop();
      const allowedExtensions = [
        "jpg",
        "jpeg",
        "png",
        "gif",
        "webp",
        "pdf",
        "txt",
        "doc",
        "docx",
      ];

      // Check MIME type or file extension
      const isValidType = file.type && ALLOWED_TYPES.includes(file.type);
      const isValidExtension =
        extension && allowedExtensions.includes(extension);

      if (!isValidType && !isValidExtension) {
        return {
          error: `File ${fileName} with type "${file.type || "unknown"}" and extension "${extension || "unknown"}" is not allowed`,
          success: false,
        };
      }
    }

    try {
      // Upload files to CDN
      const urls = await Promise.all(
        files.map(async (file, i) => {
          const fileName = file.name || filenames[i] || `file_${i}`;
          const arrayBuffer = await file.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);
          const fileUrl = `${partner}/${new Date().getFullYear()}/${
            new Date().getMonth() + 1
          }/${format(new Date(), "yyyy-MM-dd_hh-mm-ss")}_${i}${fileName.substring(fileName.lastIndexOf("."))}`;
          const url = `https://br.storage.bunnycdn.com/agencia-cnvt/${fileUrl}`;
          const downloadUrl = `https://agenciacnvt.b-cdn.net/${fileUrl}`;

          const response = await fetch(url, {
            method: "PUT",
            headers: {
              AccessKey: ACCESS_KEY!,
              "Content-Type": "application/octet-stream",
            },
            body: buffer,
          });

          return { downloadUrl, status: response.statusText };
        }),
      );

      const fileUrls = urls.map((url) => url.downloadUrl);

      // Save files to database
      const { data: updatedAction, error } = await supabase
        .from("actions")
        .update({ content_files: fileUrls })
        .eq("id", actionId)
        .select()
        .single();

      if (error) {
        console.error("Error updating action with files:", error);
        return {
          error: "Failed to save files to action",
          success: false,
        };
      }

      return {
        data: updatedAction,
        urls: fileUrls,
        success: true,
      };
    } catch (uploadError) {
      console.error("Upload error:", uploadError);
      return {
        error:
          uploadError instanceof Error ? uploadError.message : "Upload failed",
        success: false,
      };
    }
  }

  return {};
};
