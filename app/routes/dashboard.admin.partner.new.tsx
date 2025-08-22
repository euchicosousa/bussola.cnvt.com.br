import { useEffect, useState } from "react";
import {
  Form,
  redirect,
  useMatches,
  type ActionFunctionArgs,
  type MetaFunction,
} from "react-router";
import { Heading } from "~/components/common/forms/Headings";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { SOW } from "~/lib/constants";
import { Avatar } from "~/lib/helpers";
import { createClient } from "~/lib/database/supabase";

export const config = { runtime: "edge" };

export const meta: MetaFunction = () => {
  return [
    { tile: "Novo parceiro - ʙússoʟa" },
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

  const data = {
    title: String(formData.get("title")),
    short: String(formData.get("short")),
    slug: String(formData.get("slug")),
    colors: [String(formData.get("bg")), String(formData.get("fg"))],
    sow: String(formData.get("sow")),
    context: String(formData.get("context")),
    users_ids: String(formData.getAll("user_id")).split(","),
    archived: false,
  } as Partner;

  const { data: partner, error } = await supabase
    .from("partners")
    //@ts-ignore
    .insert(data)
    .select()
    .returns<Partner[]>();
  if (partner) {
    return redirect(`/dashboard/${partner[0].slug}`);
  } else {
    console.log(error);
  }

  return { ok: true };
};

export default function NewPartners() {
  const matches = useMatches();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");

  const { people } = matches[1].data as DashboardRootType;

  useEffect(() => {
    setSlug(() => name.replace(/ /g, "").toLowerCase());
  }, [name]);

  return (
    <div className="px-2 py-8 md:px-8 lg:py-24">
      <Heading className="text-center">Novo Parceiro</Heading>

      <Form className="mx-auto max-w-md" method="post">
        <div className="mb-4">
          <Label className="mb-2 block">Nome</Label>
          <Input
            name="title"
            type="text"
            tabIndex={0}
            value={name}
            onChange={(event) => {
              setName(() => event.target.value);
            }}
            autoFocus
          />
        </div>
        <div className="mb-4 flex w-full gap-4">
          <div className="w-full">
            <Label className="mb-2 block">Slug</Label>
            <Input
              name="slug"
              value={slug}
              onChange={(event) => setSlug(event.target.value)}
            />
          </div>
          <div className="w-full">
            <Label className="mb-2 block">Short</Label>
            <Input name="short" />
          </div>
        </div>
        <div className="mb-4">
          <Label className="mb-2 block">Usuários</Label>

          {people.map((person) => (
            <div key={person.id} className="mb-2 flex gap-4">
              <Checkbox
                value={person.user_id}
                name="user_id"
                id={`user_id_${person.id}`}
                className="hidden"
              />

              <Label
                htmlFor={`user_id_${person.id}`}
                className="peer-data-[state=checked]:bg-primary flex items-center gap-2 rounded-2xl py-2 pr-8 pl-3 transition-colors"
              >
                <Avatar
                  item={{
                    short: person.short,
                    image: person.image,
                  }}
                  size="lg"
                />
                <div className="text-xl font-medium">
                  {person.name} {person.surname}
                </div>
              </Label>
            </div>
          ))}
        </div>
        <div className="mb-4 flex w-full gap-4">
          <div className="w-1/2">
            <Label className="mb-2 block">BG </Label>
            <Input defaultValue={"#ffffff"} name="bg" type="color" />
          </div>
          <div className="w-1/2">
            <Label className="mb-2 block">FG</Label>
            <Input defaultValue={"#000000"} name="fg" type="color" />
          </div>
        </div>
        <div className="mb-8">
          <Label className="mb-2 block">Serviço Contratado</Label>
          <Select name="sow">
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={SOW.marketing}>
                Consultoria de Marketing
              </SelectItem>
              <SelectItem value={SOW.socialmedia}>Social Media</SelectItem>
              <SelectItem value={SOW.demand}>Demanda</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="mb-4 text-right">
          <Button type="submit">Adicionar</Button>
        </div>
      </Form>
    </div>
  );
}
