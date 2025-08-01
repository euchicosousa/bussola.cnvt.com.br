import { useGSAP } from "@gsap/react";
import {
  addDays,
  addMonths,
  eachDayOfInterval,
  endOfDay,
  endOfMonth,
  endOfWeek,
  format,
  formatRelative,
  isSameDay,
  isSameMonth,
  isThisWeek,
  isToday,
  parseISO,
  startOfMonth,
  startOfWeek,
  subDays,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { gsap } from "gsap";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  CalendarClock,
  ChevronLeftIcon,
  ChevronRightIcon,
  ComponentIcon,
  GridIcon,
  KanbanIcon,
  ListIcon,
  ListTodoIcon,
  RabbitIcon,
  Rows3Icon,
  Rows4Icon,
  SearchIcon,
  SignalIcon,
  TimerIcon,
  XIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  Link,
  type LoaderFunctionArgs,
  type MetaFunction,
  redirect,
  useLoaderData,
  useMatches,
  useOutletContext,
} from "react-router";
import invariant from "tiny-invariant";

import { ActionLine, BlockOfActions, ListOfActions } from "~/components/Action";
import Badge from "~/components/Badge";
import { Heading } from "~/components/Headings";
import Kanban from "~/components/Kanban";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Toggle } from "~/components/ui/toggle";
import {
  Avatar,
  Icons,
  getActionsByState,
  getActionsForThisDay,
  getDelayedActions,
  getInstagramFeed,
  getMonthsActions,
  getThisWeekActions,
  getTodayActions,
  getTomorrowActions,
  sortActions,
} from "~/lib/helpers";
import { usePendingDataSafe } from "~/hooks/usePendingDataSafe";
import { useIDsToRemoveSafe } from "~/hooks/useIDsToRemoveSafe";
import { createClient } from "~/lib/supabase";
import { cn } from "~/lib/utils";

export const config = { runtime: "edge" };
gsap.registerPlugin(useGSAP);

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { supabase } = createClient(request);

  // const result = await fetch("https://br.storage.bunnycdn.com/agencia-cnvt/", {
  //   method: "GET",
  //   headers: { AccessKey: ACCESS_KEY!, accept: "application/json" },
  // });
  // const folders = await result.json() as [];

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/login");
  }

  user.id;

  const [{ data: people }, { data: partners }] = await Promise.all([
    supabase
      .from("people")
      .select("*")
      .match({ user_id: user.id })
      .returns<Person[]>(),
    supabase
      .from("partners")
      .select("slug")
      .match({ archived: false })
      .returns<Partner[]>(),
  ]);

  invariant(people);
  invariant(partners);

  const person = people[0];

  let start = startOfWeek(startOfMonth(new Date()));
  let end = endOfDay(endOfWeek(endOfMonth(addMonths(new Date(), 1))));

  const [{ data: actions }, { data: actionsChart }] = await Promise.all([
    supabase
      .from("actions")
      .select("*")
      .is("archived", false)
      .contains("responsibles", person.admin ? [] : [user.id])
      .containedBy("partners", partners.map((p) => p.slug)!)
      .gte("date", format(start, "yyyy-MM-dd HH:mm:ss"))
      .lte("date", format(end, "yyyy-MM-dd HH:mm:ss"))
      .order("title", { ascending: true })
      .returns<Action[]>(),
    supabase
      .from("actions")
      .select("category, state, date, partners, instagram_date")
      .is("archived", false)
      .contains("responsibles", person?.admin ? [] : [user.id])
      .containedBy("partners", partners.map((p) => p.slug)!)
      .gte("date", format(start, "yyyy-MM-dd HH:mm:ss"))
      .lte("date", format(end, "yyyy-MM-dd HH:mm:ss"))
      .returns<
        {
          category: string;
          state: string;
          date: string;
          partners: string[];
          instagram_date: string;
        }[]
      >(),
  ]);

  return { actions, actionsChart };
};

export const meta: MetaFunction = () => {
  return [
    { title: "ʙússoʟa - Domine, Crie e Conquiste." },
    {
      name: "description",
      content:
        "Aplicativo de Gestão de Projetos Criado e Mantido pela Agência CNVT®. ",
    },
  ];
};

///
///
///
///

export default function DashboardIndex() {
  let { actions } = useLoaderData<typeof loader>();
  const matches = useMatches();

  const { setTransitioning } = useOutletContext() as ContextType;

  if (!actions) {
    actions = [];
  }

  const { person } = matches[1].data as DashboardRootType;

  const { actions: pendingActions } = usePendingDataSafe();
  const { actions: deletingIDsActions } = useIDsToRemoveSafe();

  //Actions
  // Transform into a Map
  const actionsMap = new Map<string, Action>(
    actions.map((action) => [action.id, action]),
  );
  // Add pending Created/Updated Actions
  for (const action of pendingActions as Action[]) {
    actionsMap.set(action.id, action);
  }
  // Remove pending deleting Actions
  for (const id of deletingIDsActions) {
    actionsMap.delete(id);
  }
  // transform and sort
  actions = sortActions(Array.from(actionsMap, ([, v]) => v));

  const lateActions = getDelayedActions({
    actions: actions as Action[],
  }) as Action[];

  // const weekActions = eachDayOfInterval({
  //   start: startOfWeek(new Date()),
  //   end: endOfWeek(new Date()),
  // }).map((day) => ({
  //   date: day,
  //   actions: actions?.filter((action) =>
  //     isSameDay(action.date, day),
  //   ) as Action[],
  // }));
  const nextActions = actions?.filter((action) => action.state != "finished");

  useEffect(() => {
    setTransitioning(false);
  }, []);

  return (
    <div className="scrollbars-v">
      {/* Progresso  */}

      <div suppressHydrationWarning>
        {person.admin && <ActionsProgress />}
      </div>

      {/* Sprint */}
      <Sprint />

      {/* Parceiros */}
      <Partners actions={actions as Action[]} />

      {/* Ações em Atraso */}

      <DelayedActions actions={lateActions} />

      {/* Hoje */}
      <TodayViews actions={actions as Action[]} />

      {/* Mês */}

      <CalendarMonth actions={actions} />

      {/* Próximas Ações */}
      <NextActions actions={nextActions as Action[]} />

      {/* Ações da Semana */}
      {/* <WeekView weekActions={weekActions} /> */}
    </div>
  );
}

///
///
///
///

function TodayViews({ actions }: { actions: Action[] }) {
  const [todayView, setTodayView] = useState<
    "kanban" | "hours" | "categories" | "feed"
  >("kanban");
  const [list, setList] = useState(false);
  const [currentDay, setCurrentDay] = useState(new Date());
  const currentActions = getActionsForThisDay({
    actions,
    date: currentDay,
    isInstagramDate: todayView === "feed",
  });

  const matches = useMatches();
  const { states, partners } = matches[1].data as DashboardRootType;

  return (
    currentActions?.length > 0 && (
      <>
        <div className="border-b"></div>
        {/* Ações de Hoje */}
        <div className="px-2 py-8 md:px-8 lg:py-24">
          <div className="flex justify-between pb-8">
            <div className="flex">
              <div className="relative flex">
                <h2 className="text-3xl font-semibold tracking-tight capitalize">
                  {isToday(currentDay)
                    ? "hoje"
                    : isThisWeek(currentDay)
                      ? formatRelative(currentDay, new Date(), {
                          locale: ptBR,
                        }).split("às")[0]
                      : format(currentDay, "EEEEEE, d 'de' MMMM", {
                          locale: ptBR,
                        })}
                </h2>
                <Badge value={currentActions?.length} isDynamic />
              </div>
              <Button
                onClick={() => setCurrentDay(subDays(currentDay, 1))}
                size={"icon"}
                variant={"ghost"}
                className="ml-12"
              >
                <ChevronLeftIcon className="size-4" />
              </Button>
              <Button
                onClick={() => setCurrentDay(addDays(currentDay, 1))}
                size={"icon"}
                variant={"ghost"}
                className=""
              >
                <ChevronRightIcon className="size-4" />
              </Button>
            </div>

            <div className="flex gap-2">
              {todayView === "kanban" && (
                <div>
                  <Toggle
                    variant={"default"}
                    onPressedChange={(pressed) => setList(pressed)}
                    pressed={list}
                    title={
                      list
                        ? "Modo de visualização de Lista"
                        : "Modo de visualização de bloco"
                    }
                  >
                    {list ? (
                      <Rows3Icon className="size-4" />
                    ) : (
                      <Rows4Icon className="size-4" />
                    )}
                  </Toggle>
                </div>
              )}
              {[
                {
                  id: "kanban",
                  title: "Kanban",
                  description: "Ver o Kanban de progresso",
                  Icon: <KanbanIcon className="w-6" />,
                },
                {
                  id: "feed",
                  title: "Feed",
                  description: "Ver as ações do feed do Instagram",
                  Icon: <GridIcon className="w-6" />,
                },
                {
                  id: "categories",
                  title: "Categorias",
                  description: "Ver por categorias",
                  Icon: <ComponentIcon className="w-6" />,
                },
                {
                  id: "hours",
                  title: "Horas",
                  description: "Ver por horas do dia",
                  Icon: <CalendarClock className="w-6" />,
                },
              ].map((button) => (
                <Button
                  key={button.id}
                  variant={todayView === button.id ? "secondary" : "ghost"}
                  size={"sm"}
                  title={button.description}
                  className="flex items-center gap-2"
                  onClick={() => {
                    setTodayView(
                      button.id as "kanban" | "hours" | "categories",
                    );
                  }}
                >
                  {button.Icon}
                  <div className="hidden md:block">{button.title}</div>
                </Button>
              ))}
            </div>
          </div>

          {todayView === "kanban" ? (
            <Kanban actions={currentActions} list={list} />
          ) : todayView === "hours" ? (
            <HoursView actions={currentActions} />
          ) : todayView === "feed" ? (
            <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6">
              {getActionsByState(
                getInstagramFeed({
                  actions: currentActions,
                }) as Action[],
                states,
              ).map((action) => {
                const partner = partners.filter(
                  (p) => p.slug === action.partners[0],
                )[0];
                return (
                  <div className="flex flex-col gap-4" key={action.id}>
                    <div className="flex justify-between gap-4">
                      <div className="flex items-center gap-1 overflow-hidden">
                        <Avatar
                          item={{
                            short: partner.short,
                            bg: partner.colors[0],
                            fg: partner.colors[1],
                          }}
                          size="xs"
                        />
                        <div className="overflow-hidden text-xs font-medium text-ellipsis whitespace-nowrap">
                          {partner.title}
                        </div>
                      </div>
                      <Icons
                        id={action.category}
                        className="size-4 shrink-0 opacity-25"
                      />
                    </div>
                    <ActionLine
                      action={action}
                      date={{ timeFormat: 1 }}
                      showContent
                    />
                  </div>
                );
              })}
            </div>
          ) : (
            <CategoriesView actions={currentActions} />
          )}
        </div>
      </>
    )
  );
}

function CalendarMonth({ actions }: { actions: Action[] | null }) {
  if (!actions) return null;

  const [currentDate, setCurrentDate] = useState(
    format(
      new Date().getDay() === 0 ? addDays(new Date(), 1) : new Date(),
      "yyyy-MM-dd",
    ),
  );

  const [view, setView] = useState<"week" | "month">("week");

  const days =
    view === "month"
      ? eachDayOfInterval({
          start: startOfWeek(startOfMonth(currentDate)),
          end: endOfWeek(endOfMonth(currentDate)),
        })
      : eachDayOfInterval({
          start: startOfWeek(currentDate),
          end: endOfWeek(currentDate),
        });

  const calendar = days.map((day) => {
    return {
      date: format(day, "yyyy-MM-dd", { locale: ptBR }),
      actions: actions?.filter((action) =>
        isSameDay(parseISO(action.date), day),
      ),
    };
  });

  return (
    <>
      <div className="border-b"></div>
      <div className="py-8 lg:py-24">
        <div className="flex justify-between gap-4 px-2 py-2 md:px-8">
          <h3 className="leading-none font-semibold tracking-tighter lg:text-2xl">
            {`${format(
              days[0],
              "d".concat(
                !isSameMonth(days[0], days[days.length - 1])
                  ? " 'de' MMMM"
                  : "",
              ),
              {
                locale: ptBR,
              },
            )} a ${format(days[days.length - 1], " d 'de' MMMM", { locale: ptBR })}`}
          </h3>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setView("month")}
              variant={view === "month" ? "secondary" : "ghost"}
            >
              Mês
            </Button>
            <Button
              onClick={() => setView("week")}
              variant={view === "week" ? "secondary" : "ghost"}
            >
              Semana
            </Button>
          </div>
        </div>
        {/* Calendar Header */}
        <div className="scrollbars-h px-2 md:px-8">
          <div className="min-w-[1440px]">
            <div className="grid grid-cols-7 border-b py-2 text-center text-xs font-medium tracking-wider uppercase">
              {eachDayOfInterval({
                start: startOfWeek(new Date()),
                end: endOfWeek(new Date()),
              }).map((day) => (
                <div key={day.getDate()}>
                  <span className="lg:hidden">
                    {format(day, "iiiiii", { locale: ptBR })}
                  </span>
                  <span className="hidden lg:inline-block">
                    {format(day, "iiii", { locale: ptBR })}
                  </span>
                </div>
              ))}
            </div>
            {/* Calendar Body */}
            <div className="grid grid-cols-7">
              {calendar.map(({ date, actions }, i) => {
                return (
                  <div key={i} className="rounded p-1">
                    <div
                      className={`mb-2 ${!isSameMonth(parseISO(date), new Date()) ? "opacity-25" : ""}`}
                    >
                      <div
                        className={`grid size-8 place-content-center rounded-full ${isToday(parseISO(date)) ? "bg-primary text-primary-foreground" : ""}`}
                      >
                        {parseISO(date).getDate()}
                      </div>
                    </div>

                    <ListOfActions actions={actions} isHair isFoldable date={{ timeFormat: 1 }} />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function NextActions({ actions }: { actions: Action[] }) {
  const matches = useMatches();
  const { person } = matches[1].data as DashboardRootType;

  return (
    <>
      <div className="border-b"></div>
      <div className="px-2 md:px-8">
        {/* Próximas ações */}
        <div className="py-8 lg:py-24">
          <div className="relative text-center">
            <Heading className="flex justify-center gap-2">
              Próximas Ações
              <Badge value={actions?.length || 0} />
            </Heading>
          </div>
          <ListOfActions
            actions={actions}
            columns={!person.admin ? 1 : 3}
            isFoldable={person.admin}
            orderBy="time"
            date={{ dateFormat: 2 }}
          />
        </div>
      </div>
    </>
  );
}

export function HoursView({ actions }: { actions: Action[] }) {
  return (
    <div className="gap-4 md:grid md:grid-cols-2 xl:grid-cols-4">
      {[
        [0, 1, 2, 3, 4, 5],
        [6, 7, 8, 9, 10, 11],
        [12, 13, 14, 15, 16, 17],
        [18, 19, 20, 21, 22, 23],
      ].map((columns, i) => (
        <div key={i}>
          {columns.map((hour, j) => {
            const hourActions = actions.filter(
              (action) => new Date(action.date).getHours() === hour,
            );
            return (
              <div key={j} className="flex min-h-10 gap-2 border-t py-2">
                <div
                  className={`text-xs font-bold ${
                    hourActions.length === 0 ? "opacity-15" : ""
                  }`}
                >
                  {hour}h
                </div>
                <div className="w-full">
                  <ListOfActions
                    actions={hourActions}
                    showCategory={true}
                    columns={1}
                    date={{
                      dateFormat: 0,
                      timeFormat: 1,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

function DelayedActions({ actions }: { actions: Action[] }) {
  const [order, setOrder] = useState<"state" | "priority" | "time">("state");
  const [view, setView] = useState<"list" | "category">("list");
  const [showSearch, setShowSearch] = useState(false);
  const [query, setQuery] = useState("");
  const [filteredActions, setFiltered] = useState(actions);

  useEffect(() => {
    if (query.length >= 1) {
      const regex = new RegExp(query, "gi");
      setFiltered(() => actions.filter((action) => regex.test(action.title)));
    } else {
      setFiltered(() => actions);
    }
  }, [query, actions]);

  return actions.length > 0 ? (
    <>
      <div className="border-b"></div>
      <div className="px-2 py-8 md:px-8 lg:py-24">
        <div className="flex justify-between pb-8">
          <div className="relative flex">
            <h2 className="text-3xl font-semibold tracking-tight">Atrasados</h2>
            <Badge value={actions.length} />
          </div>

          <div className="flex items-center gap-4">
            <div className="flex gap-2">
              {showSearch && (
                <div className="relative">
                  <Input
                    value={query}
                    onChange={(e) => {
                      setQuery(e.target.value);
                    }}
                    className="pr-12"
                  />
                  <SearchIcon
                    className={`size-4 ${
                      showSearch ? "absolute top-3 right-4" : ""
                    }`}
                  />
                </div>
              )}

              <Button
                variant={"ghost"}
                onClick={() => {
                  setShowSearch(!showSearch);
                  setFiltered(actions);
                  setQuery("");
                }}
              >
                {showSearch ? (
                  <XIcon className={"size-4"} />
                ) : (
                  <SearchIcon className={`size-4`} />
                )}
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-muted-foreground hidden text-[10px] font-semibold tracking-widest uppercase md:block">
                Ordenar por
              </div>
              <Button
                size={"sm"}
                variant={order === "state" ? "secondary" : "ghost"}
                onClick={() => {
                  setOrder("state");
                }}
              >
                <ListTodoIcon className="size-4" />
              </Button>
              <Button
                size={"sm"}
                variant={order === "priority" ? "secondary" : "ghost"}
                onClick={() => {
                  setOrder("priority");
                }}
              >
                <SignalIcon className="size-4" />
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-muted-foreground hidden text-[10px] font-semibold tracking-widest uppercase md:block">
                Categorizar por
              </div>
              <Button
                size={"sm"}
                variant={view === "list" ? "secondary" : "ghost"}
                onClick={() => {
                  setView("list");
                }}
              >
                <ListIcon className="size-4" />
              </Button>
              <Button
                size={"sm"}
                variant={view === "category" ? "secondary" : "ghost"}
                onClick={() => {
                  setView("category");
                }}
              >
                <ComponentIcon className="size-4" />
              </Button>
            </div>
          </div>
        </div>

        {view === "list" ? (
          <ListOfActions
            actions={filteredActions}
            showCategory={true}
            columns={6}
            descending
            orderBy={order}
            showPartner
            date={{ timeFormat: 1 }}
          />
        ) : (
          <CategoriesView actions={filteredActions} />
        )}
      </div>
    </>
  ) : null;
}

function Partners({ actions }: { actions?: Action[] }) {
  const matches = useMatches();
  const { partners } = matches[1].data as DashboardRootType;
  const { actionsChart } = matches[2].data as DashboardPartnerType;
  const lateActions = getDelayedActions({
    actions: actionsChart,
  }) as (ActionChart & {
    partners: string[];
  })[];

  actions = actions || [];

  return (
    <div
      className={`grid grid-cols-4 border-t md:grid-cols-5 ${Math.ceil(partners.length / 2) <= 6 ? "lg:grid-cols-6" : Math.ceil(partners.length / 2) === 7 ? "lg:grid-cols-7" : "lg:grid-cols-8"} `}
    >
      {partners.length > 0
        ? partners.map((partner) => (
            <Link
              to={`/dashboard/${partner.slug}`}
              className="hover:bg-foreground hover:text-background group flex flex-col justify-center p-8"
              key={partner.id}
            >
              <div className="relative self-center text-center text-xl leading-none font-bold uppercase sm:text-3xl">
                {partner.short.length > 4 ? (
                  <>
                    <div>{partner.short.substring(0, 3)}</div>
                    <div> {partner.short.substring(3)} </div>
                  </>
                ) : (
                  <>
                    <div>{partner.short.substring(0, 2)}</div>
                    <div> {partner.short.substring(2)} </div>
                  </>
                )}
                <Badge
                  className="absolute top-0 -right-8"
                  value={
                    lateActions.filter((action) =>
                      action.partners.find((p) => p === partner.slug),
                    ).length
                  }
                  isDynamic
                />
              </div>

              <div className="mt-4 hidden w-full opacity-0 group-hover:opacity-100">
                <ProgressBar
                  actions={actions.filter((action) =>
                    action.partners.find((p) => p === partner.slug),
                  )}
                />
              </div>
            </Link>
          ))
        : null}
    </div>
  );
}

function CategoriesView({ actions }: { actions: Action[] }) {
  const matches = useMatches();
  const { categories } = matches[1].data as DashboardRootType;

  return (
    <div className="grid gap-x-4 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
      {categories.map((category) => (
        <div key={category.slug}>
          <div className="mb-2 flex items-center gap-2">
            {<Icons id={category.slug} className={`size-4`} />}

            <h4 className="font-bold">{category.title}</h4>
          </div>

          <ListOfActions
            actions={actions.filter(
              (action) => action.category === category.slug,
            )}
            isFoldable
            showPartner
            date={{ timeFormat: 1 }}
          />
        </div>
      ))}
    </div>
  );
}

const ActionsProgress = () => {
  const matches = useMatches();

  const { actions, actionsChart } = matches[2].data as DashboardIndexType;

  const todayActions = getTodayActions(actions);
  const tomorrowActions = getTomorrowActions(actions);
  const thisWeekActions = getThisWeekActions(actions);
  const thisMonthActions = getMonthsActions(actions);
  const nextMonthActions = getMonthsActions(actions, addMonths(new Date(), 1));
  const lateActions = getDelayedActions({ actions: actionsChart });

  return (
    <div className="md:flex">
      <Heading className="flex h-full flex-col justify-center border-b px-8 py-8 text-left md:border-none lg:py-12">
        <div className="text-sm tracking-wider uppercase">
          Acompanhamento do
        </div>
        <div className="flex flex-row sm:text-7xl md:flex-col md:text-8xl 2xl:flex-row">
          <div>Pro</div>
          <div>gres</div>
          <div>so</div>
        </div>
      </Heading>

      <div className="grid w-full grid-cols-3 justify-center rounded select-none md:grid-cols-3 lg:col-span-2 2xl:grid-cols-6">
        {[
          {
            title: "Atrasados",
            actions: lateActions,
          },
          {
            title: "Hoje",
            actions: todayActions,
          },
          {
            title: "Amanhã",
            actions: tomorrowActions,
          },
          {
            title: "Semana",
            actions: thisWeekActions,
          },
          {
            title: format(new Date(), "MMMM", { locale: ptBR }),
            actions: thisMonthActions,
          },
          {
            title: format(addMonths(new Date(), 1), "MMMM", {
              locale: ptBR,
            }),
            actions: nextMonthActions,
          },
        ].map(({ actions, title }, i) => (
          <div
            key={i}
            className={`overflow-hidden px-8 py-8 md:border-l lg:py-12 ${i < 3 ? "border-b xl:border-b-0" : ""}`}
          >
            <h3 className="text-xl font-medium capitalize">{title}</h3>
            <div className="my-2 text-7xl font-light">{actions.length}</div>

            <ProgressBar actions={actions} />
          </div>
        ))}
      </div>
    </div>
  );
};

function Sprint() {
  const matches = useMatches();
  let { actions } = useLoaderData<typeof loader>();
  let { sprints } = matches[1].data as DashboardRootType;

  const { sprints: pendingSprints } = usePendingDataSafe();
  const { sprints: deletingIDsSprints } = useIDsToRemoveSafe();

  //Sprints
  // Transform into a Map
  const sprintsMap = new Map<string, Sprint>(
    sprints.map((sprint) => [sprint.action_id, sprint]),
  );
  // Add pending Created/Updated Actions
  for (const sprint of pendingSprints as Sprint[]) {
    sprintsMap.set(sprint.action_id, sprint);
  }
  // Remove pending deleting Actions
  for (const ids of deletingIDsSprints) {
    sprintsMap.delete(ids.action_id);
  }
  // transform
  sprints = Array.from(sprintsMap, ([, v]) => v);

  const [order, setOrder] = useState<ORDER>("state");
  const [descending, setDescending] = useState(false);
  const ids = new Set(sprints?.map((s) => s.action_id));

  actions = actions?.filter((a) => ids.has(a.id)) || [];

  return sprints.length > 0 ? (
    <>
      <div className="border-b"></div>

      <div className="px-2 py-8 md:px-8 lg:py-24">
        <div className="flex items-start justify-between pb-8">
          <div className="relative flex">
            <h2 className="text-3xl font-semibold tracking-tight">Sprints</h2>
          </div>

          <div className="flex items-center gap-2">
            <Select
              value={order}
              onValueChange={(value) => setOrder(value as ORDER)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-content">
                <SelectItem value="state">Status</SelectItem>
                <SelectItem value="priority">Prioridade</SelectItem>
                <SelectItem value="time">Data</SelectItem>
              </SelectContent>
            </Select>
            <Toggle
              pressed={descending}
              variant={"outline"}
              onPressedChange={(pressed) => setDescending(pressed)}
            >
              {descending ? (
                <ArrowDownIcon className="size-4" />
              ) : (
                <ArrowUpIcon className="size-4" />
              )}
            </Toggle>
            {actions.length > 0 && (
              <div
                className={`flex items-center gap-1 rounded p-1 px-4 text-sm font-semibold whitespace-nowrap text-white ${
                  actions.reduce((a, b) => a + b.time, 0) > 70
                    ? "bg-rose-500"
                    : actions.reduce((a, b) => a + b.time, 0) > 30
                      ? "bg-amber-500"
                      : "bg-lime-500"
                }`}
              >
                <TimerIcon className="size-4 opacity-75" />
                <span>{actions.reduce((a, b) => a + b.time, 0)} minutos</span>
              </div>
            )}
          </div>
        </div>

        {actions?.length > 0 ? (
          <BlockOfActions
            actions={actions}
            orderBy={order}
            descending={descending}
          />
        ) : (
          <div className="flex items-center gap-2">
            <RabbitIcon className="size-8 opacity-25" />
            <span>Nenhuma ação no sprint atual</span>
          </div>
        )}
      </div>
    </>
  ) : null;
}

const ProgressBar = ({ actions }: { actions: ActionChart[] }) => {
  const matches = useMatches();
  const { states } = matches[1].data as DashboardRootType;

  return (
    <div className="bg-foreground/20 flex h-1 w-full">
      {states
        .map((state) => {
          return {
            state: state.title,
            actions: actions.filter((action) => action.state === state.slug)
              .length,
            fill: state.color,
          };
        })
        .map((progress) => (
          <div
            key={progress.state}
            style={{
              width: `${(progress.actions / actions.length) * 100}%`,
              backgroundColor: progress.fill,
            }}
          ></div>
        ))}
    </div>
  );
};

const LateActionsCount = ({
  length,
  className,
}: {
  length: number;
  className?: string;
}) => {
  return length > 0 ? (
    <div
      className={cn(
        "bg-foreground text-background group-hover:text-foreground group-hover:bg-background absolute top-0 -right-8 grid size-6 place-content-center rounded-full text-sm font-bold",
        className,
      )}
    >
      {length}
    </div>
  ) : null;
};
