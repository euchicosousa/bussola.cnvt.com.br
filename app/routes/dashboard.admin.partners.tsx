import { ArchiveIcon, ArchiveRestoreIcon, Trash2Icon } from "lucide-react";
import {
  Link,
  useLoaderData,
  useMatches,
  useSubmit,
  type LoaderFunctionArgs,
  type MetaFunction,
} from "react-router";
import { Heading } from "~/components/common/forms/Headings";
import { INTENTS } from "~/lib/constants";
import { Avatar, AvatarGroup, getResponsibles } from "~/lib/helpers";
import { createClient } from "~/lib/database/supabase";

export const config = { runtime: "edge" };

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { supabase } = await createClient(request);

  const { data: partners, error } = await supabase
    .from("partners")
    .select("*")
    .order("archived", { ascending: true })
    .order("title", { ascending: true });

  if (error) console.log({ error });

  return { partners };
};

export const meta: MetaFunction = () => {
  return [
    { title: "Parceiros - ʙússoʟa" },
    {
      name: "description",
      content:
        "Aplicativo de Gestão de Projetos Criado e Mantido pela Agência CNVT®. ",
    },
  ];
};

export default function AdminPartners() {
  const matches = useMatches();

  let { partners } = useLoaderData<typeof loader>();
  let partnersA: Partner[] = [];
  let partnersB: Partner[] = [];
  partners?.map((p) => {
    if (p.archived) {
      partnersB.push(p);
    } else {
      partnersA.push(p);
    }
  });
  const { people } = matches[1].data as DashboardRootType;

  return (
    <div className="scrollbars-v">
      <div className="px-4 py-12 lg:px-8">
        <Heading>Parceiros</Heading>
        <div className="grid items-center gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
          {partnersA?.map((partner: Partner) => (
            <PartnerLink partner={partner} people={people} />
          ))}
        </div>
        <h3 className="mt-8 mb-4 text-2xl font-bold uppercase">Arquivados</h3>
        <div className="grid items-center gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
          {partnersB?.map((partner: Partner) => (
            <PartnerLink partner={partner} people={people} />
          ))}
        </div>
      </div>
    </div>
  );
}

function PartnerLink({
  partner,
  people,
}: {
  partner: Partner;
  people: Person[];
}) {
  const submit = useSubmit();

  return (
    <Link
      to={`/dashboard/admin/partner/${partner.slug}`}
      className="group bg-card ring-ring hover:bg-popover relative z-1 flex justify-between overflow-hidden rounded-xl p-6 tracking-tight shadow-sm transition-[background-color,box-shadow] duration-500 select-none focus-within:ring-2 hover:z-10 hover:shadow-2xl"
      key={partner.slug}
      tabIndex={-1}
    >
      <div className="flex w-full gap-4">
        <Avatar
          item={{
            short: partner.short,
            bg: partner.colors[0],
            fg: partner.colors[1],
          }}
          size="lg"
        />
        <div className="w-full overflow-hidden">
          <div className="mb-1 flex w-[90%] gap-2 overflow-hidden text-2xl font-bold outline-hidden">
            <div className="overflow-hidden text-ellipsis whitespace-nowrap">
              {partner.title}
            </div>
            {/* {partner.archived && <ArchiveIcon className="opacity-25" />} */}
          </div>
          <div className="text-xs font-medium tracking-wide opacity-50">
            {partner.slug}
          </div>
          <div className="mt-4 flex w-full items-center justify-between gap-4">
            <div>
              <AvatarGroup
                size="sm"
                avatars={getResponsibles(people, partner.users_ids).map(
                  (r) => ({
                    item: {
                      image: r.image,
                      short: r.initials!,
                      title: r.name,
                    },
                  }),
                )}
              />
            </div>
            <div className="flex items-center justify-end gap-1 text-[10px] font-bold tracking-wide uppercase opacity-50">
              {partner.sow === "marketing"
                ? "Consultoria de Marketing 360"
                : partner.sow === "socialmedia"
                  ? "Gestão de Redes Sociais"
                  : "Serviços avulsos"}
            </div>
          </div>
        </div>
      </div>
      <div className="absolute top-4 right-4">
        <button
          className="translate-x-12 transition-transform duration-500 group-hover:translate-x-0"
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            submit(
              {
                intent: INTENTS.updatePartner,
                archived: !partner.archived,
                id: partner.id,
              },
              {
                action: "/handle-actions",
                method: "post",
                navigate: false,
              },
            );
            return false;
          }}
        >
          {partner.archived ? (
            <ArchiveRestoreIcon className="h-6 w-6 opacity-75" />
          ) : (
            <ArchiveIcon className="h-6 w-6 opacity-75" />
          )}
        </button>
      </div>
    </Link>
  );
}
