/* eslint-disable jsx-a11y/label-has-associated-control */
import {
  addMonths,
  eachDayOfInterval,
  eachMonthOfInterval,
  endOfMonth,
  endOfWeek,
  endOfYear,
  format,
  isAfter,
  isBefore,
  isSameDay,
  isSameMonth,
  isSameYear,
  isToday,
  parseISO,
  startOfMonth,
  startOfWeek,
  startOfYear,
  subMonths,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  ArrowDownAZIcon,
  CalendarDaysIcon,
  CalendarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CopyCheckIcon,
  Grid3x3Icon,
  ImageIcon,
  ListCheckIcon,
  Rows2Icon,
  Rows3Icon,
  Rows4Icon,
  SearchIcon,
  TimerIcon,
  UserIcon,
  UsersIcon,
} from "lucide-react";
import { useCallback, useEffect, useId, useState } from "react";
import {
  type LoaderFunctionArgs,
  type MetaFunction,
  redirect,
  useLoaderData,
  useLocation,
  useMatches,
  useNavigate,
  useOutletContext,
  useSearchParams,
  useSubmit,
} from "react-router";
import invariant from "tiny-invariant";
import { ActionItem, type ActionVariant } from "~/components/features/actions";
import { GridOfActions } from "~/components/features/actions/containers/GridOfActions";
import CreateAction from "~/components/features/actions/CreateAction";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { getNewDateValues, getQueryString } from "~/lib/helpers";
import { isInstagramFeed } from "~/shared/utils/validation/contentValidation";

import {
  DndContext,
  type DragEndEvent,
  PointerSensor,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { SiInstagram } from "@icons-pack/react-simple-icons";
import EditAction from "~/components/features/actions/EditAction";
import { DateTimePicker } from "~/components/features/actions/shared/ActionContextMenu";
import { Input } from "~/components/ui/input";
import { INTENTS } from "~/lib/constants";
import { createClient } from "~/lib/database/supabase";
import {
  Avatar,
  AvatarGroup,
  Icons,
  getCategoriesQueryString,
  getInstagramFeed,
  getResponsibles,
  sortActions,
} from "~/lib/helpers";
import { useIDsToRemoveSafe } from "~/lib/hooks/data/useIDsToRemoveSafe";
import { usePendingDataSafe } from "~/lib/hooks/data/usePendingDataSafe";

export const config = { runtime: "edge" };

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  let _date = new URL(request.url).searchParams.get("date");

  let date = _date
    ? _date.split("-").length === 2
      ? _date.concat("-15")
      : _date
    : format(new Date(), "yyyy-MM-dd");

  date = date?.replace(/\-01$/, "-02");

  // let start = startOfWeek(startOfMonth(date));
  // let end = endOfDay(endOfWeek(endOfMonth(date)));

  const { supabase } = createClient(request);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/login");
  }

  let { data } = await supabase
    .from("people")
    .select("*")
    .match({ user_id: user.id })
    .returns<Person[]>();

  invariant(data);

  let person = data[0];

  const [{ data: actions }, { data: actionsChart }, { data: partners }] =
    await Promise.all([
      supabase
        .from("actions")
        .select("*")
        .is("archived", false)
        .contains("responsibles", person?.admin ? [] : [user.id])
        .contains("partners", [params["partner"]!])
        .order("title", { ascending: true })
        .returns<Action[]>(),
      supabase
        .from("actions")
        .select("category, state, date")
        .is("archived", false)
        .contains("responsibles", person?.admin ? [] : [user.id])
        .contains("partners", [params["partner"]!])
        .returns<{ category: string; state: string; date: string }[]>(),
      supabase
        .from("partners")
        .select()
        .match({ slug: params["partner"]! })
        .returns<Partner[]>(),
    ]);
  invariant(partners);

  return { actions, actionsChart, partner: partners[0], person, date };
};

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return [
    { title: data?.partner?.title.concat(" - ʙússoʟa") },
    {
      name: "description",
      content:
        "Aplicativo de Gestão de Projetos Criado e Mantido pela Agência CNVT®. ",
    },
  ];
};

export default function Partner() {
  let { actions, partner, date } = useLoaderData<typeof loader>();

  const matches = useMatches();
  const submit = useSubmit();
  const navigate = useNavigate();
  const id = useId();
  const [searchParams, setSearchParams] = useSearchParams(useLocation().search);
  const [responsiblesFilter, setResponsiblesFilter] = useState<string[]>(
    partner.users_ids,
  );
  const [search, setSearch] = useState<string>("");

  // Hybrid approach: local state for instant UX + URL for persistence
  const [editingAction, setEditingAction] = useState<string | null>(
    searchParams.get("editing_action"),
  );

  // Hybrid editing action handler: instant UX + background URL sync
  const handleEditingAction = useCallback(
    (actionId: string, actionPartnerSlug: string) => {
      if (editingAction === actionId) {
        // Same action clicked - navigate to full page immediately
        navigate(
          `/dashboard/action/${actionId}/${actionPartnerSlug}${getQueryString()}`,
        );
      } else {
        // Different action - update local state FIRST for instant UX
        setEditingAction(actionId);

        // Then sync URL in background without blocking user
        const newParams = new URLSearchParams(searchParams);
        newParams.set("editing_action", actionId);
        newParams.delete("show_feed");
        setSearchParams(newParams, { replace: true });
      }
    },
    [editingAction, navigate, searchParams, setSearchParams, setEditingAction],
  );

  const fullEditingAction = (actions as Action[])?.find(
    (action) => action.id === editingAction,
  );

  const {
    stateFilter,
    setStateFilter,
    showFeed,
    setShowFeed,
    categoryFilter,
    setCategoryFilter,
  } = useOutletContext() as ContextType;

  const { categories, states, person, people, celebrations } = matches[1]
    .data as DashboardRootType;

  let params = new URLSearchParams(searchParams);

  const [isInstagramDate, set_isInstagramDate] = useState(
    !!searchParams.get("instagram_date"),
  );
  const [showResponsibles, set_showResponsibles] = useState(
    !!searchParams.get("show_responsibles"),
  );
  const [selectMultiple, set_selectMultiple] = useState(
    !!searchParams.get("select_multiple"),
  );
  const [showAllActions, set_showAllActions] = useState(
    !!searchParams.get("show_all_actions"),
  );

  console.log({ isInstagramDate });

  const [selectedActions, setSelectedActions] = useState<Action[]>([]);
  const [currentDate, setCurrentDate] = useState(date);
  const [orderActionsBy, setOrderActionsBy] =
    useState<ORDER_ACTIONS_BY>("date");

  const [variant, setVariant] = useState<ActionVariant>(
    isInstagramDate ? "content" : "line",
  );

  const { actions: pendingActions } = usePendingDataSafe();
  const { actions: deletingIDsActions } = useIDsToRemoveSafe();

  // Calcs

  const actionsMap = new Map<string, Action>(
    actions?.map((action) => [action.id, action]),
  );

  for (const action of pendingActions) {
    if (action.partners[0] === partner.slug) actionsMap.set(action.id, action);
  }

  for (const id of deletingIDsActions) {
    actionsMap.delete(id);
  }

  const actionsArray = Array.from(actionsMap.values());
  const sortedActions = sortActions(actionsArray) || actionsArray;
  actions = sortedActions.filter((action) =>
    search.length > 2
      ? action.title.toLowerCase().includes(search.toLowerCase())
      : true,
  );
  const instagramActions = getInstagramFeed({ actions });

  const days = eachDayOfInterval({
    start: startOfWeek(startOfMonth(currentDate)),
    end: endOfWeek(endOfMonth(currentDate)),
  });

  // People of this partner
  const partnerResponsibles = partner.users_ids
    .map((user_id) => people.find((person) => person.user_id === user_id))
    .filter((person): person is Person => person !== undefined);

  const calendar = days.map((day) => {
    return {
      date: format(day, "yyyy-MM-dd"),
      actions: actions?.filter(
        (action) =>
          isSameDay(
            isInstagramDate && isInstagramFeed(action.category, true)
              ? parseISO(action.instagram_date)
              : parseISO(action.date),
            day,
          ) &&
          (categoryFilter.length > 0
            ? categoryFilter.find(
                (category) => category.slug === action.category,
              )
            : true) &&
          (stateFilter ? action.state === stateFilter?.slug : true) &&
          action.responsibles.find((responsible: any) =>
            responsiblesFilter.find((user_id) => user_id === responsible),
          ),
      ),
      celebrations: celebrations.filter((celebration) =>
        isSameDay(day, parseISO(celebration.date)),
      ),
    };
  });

  // Scroll into the current day
  // Atalhos
  useEffect(() => {
    let date = params.get("date");
    date = date
      ? date.split("-").length === 3
        ? date
        : date.concat("-01")
      : format(new Date(), "yyyy-MM-dd");
    const day = document.querySelector<HTMLDivElement>(`#day_${date}`)!;
    const calendar = document.querySelector<HTMLDivElement>(`#calendar`)!;
    const calendarFull =
      document.querySelector<HTMLDivElement>(`#calendar-full`)!;

    if (day) {
      calendarFull.scrollTo({
        left: day.offsetLeft - 48,
        behavior: "smooth",
      });
      calendar.scrollTo({ top: day.offsetTop - 160, behavior: "smooth" });
    }

    function keyDown(event: KeyboardEvent) {
      if (event.shiftKey && event.altKey) {
        event.preventDefault();
        event.stopPropagation();

        const code = event.code;

        if (code === "KeyC") {
          if (params.get("show_content")) {
            params.delete("show_content");
          } else {
            params.set("show_content", "true");
          }
          setSearchParams(params);
        } else if (code === "KeyR") {
          if (params.get("show_responsibles")) {
            set_showResponsibles(false);
            params.delete("show_responsibles");
          } else {
            set_showResponsibles(true);
            params.set("show_responsibles", "true");
          }
          setSearchParams(params);
        } else if (code === "KeyI") {
          if (params.get("show_feed")) {
            set_isInstagramDate(false);
            setShowFeed(false);

            params.delete("show_feed");
            params.delete("instagram_date");
            params.delete("show_content");
          } else {
            set_isInstagramDate(true);
            setShowFeed(true);

            params.set("instagram_date", "true");
            params.set("show_content", "true");
            params.set("show_feed", "true");
          }
          setSearchParams(params);
        }
      }
    }

    document.addEventListener("keydown", keyDown);

    setCategoryFilter([]);

    return () => document.removeEventListener("keydown", keyDown);
  }, []);

  useEffect(() => {
    setResponsiblesFilter(partner.users_ids);
  }, [partner]);

  // Categories filter - only when categories param or categories data changes
  useEffect(() => {
    let _params = searchParams.get("categories")?.split("-");
    let _categories = categories.filter((category) =>
      _params?.find((_p) => _p === category.slug),
    );
    setCategoryFilter(_categories);
  }, [searchParams.get("categories"), categories]);

  // EditingAction sync - only when editing_action param changes (back/forward navigation)
  useEffect(() => {
    setEditingAction(searchParams.get("editing_action"));
  }, [searchParams.get("editing_action")]);

  // Instagram date sync - only when instagram_date param changes
  useEffect(() => {
    set_isInstagramDate(!!searchParams.get("instagram_date"));
  }, [searchParams.get("instagram_date")]);

  // Show responsibles sync - only when show_responsibles param changes
  useEffect(() => {
    set_showResponsibles(!!searchParams.get("show_responsibles"));
  }, [searchParams.get("show_responsibles")]);

  // Select multiple sync - only when select_multiple param changes
  useEffect(() => {
    set_selectMultiple(!!searchParams.get("select_multiple"));
  }, [searchParams.get("select_multiple")]);

  // Show all actions sync - only when show_all_actions param changes
  useEffect(() => {
    set_showAllActions(!!searchParams.get("show_all_actions"));
  }, [searchParams.get("show_all_actions")]);

  // Variant sync - only when show_feed param changes
  useEffect(() => {
    if (searchParams.get("show_feed")) {
      setVariant("content");
    }
  }, [searchParams.get("show_feed")]);

  // Select all actions with Cmd+A when selectMultiple is active
  useEffect(() => {
    if (!selectMultiple) return;

    const handleSelectAll = (event: KeyboardEvent) => {
      if (event.metaKey && event.code === "KeyA") {
        event.preventDefault();
        let actionsToBeSelected: Action[] = [];
        calendar.forEach((day) => {
          day.actions?.forEach((action) => {
            actionsToBeSelected.push(action);
          });
        });
        setSelectedActions(actionsToBeSelected);
      }
    };

    document.addEventListener("keydown", handleSelectAll);
    return () => document.removeEventListener("keydown", handleSelectAll);
  }, [selectMultiple, calendar]);

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    const date = over?.id as string;
    const actionDate = isInstagramDate
      ? (active.data.current?.instagram_date as string)
      : (active.data.current?.date as string);
    const draggedAction = actions?.find((action) => action.id === active.id)!;

    if (date !== format(actionDate, "yyyy-MM-dd")) {
      submit(
        {
          ...draggedAction,
          intent: INTENTS.updateAction,
          [isInstagramDate && isInstagramFeed(active.data.current?.category)
            ? "instagram_date"
            : "date"]: date?.concat(` ${format(actionDate, "HH:mm:ss")}`),
          ...getNewDateValues(
            draggedAction,
            isInstagramDate,
            0,
            true,
            new Date(date?.concat(` ${format(actionDate, "HH:mm:ss")}`)),
          ),
        },
        {
          action: "/handle-actions",
          method: "POST",
          navigate: false,
          fetcherKey: `action:${active.id}:update:move:calendar`,
        },
      );
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
  );

  return (
    <div className="flex overflow-hidden">
      <div className={`flex h-full w-full flex-col overflow-hidden`}>
        {/* Calendário Header */}

        <div className="flex items-center justify-between border-b py-2 pr-4 md:px-8">
          {/* Mês */}
          <div className="flex items-center gap-1">
            <Button
              size="icon"
              variant="ghost"
              onClick={() => {
                const date = format(subMonths(currentDate, 1), "yyyy-MM-'15'");
                setCurrentDate(date);
                params.set("date", date);

                setSearchParams(params);
              }}
            >
              <ChevronLeftIcon />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger className="outline-hidden" asChild>
                <Button
                  variant={"ghost"}
                  className={`cursor-pointer text-xl font-medium`}
                >
                  <span className="shrink-0 capitalize">
                    {format(currentDate, "MMMM", {
                      locale: ptBR,
                    })}
                  </span>
                  {!isSameYear(currentDate, new Date()) && (
                    <span>
                      {format(currentDate, " 'de' yyyy", { locale: ptBR })}
                    </span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-content">
                {eachMonthOfInterval({
                  start: startOfYear(new Date()),
                  end: endOfYear(new Date()),
                }).map((month) => (
                  <DropdownMenuItem
                    className="bg-item capitalize"
                    key={month.getMonth()}
                    onSelect={() => {
                      const date = format(
                        new Date().setMonth(month.getMonth()),
                        "yyyy-MM-'15'",
                      );
                      setCurrentDate(date);

                      params.set("date", date);
                      setSearchParams(params);
                    }}
                  >
                    {format(month, "MMMM", {
                      locale: ptBR,
                    })}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              size="icon"
              variant="ghost"
              onClick={() => {
                const date = format(addMonths(currentDate, 1), "yyyy-MM-'15'");
                setCurrentDate(date);
                params.set("date", date);

                setSearchParams(params);
              }}
            >
              <ChevronRightIcon />
            </Button>
          </div>
          <div className="flex items-center gap-1 lg:gap-2">
            {/* Procurar ação */}
            <div className="relative">
              <Input
                placeholder="Procurar ação"
                className="h-8 border pr-8"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <SearchIcon className="absolute top-1/2 right-2 size-4 -translate-y-1/2" />
            </div>
            <div className="flex gap-1 px-2">
              {/* Selecione ações */}
              {selectedActions.length > 0 && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant={"ghost"}>
                      <span>
                        {selectedActions.length}
                        {selectedActions.length === 1 ? " ação" : " ações"}
                        <span className="hidden md:inline">
                          {selectedActions.length === 1
                            ? " selecionada"
                            : " selecionadas"}
                        </span>
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-content">
                    {/* Mudar State */}
                    <DropdownMenuSub>
                      <DropdownMenuSubTrigger className="bg-item">
                        Mudar Status
                      </DropdownMenuSubTrigger>
                      {/* <DropdownMenuPortal> */}
                      <DropdownMenuSubContent className="bg-content">
                        {states.map((state) => (
                          <DropdownMenuItem
                            key={state.slug}
                            className="bg-item"
                            onSelect={() => {
                              submit(
                                {
                                  intent: INTENTS.updateActions,
                                  state: state.slug,
                                  ids: selectedActions
                                    .map((a) => a.id)
                                    .join(","),
                                },
                                {
                                  action: "/handle-actions",
                                  method: "POST",
                                  navigate: false,
                                  fetcherKey: `action:update:state`,
                                },
                              );
                            }}
                          >
                            <div
                              className={`h-2 w-2 rounded-full`}
                              style={{ backgroundColor: state.color }}
                            ></div>
                            <div>{state.title}</div>
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuSubContent>
                      {/* </DropdownMenuPortal> */}
                    </DropdownMenuSub>
                    {/* Mudar Categoria */}
                    <DropdownMenuSub>
                      <DropdownMenuSubTrigger className="bg-item">
                        Mudar Categoria
                      </DropdownMenuSubTrigger>
                      {/* <DropdownMenuPortal> */}
                      <DropdownMenuSubContent className="bg-content">
                        {categories.map((category) => (
                          <DropdownMenuItem
                            key={category.slug}
                            className="bg-item"
                            onSelect={() => {
                              submit(
                                {
                                  intent: INTENTS.updateActions,
                                  category: category.slug,
                                  ids: selectedActions
                                    .map((a) => a.id)
                                    .join(","),
                                },
                                {
                                  action: "/handle-actions",
                                  method: "POST",
                                  navigate: false,
                                  fetcherKey: `action:update:category`,
                                },
                              );
                            }}
                          >
                            <Icons className="size-3" id={category.slug} />
                            <div>{category.title}</div>
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuSubContent>
                      {/* </DropdownMenuPortal> */}
                    </DropdownMenuSub>
                    {/* Mudar a Data */}
                    <DropdownMenuSub>
                      <DropdownMenuSubTrigger className="bg-item">
                        Mudar Data
                      </DropdownMenuSubTrigger>

                      <DropdownMenuSubContent className="bg-content">
                        <DateTimePicker
                          onSave={(selected) => {
                            submit(
                              {
                                intent: INTENTS.updateActions,
                                date: format(selected, "yyyy-MM-dd HH:mm:ss"),
                                ids: selectedActions.map((a) => a.id).join(","),
                              },
                              {
                                action: "/handle-actions",
                                method: "POST",
                                navigate: false,
                                fetcherKey: `action:update:category`,
                              },
                            );
                          }}
                        />
                      </DropdownMenuSubContent>
                    </DropdownMenuSub>
                    {/* Mudar a data do Instagram */}

                    {selectedActions.filter((action) =>
                      isInstagramFeed(action.category, true),
                    ).length === selectedActions.length && (
                      <DropdownMenuSub>
                        <DropdownMenuSubTrigger className="bg-item">
                          Mudar Data do Instagram
                        </DropdownMenuSubTrigger>

                        <DropdownMenuSubContent className="bg-content">
                          <DateTimePicker
                            onSave={(selected) => {
                              submit(
                                {
                                  intent: INTENTS.updateActions,
                                  instagram_date: format(
                                    selected,
                                    "yyyy-MM-dd HH:mm:ss",
                                  ),
                                  ids: selectedActions
                                    .map((a) => a.id)
                                    .join(","),
                                },
                                {
                                  action: "/handle-actions",
                                  method: "POST",
                                  navigate: false,
                                  fetcherKey: `action:update:category`,
                                },
                              );
                            }}
                          />
                        </DropdownMenuSubContent>
                      </DropdownMenuSub>
                    )}
                    {/* Mudar Responsável */}
                    <DropdownMenuSub>
                      <DropdownMenuSubTrigger className="bg-item">
                        Mudar Responsável
                      </DropdownMenuSubTrigger>
                      {/* <DropdownMenuPortal> */}
                      <DropdownMenuSubContent className="bg-content">
                        {partnerResponsibles.map((person) => (
                          <DropdownMenuItem
                            key={person.id}
                            className="bg-item"
                            onSelect={() => {
                              submit(
                                {
                                  intent: INTENTS.updateActions,
                                  responsibles: person.user_id,
                                  ids: selectedActions
                                    .map((a) => a.id)
                                    .join(","),
                                },
                                {
                                  action: "/handle-actions",
                                  method: "POST",
                                  navigate: false,
                                  fetcherKey: `action:update:responsible`,
                                },
                              );
                            }}
                          >
                            <div className="flex items-center gap-2">
                              <Avatar
                                item={{
                                  image: person.image || undefined,
                                  short: person.initials!,
                                }}
                              />
                              <div>
                                {person.name} {person.surname}
                              </div>
                            </div>
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuSubContent>
                      {/* </DropdownMenuPortal> */}
                    </DropdownMenuSub>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="bg-item"
                      onSelect={() => {
                        setSelectedActions([]);
                      }}
                    >
                      Limpar Seleção
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
              {/* Botão de seleção de ações */}
              <Button
                size={"sm"}
                variant={selectMultiple ? "secondary" : "ghost"}
                onClick={() => {
                  if (selectMultiple) {
                    setSelectedActions([]);
                    set_selectMultiple(false);
                    params.delete("select_multiple");
                  } else {
                    set_selectMultiple(true);
                    params.set("select_multiple", "true");
                  }
                  setSearchParams(params);
                }}
                title={"Selecionar múltiplas ações"}
              >
                <CopyCheckIcon className="size-4" />{" "}
              </Button>
            </div>

            <div className="flex gap-1 px-2">
              <Button
                size={"sm"}
                variant={isInstagramDate ? "secondary" : "ghost"}
                onClick={() => {
                  if (isInstagramDate) {
                    set_isInstagramDate(false);
                    setVariant("line");

                    params.delete("instagram_date");
                  } else {
                    set_isInstagramDate(true);
                    setVariant("content");

                    console.log("Instagram Date");

                    params.set("instagram_date", "true");
                  }
                  setSearchParams(params);
                }}
                title={"Organizar ações pelas datas do Instagram ( ⇧ + ⌥ + I )"}
              >
                <SiInstagram className="size-4" />
              </Button>
            </div>

            <div className="flex gap-1 px-2">
              <Button
                size={"sm"}
                variant={variant === "content" ? "secondary" : "ghost"}
                onClick={() => {
                  setVariant("content");
                  // if (showInstagramContent) {
                  //   set_showInstagramContent(false);
                  //   params.delete("show_content");
                  // } else {
                  //   set_showInstagramContent(true);
                  //   params.set("show_content", "true");
                  // }
                  // setSearchParams(params);
                }}
                title={
                  isInstagramDate
                    ? "Mostrar conteúdo das postagens (⇧ + ⌥ + C)"
                    : "Mostrar apenas os títulos (⇧ + ⌥ + C)"
                }
              >
                <ImageIcon className="size-4" />
              </Button>
              <Button
                size={"sm"}
                variant={variant === "block" ? "secondary" : "ghost"}
                onClick={() => {
                  setVariant("block");
                }}
              >
                <Rows2Icon className="size-4" />
              </Button>
              <Button
                size={"sm"}
                variant={variant === "line" ? "secondary" : "ghost"}
                onClick={() => {
                  setVariant("line");
                }}
              >
                <Rows3Icon className="size-4" />
              </Button>
              <Button
                size={"sm"}
                variant={variant === "hair" ? "secondary" : "ghost"}
                onClick={() => {
                  setVariant("hair");
                }}
              >
                <Rows4Icon className="size-4" />
              </Button>
            </div>

            <div className="flex gap-1 px-2">
              <Button
                size={"sm"}
                variant={showResponsibles ? "secondary" : "ghost"}
                onClick={() => {
                  if (showResponsibles) {
                    set_showResponsibles(false);
                    params.delete("show_responsibles");
                  } else {
                    set_showResponsibles(true);
                    params.set("show_responsibles", "true");
                  }

                  setSearchParams(params);
                }}
                title={
                  showResponsibles
                    ? "Todos os responsáveis (⇧ + ⌥ + R) "
                    : "'Eu' como responsável (⇧ + ⌥ + R) "
                }
              >
                {showResponsibles ? (
                  <UsersIcon className="size-4" />
                ) : (
                  <UserIcon className="size-4" />
                )}
              </Button>
            </div>
            <div className="flex gap-1 px-2">
              <Button
                size={"sm"}
                variant={orderActionsBy === "title" ? "secondary" : "ghost"}
                onClick={() => {
                  setOrderActionsBy("title");
                }}
              >
                <ArrowDownAZIcon className="size-4" />
              </Button>
              <Button
                size={"sm"}
                variant={orderActionsBy === "date" ? "secondary" : "ghost"}
                onClick={() => {
                  setOrderActionsBy("date");
                }}
              >
                <TimerIcon className="size-4" />
              </Button>
              <Button
                size={"sm"}
                variant={orderActionsBy === "state" ? "secondary" : "ghost"}
                onClick={() => {
                  setOrderActionsBy("state");
                }}
              >
                <ListCheckIcon className="size-4" />
              </Button>
            </div>
            {/* Filtrar por Responsáveis */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  size={"sm"}
                  variant={
                    partner.users_ids.length !== responsiblesFilter.length
                      ? "secondary"
                      : "ghost"
                  }
                  className={`outline-none`}
                >
                  {
                    <AvatarGroup
                      avatars={getResponsibles(people, responsiblesFilter).map(
                        (person) => ({
                          item: {
                            short: person.short,
                            image: person.image || undefined,
                            title: `${person.name} ${person.surname}`,
                          },
                          className:
                            partner.users_ids.length !==
                            responsiblesFilter.length
                              ? "ring-secondary"
                              : "ring-background",
                        }),
                      )}
                    />
                  }
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuPortal>
                <DropdownMenuContent className="bg-content">
                  <DropdownMenuCheckboxItem
                    className="bg-select-item flex items-center gap-2"
                    checked={
                      responsiblesFilter.length ===
                      getResponsibles(people, partner.users_ids).length
                    }
                    onClick={() => {
                      setResponsiblesFilter(partner.users_ids);
                    }}
                  >
                    Todos os Responsáveis
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuSeparator className="border-foreground/20" />
                  {getResponsibles(people, partner.users_ids).map((person) => {
                    return (
                      <DropdownMenuCheckboxItem
                        key={person.id}
                        className="bg-select-item flex items-center gap-2"
                        checked={
                          responsiblesFilter?.find(
                            (user_id) => user_id === person.user_id,
                          )
                            ? true
                            : false
                        }
                        onClick={(event) => {
                          const checked = responsiblesFilter.includes(
                            person.user_id,
                          );

                          // Se so tiver um e ele for desmarcado, mostra todos

                          if (checked && responsiblesFilter.length === 1) {
                            setResponsiblesFilter(partner.users_ids);
                          }
                          // Se o shift estiver sendo pressionado, mostra apenas aquele usuário
                          if (event.shiftKey) {
                            setResponsiblesFilter([person.user_id]);
                          } else {
                            const tempResponsibles = checked
                              ? responsiblesFilter.filter(
                                  (id) => id !== person.user_id,
                                )
                              : [...responsiblesFilter, person.user_id];
                            setResponsiblesFilter(tempResponsibles);
                          }
                        }}
                      >
                        <Avatar
                          item={{
                            image: person.image || undefined,
                            short: person.initials!,
                          }}
                          size="sm"
                        />
                        {`${person.name} ${person.surname}`}
                      </DropdownMenuCheckboxItem>
                    );
                  })}
                </DropdownMenuContent>
              </DropdownMenuPortal>
            </DropdownMenu>
            {/* Filtrar pelo Status */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  size={"sm"}
                  variant={"ghost"}
                  className={`border-2 text-xs font-bold`}
                  style={{
                    borderColor: stateFilter
                      ? stateFilter.color
                      : "transparent",
                  }}
                >
                  {stateFilter ? (
                    stateFilter.title
                  ) : (
                    <>
                      <span className="-mr-1 hidden font-normal md:inline">
                        Filtrar pelo
                      </span>
                      Status
                    </>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-content">
                <DropdownMenuItem
                  className="bg-item"
                  onSelect={() => {
                    setStateFilter(undefined);
                  }}
                >
                  <div className={`size-2 rounded-full bg-gray-500`}></div>
                  <div>Todos os Status</div>
                </DropdownMenuItem>
                {states.map((state) => (
                  <DropdownMenuItem
                    className="bg-item"
                    key={state.slug}
                    onSelect={() => setStateFilter(state)}
                  >
                    <div
                      className={`h-2 w-2 rounded-full`}
                      style={{
                        backgroundColor: state.color,
                      }}
                    ></div>
                    <div>{state.title}</div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            {/* Filtrar por Categorias */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  size={"sm"}
                  variant={categoryFilter.length > 0 ? "secondary" : "ghost"}
                  className={`text-xs font-bold`}
                >
                  {categoryFilter.length > 0 ? (
                    <>
                      <div>
                        {categoryFilter
                          .map((category) => category.title)
                          .join(", ")}
                      </div>
                    </>
                  ) : (
                    <>
                      <span className="-mr-1 hidden font-normal md:inline">
                        Filtrar pela
                      </span>
                      Categoria
                    </>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-content">
                <DropdownMenuCheckboxItem
                  className="bg-select-item flex gap-2"
                  checked={categoryFilter?.length == 0}
                  onCheckedChange={() => {
                    params.delete("categories");
                    setSearchParams(params);
                    setCategoryFilter([]);
                  }}
                >
                  <Icons className="h-3 w-3" id="all" />
                  <div>Todas as Categorias</div>
                </DropdownMenuCheckboxItem>
                {/* Mostra apenas as categorias de feed */}
                <DropdownMenuCheckboxItem
                  className="bg-select-item flex gap-2"
                  checked={
                    categoryFilter
                      ? categoryFilter.filter((cf) => isInstagramFeed(cf.id))
                          .length === 3
                      : false
                  }
                  onCheckedChange={(checked) => {
                    if (checked) {
                      let _categories = categories.filter((category) =>
                        isInstagramFeed(category.slug),
                      );
                      params.set(
                        "categories",
                        _categories.map((_c) => _c.slug).join("-"),
                      );
                      setSearchParams(params);
                      setCategoryFilter(_categories);
                    } else {
                      params.delete("categories");
                      setSearchParams(params);
                    }
                  }}
                >
                  <Grid3x3Icon className="h-3 w-3" />
                  <div>Feed do Instagram</div>
                </DropdownMenuCheckboxItem>
                <DropdownMenuSeparator className="border-t" />
                {categories.map((category) => (
                  <DropdownMenuCheckboxItem
                    className="bg-select-item flex gap-2"
                    key={category.slug}
                    checked={
                      categoryFilter
                        ? categoryFilter?.findIndex(
                            (c) => category.slug === c.slug,
                          ) >= 0
                        : false
                    }
                    onCheckedChange={(checked) => {
                      if (checked) {
                        params.set(
                          "categories",
                          getCategoriesQueryString(category.slug),
                        );
                      } else {
                        let _categories_slugs = getCategoriesQueryString();
                        _categories_slugs = _categories_slugs
                          .split("-")
                          .filter((c) => c !== category.slug && c !== "")
                          .join("-");
                        params.set("categories", _categories_slugs);

                        setCategoryFilter(
                          categories.filter((c) =>
                            _categories_slugs
                              .split("-")
                              .find((_c) => _c === c.slug),
                          ),
                        );
                      }
                      setSearchParams(params);
                    }}
                  >
                    <Icons id={category.slug} className="h-3 w-3" />
                    <div>{category.title}</div>
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Calendário */}
        <DndContext onDragEnd={handleDragEnd} sensors={sensors} id={id}>
          <div className="overflow-x-auto overflow-y-hidden">
            <div
              className="main-container flex h-full w-full min-w-[1200px] flex-col"
              id="calendar-full"
            >
              {/* Dias do Calendário */}
              <div
                className={`grid grid-cols-7 border-b px-4 py-2 text-xs font-bold tracking-wider uppercase md:px-8`}
              >
                {eachDayOfInterval({
                  start: startOfWeek(new Date()),
                  end: endOfWeek(new Date()),
                }).map((day, j) => {
                  return (
                    <div
                      key={j}
                      className={
                        day.getDay() === new Date().getDay()
                          ? ""
                          : "text-muted-foreground"
                      }
                    >
                      {format(day, "EEE", {
                        locale: ptBR,
                      })}
                    </div>
                  );
                })}
              </div>
              {/* Calendário Content */}
              <div
                id="calendar"
                className={`grid grid-cols-7 overflow-y-auto pb-32`}
              >
                {calendar.map((day, i) => (
                  <CalendarDay
                    variant={variant}
                    orderActionsBy={orderActionsBy}
                    currentDate={currentDate}
                    day={day}
                    person={person}
                    showResponsibles={showResponsibles}
                    key={i}
                    index={i}
                    selectMultiple={selectMultiple}
                    selectedActions={selectedActions}
                    setSelectedActions={setSelectedActions}
                    editingAction={editingAction}
                    handleEditingAction={handleEditingAction}
                    isInstagramDate={isInstagramDate}
                  />
                ))}
              </div>
            </div>
          </div>
        </DndContext>
      </div>

      {editingAction && !showFeed && (
        <EditAction
          partner={partner}
          action={fullEditingAction!}
          setClose={() => {
            // Close instantly for UX
            setEditingAction(null);

            // Sync URL in background
            const newParams = new URLSearchParams(searchParams);
            newParams.delete("editing_action");
            setSearchParams(newParams, { replace: true });
          }}
        />
      )}

      {/* Instagram Grid */}
      {showFeed && !editingAction && (
        <div
          className="relative flex w-full max-w-[480px] min-w-96 flex-col"
          id="instagram-grid"
        >
          {/* Instagram Grid Header */}
          <div className="flex items-center justify-between border-b px-4 py-2.5 leading-none">
            <div className="flex items-center gap-2">
              <div>
                <Avatar
                  item={{
                    short: partner.short,
                    bg: partner.colors[0],
                    fg: partner.colors[1],
                  }}
                  size="md"
                />
              </div>
              <div>
                <div className="font-medium">{partner.title}</div>
                <div className="text-xs">@{partner.slug}</div>
              </div>
            </div>
            <div>
              <Button
                size={"sm"}
                title={
                  showAllActions
                    ? "Mostrar apenas ações deste período"
                    : "Mostrar todas as ações"
                }
                variant={showAllActions ? "default" : "ghost"}
                onClick={() => {
                  if (showAllActions) {
                    params.delete("show_all_actions");
                    set_showAllActions(false);
                  } else {
                    params.set("show_all_actions", "true");
                    set_showAllActions(true);
                  }

                  setSearchParams(params);
                }}
              >
                {showAllActions ? <CalendarDaysIcon /> : <CalendarIcon />}
              </Button>
            </div>
          </div>

          {/* Instagram Grid Content */}
          <div className="overflow-hidden border-l px-3 py-3">
            <GridOfActions
              partner={partner}
              actions={
                showAllActions
                  ? (instagramActions as Action[])
                  : (instagramActions as Action[]).filter(
                      (action) =>
                        isAfter(
                          action.instagram_date,
                          startOfWeek(startOfMonth(currentDate)),
                        ) &&
                        isBefore(
                          action.instagram_date,
                          endOfWeek(endOfMonth(currentDate)),
                        ),
                    )
              }
            />
          </div>
        </div>
      )}
    </div>
  );
}

export const CalendarDay = ({
  day,
  currentDate,
  showResponsibles,
  index,
  setSelectedActions,
  selectMultiple,
  editingAction,
  handleEditingAction,
  selectedActions,
  orderActionsBy,
  variant,
  isInstagramDate,
}: {
  day: { date: string; actions?: Action[]; celebrations?: Celebration[] };
  currentDate: Date | string;
  person: Person;
  showResponsibles?: boolean;
  index?: string | number;
  selectMultiple?: boolean;
  setSelectedActions: React.Dispatch<React.SetStateAction<Action[]>>;
  editingAction?: string | null;
  handleEditingAction?: (actionId: string, actionPartnerSlug: string) => void;
  selectedActions?: Action[];
  orderActionsBy?: ORDER_ACTIONS_BY;
  variant?: ActionVariant;
  isInstagramDate?: boolean;
}) => {
  const matches = useMatches();
  const { categories, states } = matches[1].data as DashboardRootType;

  const { setNodeRef, isOver } = useDroppable({
    id: `${format(parseISO(day.date), "yyyy-MM-dd")}`,
  });

  const today = isToday(parseISO(day.date));

  return (
    <div
      ref={setNodeRef}
      id={`day_${format(parseISO(day.date), "yyyy-MM-dd")}`}
      className={`group/day hover:bg-secondary/20 relative flex h-full flex-col border-b py-2 transition ${
        Math.floor(Number(index) / 7) % 2 === 0 ? "item-even" : "item-odd"
      } ${isOver ? "dragover" : ""} ${today && "bg-secondary/50 border-t-foreground border-t"}`}
      data-date={format(parseISO(day.date), "yyyy-MM-dd")}
    >
      {/* Date */}
      <div className="mb-4 flex items-center justify-between px-4">
        <div
          className={`grid place-content-center rounded-full text-xl ${
            today
              ? "text-primary font-medium"
              : `font-light ${
                  !isSameMonth(parseISO(day.date), currentDate)
                    ? "text-muted"
                    : ""
                } `
          }`}
        >
          {parseISO(day.date).getDate()}
        </div>
        <div className="scale-50 opacity-0 group-hover/day:scale-100 group-hover/day:opacity-100 focus-within:scale-100 focus-within:opacity-100">
          <CreateAction mode="day" date={day.date} />
        </div>
      </div>
      {/* Actions and Celebration */}
      <div className="flex h-full flex-col justify-between px-2">
        <div className="relative flex h-full grow flex-col gap-3">
          {/* Se for par amostrar o conteúdo estilo Instagram */}
          {isInstagramDate ? (
            <div className="flex flex-col">
              {day.actions?.filter((action) => isInstagramFeed(action.category))
                .length !== 0 && (
                <>
                  <div className="mb-2 flex items-center gap-1 text-sm font-medium">
                    <Grid3x3Icon className="size-4" />
                    <div>Feed</div>
                  </div>
                  <div className="mb-4 flex flex-col gap-1">
                    {sortActions(
                      day.actions?.filter((action) =>
                        isInstagramFeed(action.category),
                      ),
                      orderActionsBy,
                      "asc",
                      states,
                      isInstagramDate,
                    )?.map((action) => (
                      <ActionItem
                        variant={variant}
                        selectedActions={selectedActions}
                        editingAction={editingAction}
                        handleEditingAction={handleEditingAction}
                        selectMultiple={selectMultiple}
                        showResponsibles={showResponsibles}
                        setSelectedActions={setSelectedActions}
                        showDelay
                        action={action}
                        key={action.id}
                        date={{
                          timeFormat: 1,
                        }}
                        isInstagramDate={isInstagramDate}
                      />
                    ))}
                  </div>
                </>
              )}
              <div className="flex flex-col gap-3">
                {categories
                  .filter((category) => !isInstagramFeed(category.slug))
                  .map((category) => ({
                    category,
                    actions: day.actions?.filter(
                      (action) => category.slug === action.category,
                    ),
                  }))
                  .map(({ category, actions }) => (
                    <CategoryActions
                      orderActionsBy={orderActionsBy}
                      selectedActions={selectedActions}
                      editingAction={editingAction}
                      handleEditingAction={handleEditingAction}
                      selectMultiple={selectMultiple}
                      showResponsibles={showResponsibles}
                      category={category}
                      actions={actions}
                      variant={variant === "content" ? "line" : variant}
                      isInstagramDate={isInstagramDate}
                      key={category.id}
                      setSelectedActions={setSelectedActions}
                    />
                  ))}
              </div>
            </div>
          ) : (
            categories
              .map((category) => ({
                category,
                actions: day.actions?.filter(
                  (action) => category.slug === action.category,
                ),
              }))
              .map(
                ({ category, actions }, i) =>
                  actions &&
                  actions.length > 0 && (
                    <CategoryActions
                      orderActionsBy={orderActionsBy}
                      selectedActions={selectedActions}
                      editingAction={editingAction}
                      handleEditingAction={handleEditingAction}
                      selectMultiple={selectMultiple}
                      showResponsibles={showResponsibles}
                      category={category}
                      isInstagramDate={isInstagramDate}
                      actions={actions}
                      key={category.id}
                      setSelectedActions={setSelectedActions}
                      variant={variant}
                    />
                  ),
              )
          )}
        </div>

        {day.celebrations && day.celebrations.length > 0 && (
          <div className="mt-4 space-y-2 text-[10px] opacity-50">
            {day.celebrations?.map((celebration) => (
              <div key={celebration.id} className="leading-none">
                {celebration.title}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

function CategoryActions({
  category,
  actions,
  variant,
  showResponsibles,
  setSelectedActions,
  selectMultiple = false,
  editingAction,
  handleEditingAction,
  selectedActions,
  orderActionsBy,
  isInstagramDate,
}: {
  category: Category;
  actions?: Action[];
  variant?: ActionVariant;
  showResponsibles?: boolean;
  selectMultiple?: boolean;
  setSelectedActions: React.Dispatch<React.SetStateAction<Action[]>>;
  editingAction?: string | null;
  handleEditingAction?: (actionId: string, actionPartnerSlug: string) => void;
  selectedActions?: Action[];
  orderActionsBy?: ORDER_ACTIONS_BY;
  isInstagramDate?: boolean;
}) {
  // actions = actions?.sort((a, b) =>
  //   isAfter(a.instagram_date, b.instagram_date) ? 1 : -1,
  // );

  const { states } = useMatches()[1].data as DashboardRootType;

  actions = sortActions(
    actions,
    orderActionsBy,
    "asc",
    states,
    isInstagramDate,
  ) as Action[];

  return actions && actions.length > 0 ? (
    <div key={category.slug} className="flex flex-col gap-3">
      {!(variant === "content" && isInstagramFeed(category.slug)) && (
        <div className="mt-2 flex items-center gap-1 text-[8px] font-bold tracking-widest uppercase">
          <div>{category.title}</div>
        </div>
      )}

      <div className={`flex flex-col gap-1`}>
        {actions?.map((action) => (
          <ActionItem
            variant={variant}
            selectedActions={selectedActions}
            editingAction={editingAction}
            handleEditingAction={handleEditingAction}
            selectMultiple={selectMultiple}
            showResponsibles={showResponsibles}
            showDelay
            action={action}
            key={action.id}
            date={{
              timeFormat: 1,
            }}
            setSelectedActions={setSelectedActions}
            isInstagramDate={isInstagramDate}
          />
        ))}
      </div>
    </div>
  ) : null;
}
