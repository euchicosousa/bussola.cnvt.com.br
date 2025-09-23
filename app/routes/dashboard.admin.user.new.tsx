import {
  Form,
  useMatches,
  type ActionFunctionArgs,
  type MetaFunction,
} from "react-router";
import { Heading } from "~/components/common/forms/Headings";
import LenisScrollContainer from "~/components/common/layout/LenisScrollContainer";
import { Button } from "~/components/ui/button";

import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Switch } from "~/components/ui/switch";
import { Avatar } from "~/lib/helpers";
import { createClient } from "~/lib/database/supabase";

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

  const user = {
    name: String(formData.get("name")),
    email: String(formData.get("email")),
  };

  console.log({ formData });
};

export default function UserNew() {
  const matches = useMatches();
  const { areas, partners } = matches[1].data as DashboardRootType;

  return (
    <LenisScrollContainer>
      <div className="container mx-auto px-2 py-8 md:px-8 lg:py-24">
        <Heading className="border-b">Novo Usuário</Heading>

        <Form className="mx-auto" method="post">
          <div className="flex w-full gap-8 border-b py-8">
            <div className="w-full">
              <Label className="mb-4 block">Nome</Label>
              <Input name="name" type="text" tabIndex={0} autoFocus />
            </div>
            <div className="w-full">
              <Label className="mb-4 block">Sobrenome</Label>
              <Input name="surname" type="text" tabIndex={0} autoFocus />
            </div>
          </div>
          <div className="flex w-full gap-8 border-b py-8">
            <div className="w-full">
              <Label className="mb-4 block">Email</Label>
              <Input name="email" />
            </div>
            <div className="w-full">
              <Label className="mb-4 block">Imagem</Label>
              <Input name="image" />
            </div>
          </div>
          <div className="flex w-full items-center gap-8 border-b">
            <div className="flex w-full flex-col gap-8 py-8">
              <div className="flex gap-8">
                <div className="w-full">
                  <Label className="mb-4 block">Iniciais</Label>
                  <Input name="initials" type="text" tabIndex={0} autoFocus />
                </div>
                <div className="w-full">
                  <Label className="mb-4 block">Short</Label>
                  <Input name="short" type="text" tabIndex={0} autoFocus />
                </div>
              </div>
              <div className="flex gap-8">
                <div className="w-full">
                  <Label className="mb-4 block">Admin</Label>
                  <Switch name="admin" className="mt-2" />
                </div>
                <div className="w-full">
                  <Label className="mb-4 block">Visível</Label>
                  <Switch name="visible" className="mt-2" />
                </div>
              </div>
            </div>
            <div className="w-full py-8">
              <Label className="mb-4 block">Áreas de Atuação</Label>
              {areas.map((area) => (
                <div key={area.id} className="mb-4 flex items-center gap-8">
                  <Switch
                    value={area.id}
                    name="areas"
                    id={`areas_${area.id}`}
                  />

                  <Label
                    htmlFor={`user_id_${area.id}`}
                    className="opacity-50 peer-data-[state=checked]:opacity-100"
                  >
                    {area.title}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="border-b py-8">
            <Label className="mb-4 block">Parceiros</Label>
            <div className="grid lg:grid-cols-3">
              {partners.map((partner) => (
                <div key={partner.id} className="mb-4 flex items-center gap-8">
                  <input
                    value={partner.id}
                    name="partners"
                    type="checkbox"
                    id={`partner_id_${partner.id}`}
                    className="peer hidden"
                  />

                  <Label
                    htmlFor={`partner_id_${partner.id}`}
                    className="peer-checked:bg-primary flex w-full items-center gap-2 rounded-2xl py-2 pr-8 pl-3 transition-colors"
                  >
                    <Avatar
                      item={{
                        short: partner.short,
                        bg: partner.colors[0],
                        fg: partner.colors[1],
                      }}
                      size="md"
                    />
                    {partner.title}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="py-8 text-right">
            <Button type="submit">Adicionar</Button>
          </div>
        </Form>
      </div>
    </LenisScrollContainer>
  );
}
