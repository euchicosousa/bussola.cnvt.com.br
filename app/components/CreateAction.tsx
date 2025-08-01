import { SiInstagram } from "@icons-pack/react-simple-icons";
import { PopoverTrigger } from "@radix-ui/react-popover";
import { format, formatDuration, isToday, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  CheckCircle2Icon,
  CheckIcon,
  ChevronsUpDownIcon,
  PlusCircleIcon,
  PlusIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useFetcher, useLocation, useMatches, useSubmit } from "react-router";
import invariant from "tiny-invariant";
import { BASE_COLOR, INTENTS, TIMES } from "~/lib/constants";
import {
  Avatar,
  AvatarGroup,
  getInstagramFeed,
  getPartners,
  getResponsibles,
  Icons,
  isInstagramFeed,
} from "~/lib/helpers";

import { Button } from "./ui/button";
import { Calendar } from "./ui/calendar";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./ui/command";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Input } from "./ui/input";
import { Popover, PopoverContent } from "./ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { useToast } from "./ui/use-toast";

export default function CreateAction({
  date,
  mode,
  shortcut,
}: {
  date?: string;
  mode: "fixed" | "day" | "button" | "plus";
  shortcut?: boolean;
}) {
  const { categories, partners, user, areas, config, topics } = useMatches()[1]
    .data as DashboardRootType;
  const matches = useMatches();
  const location = useLocation();

  const [open, setOpen] = useState(false);
  const submit = useSubmit();
  const { toast } = useToast();

  const newDate = date ? parseISO(date) : new Date();

  if (isToday(newDate) && new Date().getHours() >= 11) {
    newDate.setHours(new Date().getHours() + 1, new Date().getMinutes());
  } else {
    newDate.setHours(11, 0);
  }

  let [partner, setPartner] = useState(
    matches[2] && matches[2].data
      ? (matches[2].data as DashboardPartnerType).partner
      : undefined,
  );

  const cleanAction: RawAction = {
    category: "post",
    partner: partner ? partner.slug : undefined,
    date: newDate,
    instagram_date: newDate,
    description: "",
    responsibles: [config?.creative || user.id], // Default responsible is the creative person or the user
    // [user.id]
    partners: partner ? [partner.slug] : [],
    state: "idea",
    title: "",
    user_id: user.id,
    color: partner ? partner.colors[0] : BASE_COLOR,
    time: TIMES.post,
    topics: [],
  };

  const [action, setAction] = useState<RawAction>(cleanAction);

  const category = categories.find(
    (category) => category.slug === action.category,
  ) as Category;

  useEffect(() => {
    if (action.partners) {
      const newPartner = partners.find((p) => p.slug === action.partners[0]);
      if (newPartner) {
        setPartner(newPartner);
        setAction({ ...action, color: newPartner.colors[0] });
      }
    }
  }, [action.partners]);

  useEffect(() => {
    if (
      areas.find(
        (area) =>
          categories.find((category) => category.slug === action.category)
            ?.area === "creative",
      )
    ) {
      setAction({
        ...action,
        responsibles: ["b4f1f8f7-e8bb-4726-8693-76e217472674"],
      });
    } else {
      setAction({
        ...action,
        responsibles: [user.id],
      });
    }
  }, [action.category]);

  useEffect(() => {
    setPartner(() =>
      matches[2] && matches[2].data
        ? (matches[2].data as DashboardPartnerType).partner
        : undefined,
    );
  }, [location]);

  useEffect(() => {
    if (open) {
      setAction(cleanAction);
    }
  }, [open]);

  useEffect(() => {
    if (open) {
      const keyDownSubmit = (event: KeyboardEvent) => {
        if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
          event.preventDefault();
          createAction();
        }
      };

      document.addEventListener("keydown", keyDownSubmit);
      return () => document.removeEventListener("keydown", keyDownSubmit);
    }
  }, [createAction, open]);

  useEffect(() => {
    if (shortcut) {
      const keyDown = (event: KeyboardEvent) => {
        if (
          (event.metaKey || event.ctrlKey) &&
          event.shiftKey &&
          event.key === "a"
        ) {
          event.preventDefault();
          setOpen((open) => !open);
        }
      };

      document.addEventListener("keydown", keyDown);
      return () => document.removeEventListener("keydown", keyDown);
    }
  }, []);

  function createAction() {
    if (action.title.length === 0) {
      toast({
        variant: "destructive",
        title: "O título não pode ser em vazio.",
        description: "Defina um título para a sua ação antes de criar.",
      });
      return false;
    }
    if (!action.date) {
      toast({
        variant: "destructive",
        title: "Escolha a data da ação",
        description: "Defina a data que a sua ação deve acontecer.",
      });
      return false;
    }
    if (action.partners.length === 0) {
      toast({
        variant: "destructive",
        title: "Ação sem nenhum Parceiro.",
        description: "Selecione pelo menos um Parceiro para essa ação.",
      });
    } else {
      submit(
        {
          id: window.crypto.randomUUID(),
          intent: INTENTS.createAction,
          ...action,
          date: format(action.date, "y-MM-dd HH:mm:ss", {
            locale: ptBR,
          }),
          instagram_date: format(action.instagram_date, "y-MM-dd HH:mm:ss", {
            locale: ptBR,
          }),
          created_at: format(new Date(), "y-MM-dd HH:mm:ss", {
            locale: ptBR,
          }),
          updated_at: format(new Date(), "y-MM-dd HH:mm:ss", {
            locale: ptBR,
          }),
        },
        {
          action: "/handle-actions",
          navigate: false,
          method: "POST",
        },
      );
      setAction(cleanAction);
      setOpen(false);
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {mode === "day" ? (
          <Button size={"sm"} variant={"secondary"} className="size-6 p-0">
            <PlusIcon className="size-3" />
          </Button>
        ) : mode === "button" ? (
          <Button className="p-0">
            Criar uma nova ação
            <PlusIcon className="ml-2 w-8" />
          </Button>
        ) : mode === "plus" ? (
          <Button variant="default" size="icon" className="rounded-full p-2">
            <PlusIcon className="z-10 size-10" />
          </Button>
        ) : (
          <Button className="fixed right-2 bottom-3 rounded-full">
            <PlusIcon className="z-10 size-12" />
          </Button>
        )}
      </PopoverTrigger>
      <PopoverContent className="bg-content mr-[5vw] w-[90dvw] max-w-[90vw] shadow-2xl md:max-w-[500px] md:px-6">
        {/* Título */}
        <div className="relative">
          <textarea
            defaultValue={action.title}
            className="text-foreground placeholder:text-muted-foreground mb-1 field-sizing-content w-full resize-none overflow-hidden bg-transparent pr-2 text-3xl font-medium tracking-tighter outline-hidden"
            rows={1}
            onChange={(event) => {
              setAction({ ...action, title: event.target.value });
            }}
            placeholder="Qual o nome da sua ação?"
          />
          <div
            className={`absolute text-xs ${
              action.title.length > 60 ? "text-error" : "text-foreground/50"
            } top-0 right-0`}
          >
            {action.title.length > 0 ? action.title.length : ""}
          </div>
        </div>
        <textarea
          defaultValue={action.description || ""}
          className="font-regular placeholder:text-muted-foreground relative field-sizing-content w-full resize-none bg-transparent text-sm outline-hidden"
          rows={2}
          placeholder="Descreva brevemente a sua ação"
          onChange={(event) => {
            setAction({
              ...action,
              description: event.target.value,
            });
          }}
        />

        <hr className="-mx-4 my-2 border-t p-1 md:-mx-6" />
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between gap-2">
            {/* Partners */}
            <PartnersDropdown
              partners={action.partners}
              onSelect={(partners) => {
                setAction((action) => ({ ...action, partners }));
              }}
            />

            {/* Categoria */}
            <DropdownMenu>
              <DropdownMenuTrigger className="button-trigger">
                <Icons id={category.slug} />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-content">
                {areas.map((area, i) => (
                  <DropdownMenuGroup key={area.id}>
                    {i > 0 && <DropdownMenuSeparator />}
                    <h4 className="px-3 py-1 text-[10px] font-bold tracking-wider uppercase opacity-50">
                      {area.title}
                    </h4>
                    {categories.map((category) =>
                      category.area === area.slug ? (
                        <DropdownMenuItem
                          key={category.slug}
                          className="bg-item flex items-center gap-2"
                          onSelect={async () => {
                            if (category.slug !== action.category) {
                              setAction({
                                ...action,
                                category: category.slug,
                                time: (TIMES as any)[category.slug],
                              });
                            }
                          }}
                        >
                          <Icons
                            id={category.slug}
                            className={`size-4 opacity-50`}
                          />
                          <span>{category.title}</span>
                        </DropdownMenuItem>
                      ) : null,
                    )}
                  </DropdownMenuGroup>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* States */}
            <StateSelect
              state={action.state}
              onValueChange={(state) => {
                if (state !== action.state) {
                  setAction({
                    ...action,
                    state,
                  });
                }
              }}
            />

            <TopicsAction
              actionTopics={action.topics || []}
              topics={topics.filter(
                (topic) => topic.partner_slug === action.partners[0],
              )}
              onCheckedChange={(topics) => {
                setAction({ ...action, topics });
              }}
              partner={action.partners[0]}
              mode="command"
            />

            {/* Responsáveis */}
            <ResponsibleForAction
              responsibles={action.responsibles}
              onCheckedChange={(responsibles) => {
                setAction({ ...action, responsibles });
              }}
              partner={action.partners[0]}
            />

            {/* Cor da ação */}
            {getInstagramFeed({ actions: [action] }).length > 0 && partner ? (
              <DropdownMenu>
                <DropdownMenuTrigger className="button-trigger">
                  <div
                    className="border-foreground/10 size-8 rounded border"
                    style={{
                      backgroundColor: action.color,
                    }}
                  ></div>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-content">
                  {partner.colors.map(
                    (color, i) =>
                      i !== 1 && (
                        <DropdownMenuItem
                          className="bg-item py-4"
                          key={i}
                          onSelect={() => {
                            setAction({
                              ...action,
                              color,
                            });
                          }}
                        >
                          <div
                            className="border-foreground/10 h-8 w-full rounded-sm border"
                            style={{
                              backgroundColor: color,
                            }}
                          ></div>
                        </DropdownMenuItem>
                      ),
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            ) : null}
          </div>
          <div className="flex w-full items-center justify-between gap-2 overflow-hidden p-1">
            <DateTimeAndInstagramDate
              action={action}
              onChange={({ date, instagram_date, time }) => {
                if (date) setAction({ ...action, date });
                if (instagram_date) setAction({ ...action, instagram_date });
                if (time) setAction({ ...action, time });
              }}
            />

            <Button
              onClick={() => {
                createAction();
              }}
            >
              Criar
              <PlusCircleIcon className="size-4" />
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export function formatActionTime(i: number) {
  return formatDuration(
    {
      minutes: i < 60 ? i : i % 60,
      hours: i >= 60 ? Math.floor(i / 60) : 0,
    },
    { locale: ptBR, delimiter: " e " },
  );
}

export function StateSelect({
  state,
  onValueChange,
}: {
  state: string;
  onValueChange: (state: string) => void;
}) {
  const matches = useMatches();
  const { states } = matches[1].data as DashboardRootType;
  const _state = states.find((s) => s.slug === state) as State;

  return (
    <Select value={state} onValueChange={(value) => onValueChange(value)}>
      <SelectTrigger className={`button-trigger inline-flex w-auto gap-2`}>
        <div
          className={`size-2 rounded-full`}
          style={{ backgroundColor: _state.color }}
        ></div>
        {_state.title}
      </SelectTrigger>
      <SelectContent className="bg-content">
        {states.map((state) => (
          <SelectItem
            value={state.slug.toString()}
            key={state.slug}
            className="bg-select-item"
          >
            <div className="flex items-center gap-2">
              <div
                className={`size-2 rounded-full`}
                style={{ backgroundColor: state.color }}
              ></div>
              <div>{state.title}</div>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function PartnersDropdown({
  onSelect,
  partners,
  ringColor = "",
}: {
  onSelect: (partners: string[]) => void;
  partners: string[];
  ringColor?: string;
}) {
  const { partners: allPartners } = useMatches()[1].data as DashboardRootType;
  const actionPartners = getPartners(partners, allPartners);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="button-trigger">
        {partners?.length > 0 ? (
          <AvatarGroup
            avatars={actionPartners.map((partner) => ({
              item: {
                short: partner.short,
                bg: partner.colors[0],
                fg: partner.colors[1],
                title: partner.title,
              },
            }))}
            ringColor="ring-popover"
            size="md"
          />
        ) : (
          "Parceiros"
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent className="bg-content">
        {allPartners.map((partner) => (
          <DropdownMenuCheckboxItem
            key={partner.id}
            checked={partners.includes(partner.slug)}
            className="bg-select-item"
            onClick={(event) => {
              let tempPartners = [partner.slug];
              if (!event.shiftKey) {
                const checked = partners.includes(partner.slug);
                tempPartners = checked
                  ? partners.filter((p) => p !== partner.slug)
                  : [...partners, partner.slug];
              }
              onSelect(tempPartners);
            }}
          >
            <div className="flex items-center gap-2">
              <Avatar
                item={{
                  short: partner.short,
                  bg: partner.colors[0],
                  fg: partner.colors[1],
                }}
              />
              <div>{partner.title}</div>
            </div>
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function TopicsAction({
  size,
  actionTopics,
  topics,
  partner,
  onCheckedChange,
  mode = "dropdown",
}: {
  size?: Size;
  partner: string;
  actionTopics: number[];
  topics: Topic[];
  onCheckedChange: (topics: number[]) => void;
  mode?: "command" | "dropdown" | "context";
}) {
  const [query, setQuery] = useState("");
  const fetcher = useFetcher();

  return mode === "command" ? (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          title={
            actionTopics.length > 0
              ? topics
                  .filter((t) => actionTopics.includes(t.id))
                  .map((t) => t.title)
                  .join(", ")
              : "Tópicos"
          }
        >
          {actionTopics.length > 0 ? (
            <div className="flex">
              {actionTopics.map((topic, i) => {
                const _topic = topics.find((t) => t.id === topic);
                return (
                  <div
                    key={topic}
                    className={`border-background grid place-content-center rounded-full border-2 text-xs font-medium ${size === "sm" ? "size-4" : "size-6"} ${i !== 0 && "-ml-2"}`}
                    style={{
                      backgroundColor: _topic?.color,
                      color: _topic?.foreground,
                    }}
                  >
                    {_topic?.title.slice(0, 1)}
                  </div>
                );
              })}
            </div>
          ) : (
            "Tópicos"
          )}
          <ChevronsUpDownIcon className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="bg-transparent p-0">
        <Command className="outline-none">
          <CommandInput
            placeholder="Procurar tópicos..."
            value={query}
            onValueChange={setQuery}
          />
          <CommandList>
            <CommandEmpty>
              <div className="flex flex-col gap-4">
                <div>Nenhum tópico encontrado.</div>
                <div>
                  <Button
                    variant={"secondary"}
                    onClick={() => {
                      fetcher.submit(
                        {
                          title: query,
                          partner_slug: partner,
                          color: "#999",
                          foreground: "#fff",
                          intent: INTENTS.createTopic,
                        },
                        {
                          method: "post",
                          action: "/handle-actions",
                        },
                      );
                    }}
                  >
                    Adicionar "{query}" <PlusCircleIcon />
                  </Button>
                </div>
              </div>
            </CommandEmpty>
            <CommandGroup>
              {topics.map((topic) => (
                <CommandItem
                  key={topic.id}
                  onSelect={() => {
                    if (actionTopics.includes(topic.id)) {
                      onCheckedChange([
                        ...actionTopics.filter((id) => id !== topic.id),
                      ]);
                    } else {
                      onCheckedChange([...actionTopics, topic.id]);
                    }
                  }}
                  className="bg-select-item relative"
                >
                  {actionTopics.includes(topic.id) && (
                    <CheckIcon className="absolute top-1/2 left-2 size-3 -translate-y-1/2" />
                  )}
                  <div className="flex items-center gap-2 overflow-hidden">
                    <div
                      className="size-2 rounded-full"
                      style={{ backgroundColor: topic.color }}
                    ></div>
                    <div className="w-full overflow-hidden text-ellipsis whitespace-nowrap">
                      {topic.title}
                    </div>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  ) : mode === "dropdown" ? (
    <DropdownMenu>
      <DropdownMenuTrigger className="button-trigger">
        {actionTopics.length > 0 ? (
          <div className="flex">
            {actionTopics.map((topic, i) => {
              const _topic = topics.find((t) => t.id === topic);
              return (
                <div
                  key={topic}
                  className={`border-background rounded-full border-2 ${size === "sm" ? "size-4" : "size-6"} ${i !== 0 && "-ml-2"}`}
                  style={{ backgroundColor: _topic?.color }}
                ></div>
              );
            })}
          </div>
        ) : (
          "Tópicos"
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent className="bg-content">
        {topics.map((topic) => (
          <DropdownMenuCheckboxItem
            key={topic.id}
            className="bg-select-item"
            checked={actionTopics.includes(topic.id)}
            onClick={(event) => {
              const checked = actionTopics.includes(topic.id);
              const _topics = actionTopics || [];

              if (checked) {
                onCheckedChange([..._topics.filter((id) => id !== topic.id)]);
              } else {
                onCheckedChange([..._topics, topic.id]);
              }

              // if (checked && action.topics?.length < 2) {
              //   alert("É necessário ter pelo menos um responsável pela ação");
              //   return false;
              // }

              // if (!event.shiftKey) {
              //   tempTopics = checked
              //     ? action.topics?.filter((id) => id !== topic.id)
              //     : [...action.topics, topic.id];
              // }
              // onCheckedChange(tempResponsibles);
            }}
          >
            <div className="flex items-center gap-2">
              <div
                className="size-2 rounded-full"
                style={{
                  backgroundColor: topic.color,
                  color: topic.foreground,
                }}
              ></div>
              <div>{topic.title}</div>
            </div>
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  ) : mode === "context" ? null : null;
}

export function ResponsibleForAction({
  size,
  responsibles: responsibles_ids,
  onCheckedChange,
  partner,
}: {
  size?: Size;
  responsibles: string[];
  onCheckedChange: (responsibles: string[]) => void;
  partner?: string;
}) {
  const { people, partners } = useMatches()[1].data as DashboardRootType;

  const _responsibles: Person[] = [];
  responsibles_ids.map((user_id) => {
    const p = people.find((person) => person.user_id === user_id) as Person;
    if (p) _responsibles.push(p);
  });
  responsibles_ids.filter((person) => person !== undefined);

  const persons = partner
    ? getResponsibles(people, getPartners([partner], partners)[0].users_ids)
    : people;

  // const persons = people;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="button-trigger">
        <AvatarGroup
          size={size}
          avatars={_responsibles.map((person) => ({
            item: {
              image: person.image,
              short: person.initials!,
              title: person.name,
            },
          }))}
          ringColor="ring-popover"
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="bg-content">
        {persons.map((person) => (
          <DropdownMenuCheckboxItem
            key={person.id}
            className="bg-select-item"
            checked={responsibles_ids.includes(person.user_id)}
            onClick={(event) => {
              const checked = responsibles_ids.includes(person.user_id);

              if (checked && responsibles_ids.length < 2) {
                alert("É necessário ter pelo menos um responsável pela ação");
                return false;
              }

              let tempResponsibles = [person.user_id];

              if (!event.shiftKey) {
                tempResponsibles = checked
                  ? responsibles_ids.filter((id) => id !== person.user_id)
                  : [...responsibles_ids, person.user_id];
              }
              onCheckedChange(tempResponsibles);
            }}
          >
            <div className="flex items-center gap-2">
              <Avatar
                item={{
                  image: person.image,
                  short: person.initials!,
                }}
              />
              <div>{person.name}</div>
            </div>
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function DateTimeAndInstagramDate({
  action,
  onChange,
}: {
  action: RawAction;
  onChange: ({
    date,
    instagram_date,
    time,
  }: {
    date?: Date;
    instagram_date?: Date;
    time?: number;
  }) => void;
}) {
  return (
    <>
      {/* Data e Hora */}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            title={
              action.date
                ? format(
                    action.date,
                    "d/M"
                      .concat(
                        action.date.getFullYear() !== new Date().getFullYear()
                          ? " 'de' y"
                          : "",
                      )
                      .concat(" 'às' H'h'")
                      .concat(action.date.getMinutes() !== 0 ? "m" : ""),
                    { locale: ptBR },
                  ).concat(" por " + formatActionTime(action.time))
                : "Ação sem data"
            }
            variant="ghost"
            size="sm"
            className="flex items-center gap-2 overflow-hidden text-xs focus-visible:ring-offset-0"
          >
            <CheckCircle2Icon className="size-4" />
            <div className="overflow-hidden text-ellipsis whitespace-nowrap">
              {action.date
                ? format(
                    action.date,
                    "d/M"
                      .concat(
                        action.date.getFullYear() !== new Date().getFullYear()
                          ? " 'de' y"
                          : "",
                      )
                      .concat(" 'às' H'h'")
                      .concat(action.date.getMinutes() !== 0 ? "m" : ""),
                    { locale: ptBR },
                  ).concat(" por " + formatActionTime(action.time))
                : "Ação sem data"}
            </div>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="bg-content">
          <Calendar
            mode="single"
            locale={ptBR}
            selected={action.date}
            onSelect={(date) => {
              if (date) {
                if (action.date) {
                  date?.setHours(
                    action.date.getHours(),
                    action.date.getMinutes(),
                  );

                  onChange({ date });
                }
              }
            }}
          />
          <div className="mx-auto flex gap-2">
            <div className="flex shrink-0">
              <Input
                value={action.date.getHours().toString()}
                className="border-border w-1/2 rounded-r-none border border-r-0 text-right focus:z-10"
                type="number"
                min={0}
                max={23}
                onChange={(event) => {
                  const date = action.date;
                  date.setHours(Number(event.target.value));
                  // if(setRawAction){
                  //   setRawAction({ ...action, date });

                  // }
                  onChange({ date });
                }}
              />
              <Input
                value={action.date.getMinutes().toString()}
                className="border-border w-1/2 rounded-l-none border border-l-0 text-left"
                type="number"
                min={0}
                max={59}
                onChange={(event) => {
                  const date = action.date;
                  date.setMinutes(Number(event.target.value));
                  // setAction({
                  //   ...action,
                  //   date: date,
                  // });
                  onChange({ date });
                }}
              />
            </div>
            <Select
              value={action.time.toString()}
              onValueChange={(value) => {
                onChange({ time: Number(value) });
                // setAction({ ...action, time: Number(value) });
                // onChange(Number(value));
              }}
            >
              <SelectTrigger className="border-border bg-input w-full border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[5, 10, 15, 20, 30, 45, 60, 90, 120].map((i) => (
                  <SelectItem value={i.toString()} key={i}>
                    {formatActionTime(i)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </PopoverContent>
      </Popover>
      {/* Data e Hora do Instagram  */}
      {isInstagramFeed(action.category, true) ? (
        <Popover>
          <PopoverTrigger asChild>
            <Button
              title={
                action.instagram_date
                  ? format(
                      action.instagram_date,
                      "d/M"
                        .concat(
                          action.instagram_date.getFullYear() !==
                            new Date().getFullYear()
                            ? " 'de' y"
                            : "",
                        )
                        .concat(" 'às' H'h'")
                        .concat(
                          action.instagram_date.getMinutes() !== 0 ? "m" : "",
                        ),
                      { locale: ptBR },
                    )
                  : "Ação não tem data do Instagram"
              }
              variant="ghost"
              size="sm"
              className="flex items-center gap-2 overflow-hidden text-xs focus-visible:ring-offset-0"
            >
              <SiInstagram className="size-4" />
              <div className="overflow-hidden text-ellipsis whitespace-nowrap">
                {action.instagram_date
                  ? format(
                      action.instagram_date,
                      "d/M"
                        .concat(
                          action.instagram_date.getFullYear() !==
                            new Date().getFullYear()
                            ? " 'de' y"
                            : "",
                        )
                        .concat(" 'às' H'h'")
                        .concat(
                          action.instagram_date.getMinutes() !== 0 ? "m" : "",
                        ),
                      { locale: ptBR },
                    )
                  : "Ação sem data de instagram"}
              </div>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="bg-content">
            <Calendar
              locale={ptBR}
              mode="single"
              selected={action.instagram_date}
              onSelect={(instagram_date) => {
                if (instagram_date) {
                  if (action.instagram_date) {
                    instagram_date?.setHours(
                      action.instagram_date.getHours(),
                      action.instagram_date.getMinutes(),
                    );
                    // setAction({ ...action, instagram_date });
                    onChange({ instagram_date });
                  }
                }
              }}
            />
            <div className="mx-auto flex gap-2">
              <div className="flex shrink-0">
                <Input
                  value={action.instagram_date.getHours().toString()}
                  className="border-border w-1/2 rounded-r-none border border-r-0 text-right focus:z-10"
                  type="number"
                  min={0}
                  max={23}
                  onChange={(event) => {
                    const instagram_date = action.instagram_date;
                    instagram_date.setHours(Number(event.target.value));

                    onChange({ instagram_date });
                  }}
                />
                <Input
                  value={action.instagram_date.getMinutes().toString()}
                  className="border-border w-1/2 rounded-l-none border border-l-0 text-left"
                  type="number"
                  min={0}
                  max={59}
                  onChange={(event) => {
                    const instagram_date = action.instagram_date;
                    instagram_date.setMinutes(Number(event.target.value));
                    onChange({ instagram_date });
                    // setAction({
                    //   ...action,
                    //   instagram_date,
                    // });
                  }}
                />
              </div>
            </div>
          </PopoverContent>
        </Popover>
      ) : null}
    </>
  );
}

function getResponsibleForArea(category: string) {
  const { categories, areas, people } = useMatches()[1]
    .data as DashboardRootType;

  const _category = categories.find((c) => c.slug === category);

  invariant(_category, "O valor de category deve estar errado.");

  const _area = areas.find((a) => a.slug === _category.area);

  invariant(
    _area,
    "A área não pode ser encontrada, verifique novamente o valor de category",
  );

  const responsibles = people.filter((person) =>
    person.areas?.find((a) => a === _area.slug),
  );

  return responsibles;
}
