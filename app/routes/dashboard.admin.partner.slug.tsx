/* eslint-disable jsx-a11y/no-autofocus */
import {
  Link,
  redirect,
  useFetcher,
  useLoaderData,
  useMatches,
  useNavigation,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
  type MetaFunction,
} from "react-router";
// @ts-ignore
import Color from "color";
import { PlusIcon, SaveIcon, TrashIcon } from "lucide-react";
import { useEffect, useState } from "react";
import invariant from "tiny-invariant";
import ColorPicker from "~/components/common/forms/ColorPicker";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import { Textarea } from "~/components/ui/textarea";
import { createClient } from "~/lib/database/supabase";
import { Avatar } from "~/lib/helpers";

export const config = { runtime: "edge" };

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const { supabase } = await createClient(request);

  const slug = params["slug"];

  invariant(slug);

  const [{ data: partner }, { data: topics }] = await Promise.all([
    supabase.from("partners").select("*").match({ slug }).single(),
    supabase.from("topics").select().match({ partner_slug: slug }),
  ]);

  if (!partner) throw redirect("/dashboard/admin/partners");

  return { partner, topics };
};

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return [
    { title: data?.partner?.title.concat(" - aᴅᴍɪɴ - ʙússoʟa") },
    {
      name: "description",
      content:
        "Aplicativo de Gestão de Projetos Criado e Mantido pela Agência CNVT®. ",
    },
  ];
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { supabase } = createClient(request);

  const formData = await request.formData();
  const id = String(formData.get("id"));

  const dataPartner = {
    title: String(formData.get("title")),
    short: String(formData.get("short")),
    slug: String(formData.get("slug")),
    colors: String(formData.getAll("colors_partner")).split(","),
    context: String(formData.get("context")),
    sow: formData.get("sow") as "marketing" | "socialmedia" | "demand",
    users_ids: String(formData.getAll("users_ids")).split(","),
  } as any;

  // Parse topics from JSON string
  const topicsData = formData.get("topics");
  const currentTopics = topicsData ? JSON.parse(String(topicsData)) : [];

  const { error: errorPartner } = await supabase
    .from("partners")
    .update(dataPartner)
    .match({ id: id });

  // Process topics - delete existing and insert new ones
  if (currentTopics.length > 0) {
    // First delete existing topics for this partner
    await supabase
      .from("topics")
      .delete()
      .match({ partner_slug: dataPartner.slug });

    // Then insert the new topics
    const topicsToInsert = currentTopics.map((topic: any) => ({
      partner_slug: dataPartner.slug,
      title: topic.title,
      color: topic.color,
      foreground: topic.foreground,
    }));

    const { error: errorTopics } = await supabase
      .from("topics")
      .insert(topicsToInsert);

    if (errorTopics) {
      throw new Error(errorTopics.message);
    }
  }

  if (errorPartner) {
    throw new Error(errorPartner.message);
  } else {
    return { ok: true };
  }
};

export default function AdminPartners() {
  const matches = useMatches();
  const fetcher = useFetcher();

  const { partner, topics } = useLoaderData<typeof loader>();
  const { people } = matches[1].data as DashboardRootType;

  const [colors, setColors] = useState<string[]>(partner.colors);
  const [currentTopics, setTopics] = useState<Topic[]>(topics || []);
  const [currentPartner, setPartner] = useState(partner);

  const isLoading =
    useNavigation().state !== "idle" || fetcher.state !== "idle";

  useEffect(() => {
    setPartner({ ...currentPartner, colors });
  }, [colors]);

  useEffect(() => {
    const topicTitles =
      document.querySelectorAll<HTMLInputElement>(".topic-title")!;

    if (topicTitles.length > 0) topicTitles[topicTitles.length - 1].focus();
  }, [currentTopics]);

  return (
    <div className="scrollbars-v px-4 md:px-8 lg:px-8">
      <div className="mx-auto max-w-xl">
        {/* Header */}
        <div
          className="flex items-center gap-2 py-4 font-bold tracking-tighter"
          key={currentPartner.slug}
        >
          <Avatar
            item={{
              short: currentPartner.short,
              bg: currentPartner.colors[0],
              fg: currentPartner.colors[1],
            }}
            size="lg"
          />
          <Link to={`/dashboard/${currentPartner.slug}`} className="text-2xl">
            {currentPartner.title}
          </Link>
        </div>

        <input type="hidden" value={currentPartner.id} name="id" />
        {/* Title */}
        <div className="mb-4">
          <Label className="mb-2 block">Nome</Label>
          <Input
            defaultValue={currentPartner.title}
            name="title"
            type="text"
            tabIndex={0}
            autoFocus
            onChange={(e) =>
              setPartner({ ...currentPartner, title: e.target.value })
            }
          />
        </div>
        {/* Slug e Short */}
        <div className="gap-2 md:flex">
          {/* Slug */}
          <div className="mb-4 w-full">
            <Label className="mb-2 block">Slug</Label>
            <Input
              defaultValue={currentPartner.slug}
              name="slug"
              onChange={(e) =>
                setPartner({ ...currentPartner, slug: e.target.value })
              }
            />
          </div>
          {/* Short */}
          <div className="mb-4 w-full">
            <Label className="mb-2 block">Short</Label>
            <Input
              defaultValue={currentPartner.short}
              name="short"
              onChange={(e) =>
                setPartner({ ...currentPartner, short: e.target.value })
              }
            />
          </div>
        </div>
        {/* Context */}
        <div className="mb-4">
          <Label className="mb-2 block">Contexto</Label>
          <Textarea
            name="context"
            defaultValue={currentPartner.context || ""}
            onChange={(e) =>
              setPartner({ ...currentPartner, context: e.target.value })
            }
            // @ts-ignore
            style={{ fieldSizing: "content" }}
          />
        </div>
        {/* SOW */}
        <div className="mb-8">
          <Label className="mb-2 block">Serviço Contratado</Label>
          <RadioGroup
            name="sow"
            defaultValue={partner.sow.toString()}
            onValueChange={(value) =>
              setPartner({ ...currentPartner, sow: value as Sow })
            }
          >
            {[
              {
                value: "marketing",
                title: "Consultoria de Marketing 360",
              },
              {
                value: "socialmedia",
                title: "Gestão de Redes Sociais",
              },
              {
                value: "demand",
                title: "Serviços avulsos",
              },
            ].map((p) => (
              <div className="flex items-center gap-2" key={p.value}>
                <RadioGroupItem value={p.value} id={`radio_${p.value}`} />
                <Label htmlFor={`radio_${p.value}`}>{p.title}</Label>
              </div>
            ))}
          </RadioGroup>
        </div>
        {/* Usuários */}
        <div className="mb-4">
          <Label className="mb-2 block">Usuários</Label>
          <div className="flex items-center gap-4">
            {people.map((person) => (
              <label
                key={person.id}
                className={`relative mb-2 flex items-center`}
              >
                <input
                  type="checkbox"
                  value={person.user_id}
                  name="users_ids"
                  className={`peer absolute opacity-0`}
                  defaultChecked={
                    currentPartner.users_ids?.find(
                      (user_id: string) => person.user_id === user_id,
                    )
                      ? true
                      : false
                  }
                  onChange={(e) => {
                    if (e.target.checked) {
                      setPartner({
                        ...currentPartner,
                        users_ids: [
                          ...currentPartner.users_ids,
                          e.target.value,
                        ],
                      });
                    } else {
                      setPartner({
                        ...currentPartner,
                        users_ids: currentPartner.users_ids.filter(
                          (user_id: string) => user_id !== e.target.value,
                        ),
                      });
                    }
                  }}
                />
                <div
                  className={`ring-ring ring-offset-background rounded-full ring-offset-2 peer-checked:ring-2`}
                >
                  <Avatar
                    item={{
                      image: person.image,
                      short: person.initials!,
                    }}
                    size="lg"
                  />
                </div>
              </label>
            ))}
          </div>
        </div>
        {/* Cores */}
        <div className="mb-4 gap-2 md:flex">
          <div className="mb-4 w-full">
            <Label className="mb-2 block">Cores</Label>
            <div className="flex flex-wrap gap-4">
              {colors.map((color: string, i: number) => (
                <div key={i} className="group flex gap-2">
                  <ColorPicker
                    color={color}
                    onChange={(_c) =>
                      setColors(
                        colors.map((c: string) => (c === color ? _c : c)),
                      )
                    }
                  />
                  <Button
                    onClick={(event) => {
                      event.preventDefault();
                      setColors(colors.filter((c) => c !== color));
                    }}
                    variant={"ghost"}
                    className="size-8 h-auto p-1 opacity-0 group-hover:opacity-100"
                  >
                    <TrashIcon className="size-4" />
                  </Button>
                </div>
              ))}
              <div className="grid place-content-center">
                <Button
                  variant={"secondary"}
                  onClick={(event) => {
                    event.preventDefault();
                    setColors([
                      ...colors,
                      Color(colors[0])
                        .rotate(Math.random() * 220 + 30)
                        .hex(),
                    ]);
                  }}
                >
                  <PlusIcon className="size-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
        {/* Tópicos */}
        {/* <pre>{JSON.stringify(currentTopics, null, 2)}</pre> */}
        <div className="gap-2 md:flex">
          <div className="mb-4 w-full">
            <Label className="mb-2 block">Tópicos</Label>
            <div className="flex flex-col gap-2">
              {currentTopics?.map((topic) => (
                <div
                  key={topic.id}
                  className="bg-card group flex items-center justify-between gap-2 rounded-sm px-3 py-2"
                >
                  <input
                    type="text"
                    className="topic-title rounded-full px-3 py-1 text-sm font-medium outline-none"
                    style={{
                      color: topic.foreground,
                      backgroundColor: topic.color,
                      // @ts-ignore
                      fieldSizing: "content",
                    }}
                    value={topic.title}
                    onChange={(e) =>
                      setTopics(
                        currentTopics.map((t) =>
                          t.id === topic.id
                            ? { ...t, title: e.target.value }
                            : t,
                        ),
                      )
                    }
                  />

                  {/* <div
                    className="rounded-full px-3 py-1 text-sm font-medium outline-none"
                    style={{
                      color: topic.color,
                      backgroundColor: topic.foreground,
                    }}
                  >
                    {topic.title}
                  </div> */}

                  <div className="flex items-center gap-4">
                    <div className="opacity-0 group-hover:opacity-100">
                      <Button
                        variant={"ghost"}
                        size={"icon"}
                        onClick={() =>
                          setTopics(
                            currentTopics.filter((t) => t.id !== topic.id),
                          )
                        }
                      >
                        <TrashIcon />
                      </Button>
                    </div>
                    <div>
                      <ColorPicker
                        color={topic.color}
                        onChange={(c) =>
                          setTopics(
                            currentTopics.map((t) =>
                              t.id === topic.id ? { ...t, color: c } : t,
                            ),
                          )
                        }
                      />
                    </div>
                    <div>
                      <ColorPicker
                        color={topic.foreground}
                        onChange={(c) =>
                          setTopics(
                            currentTopics.map((t) =>
                              t.id === topic.id ? { ...t, foreground: c } : t,
                            ),
                          )
                        }
                      />
                    </div>
                  </div>
                </div>
              ))}
              <div className="text-right">
                <Button
                  variant={"secondary"}
                  onClick={(event) => {
                    event.preventDefault();

                    setTopics([
                      ...currentTopics,
                      {
                        id: Date.now(),
                        title: "Tópico",
                        color: partner.colors[0],
                        foreground: partner.colors[1],
                        created_at: new Date().toISOString(),
                        partner_slug: partner.slug,
                      },
                    ]);
                  }}
                >
                  <PlusIcon />
                </Button>
              </div>
            </div>
          </div>
        </div>
        {/* Button */}
        <div className="border-t pt-8 pb-8 text-right">
          <Button
            size={"lg"}
            onClick={() => {
              const formData = new FormData();

              // Add partner data
              Object.entries(currentPartner).forEach(([key, value]) => {
                if (Array.isArray(value)) {
                  value.forEach((v) => formData.append(key, v));
                } else {
                  formData.append(key, value as string);
                }
              });

              // Add colors
              colors.forEach((color) =>
                formData.append("colors_partner", color),
              );

              // Add topics as JSON string
              formData.append("topics", JSON.stringify(currentTopics));

              fetcher.submit(formData, {
                action: `/dashboard/admin/partner/${partner.slug}`,
                method: "post",
              });
            }}
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="size-4 animate-spin rounded-full border-2 border-white border-b-transparent" />
            ) : (
              <>
                <span>Atualizar</span>
                <SaveIcon />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
