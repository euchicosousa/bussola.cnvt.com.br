/* eslint-disable jsx-a11y/no-autofocus */
import { createBrowserClient } from "@supabase/ssr";
import { CommandLoading } from "cmdk";
import React, { useEffect, useState } from "react";
import {
  useMatches,
  useNavigate,
  useOutletContext,
  useSearchParams,
} from "react-router";
// import { useDebounce } from "use-debounce";
import Loader from "~/components/common/feedback/Loader";
import { formatActionDatetime } from "~/components/features/actions/shared/formatActionDatetime";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "~/components/ui/command";
import { DialogTitle } from "~/components/ui/dialog";
import { PRIORITIES } from "~/lib/constants";
import { Avatar, getCategoriesQueryString, Icons } from "~/lib/helpers";
import { useDebounce } from "~/lib/hooks/use-debouce";

type CommandItemType = {
  name: string;
  items: {
    id: string | number;
    title: string;
    href?: string;
    click?: () => void;
    options: string[];
    obs?: {
      state: State;
      category: Category;
      priority: Priority;
      partner: Partner;
      responsibles: Person[];
      date?: string;
    };
  }[];
};

export default function Search({
  search,
}: {
  search: {
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  };
}) {
  const navigate = useNavigate();
  const matches = useMatches();

  const [loading, setLoading] = useState(false);
  const [value, setValue] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();
  const params = new URLSearchParams(searchParams);

  const query = useDebounce(value, 300);
  const { partners, states, categories, people, priorities, person } =
    matches[1].data as DashboardRootType;

  const { partner } = matches[2].data
    ? (matches[2].data as DashboardPartnerType)
    : {};

  const { setStateFilter, setCategoryFilter } =
    useOutletContext() as ContextType;

  let startSections: CommandItemType[] = [
    {
      name: "Parceiros",
      items: partners.map((partner) => ({
        id: partner.id,
        title: partner.title,
        options: [partner.title, partner.short, partner.slug],
        href: `/dashboard/${partner.slug}`,
      })),
    },
  ];

  startSections =
    partner !== undefined
      ? [
          ...startSections,
          {
            name: "Filtrar pelo Status",
            items: [
              {
                id: "clean-status",
                title: "Remover filtro de Status",
                click: () => {
                  setStateFilter(undefined);
                },
                options: ["status remover", "status limpar", "status clean"],
              },
              ...states.map((state) => ({
                id: state.id,
                title: state.title,
                click: () => {
                  setStateFilter(state);
                },
                options: [
                  "status ".concat(state.title),
                  "status ".concat(state.slug),
                ],
              })),
            ],
          },
          {
            name: "Filtrar pela Categoria",
            items: [
              {
                id: "clean-category",
                title: "Remover filtro de Categoria",
                click: () => {
                  params.delete("categories");
                  setCategoryFilter(undefined);
                  setSearchParams(params);
                },
                options: [
                  "categoria remover",
                  "categoria limpar",
                  "categoria clean",
                ],
              },
              ...categories.map((category) => ({
                id: category.id,
                title: category.title,

                click: () => {
                  params.set(
                    "categories",
                    getCategoriesQueryString(category.slug),
                  );
                  setSearchParams(params);
                  setCategoryFilter(
                    categories.filter((c) => c.slug === category.slug),
                  );
                },
                options: [
                  "categoria ".concat(category.title),
                  "categoria ".concat(category.slug),
                ],
              })),
            ],
          },
        ]
      : startSections;

  const [sections, setSections] = useState<CommandItemType[]>([
    {
      name: "Ações",
      items: [],
    },
    ...startSections,
  ]);

  const { env } = matches[0].data as {
    env: { SUPABASE_URL: string; SUPABASE_KEY: string };
  };

  const supabase = createBrowserClient(env.SUPABASE_URL, env.SUPABASE_KEY);

  useEffect(() => {
    const keyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault();
        search.setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", keyDown);
    return () => document.removeEventListener("keydown", keyDown);
  }, []);

  useEffect(() => {
    async function getActions() {
      if (supabase && sections) {
        setLoading(true);
        const partner_slug = partner
          ? [partner.slug]
          : partners.map((p) => p.slug)!;

        supabase
          .from("actions")
          .select("*")
          .is("archived", false)
          .contains("responsibles", person?.admin ? [] : [person.user_id])
          .containedBy("partners", partner_slug)
          .order("date", { ascending: false })
          .textSearch("title", `%${query.split(" ")[0]}%`, {
            type: "websearch",
          })
          .then((value: any) => {
            const actions = value.data
              ? value.data.map((action: Action) => ({
                  id: action.id,
                  title: action.title,
                  href: `/dashboard/action/${action.id}/${action.partners[0]}`,
                  options: [
                    action.title,
                    action.category,
                    action.partners.join(" "),
                  ],
                  obs: {
                    state: states.find((state) => state.slug === action.state)!,
                    category: categories.find(
                      (category) => category.slug === action.category,
                    )!,
                    partner: partners.find((partner) => {
                      return partner.slug === action.partners[0];
                    })!,
                    priority: priorities.find(
                      (priority) => priority.slug === action.priority,
                    )!,
                    responsibles: people.filter(
                      (person) =>
                        action.responsibles.findIndex(
                          (responsible_id: string) =>
                            responsible_id === person.user_id,
                        ) >= 0,
                    ),
                    date: action.date,
                  },
                }))
              : [];

            setSections([
              {
                name: "Ações",
                items: actions,
              },
              ...startSections,
            ]);

            setLoading(false);
          });
      }
    }

    if (query !== "" && query.length >= 3) {
      getActions();
    } else {
      setSections([
        {
          name: "Ações",
          items: [],
        },
        ...startSections,
      ]);
    }
  }, [query]);

  return (
    <CommandDialog open={search.open} onOpenChange={search.setOpen}>
      <DialogTitle className="hidden">Buscar</DialogTitle>
      <CommandInput
        className={`text-xl font-medium`}
        value={value}
        onValueChange={setValue}
      />

      <CommandList className="scrollbars pb-2 outline-none">
        <CommandEmpty>Nenhum resultado encontrado. 😬</CommandEmpty>
        {loading && (
          <CommandLoading className="flex justify-center p-4">
            <Loader size="md" />
          </CommandLoading>
        )}
        {sections.map((section, i) =>
          section.items.length > 0 ? (
            <CommandGroup key={section.name} heading={section.name}>
              {section.items.map((item, i) => (
                <CommandItem
                  key={i}
                  value={item.options.join("")}
                  onSelect={() => {
                    if (item.href) navigate(item.href);
                    else if (item.click) item.click();
                    search.setOpen(false);
                  }}
                  className="flex justify-between gap-8"
                >
                  <div className="line-clamp-1 text-base">{item.title}</div>
                  {item.obs ? (
                    <div className="flex items-center gap-2">
                      {item.obs.priority.slug === PRIORITIES.high ? (
                        <Icons id="high" className="text-rose-500" />
                      ) : null}
                      <div className="flex">
                        {item.obs.responsibles.map((responsible) => (
                          <Avatar
                            size="xs"
                            item={{
                              image: responsible.image,
                              short: responsible.initials!,
                            }}
                            key={responsible.id}
                            ring
                          />
                        ))}
                      </div>
                      <Avatar
                        size="xs"
                        item={{
                          short: item.obs.partner.short,
                          bg: item.obs.partner.colors[0],
                          fg: item.obs.partner.colors[1],
                        }}
                      />
                      <Icons
                        id={item.obs.category.slug}
                        className="opacity-50"
                      />
                      <div className="w-12 text-center text-xs opacity-75">
                        {formatActionDatetime({
                          date: item.obs.date!,
                          dateFormat: 2,
                        })}
                      </div>
                      <div
                        className={`size-2 rounded-full`}
                        style={{
                          backgroundColor: item.obs.state.color,
                        }}
                      ></div>
                    </div>
                  ) : null}
                </CommandItem>
              ))}
            </CommandGroup>
          ) : null,
        )}
      </CommandList>
    </CommandDialog>
  );
}
