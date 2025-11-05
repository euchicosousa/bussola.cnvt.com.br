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
  PaletteIcon,
  Rows2Icon,
  Rows3Icon,
  Rows4Icon,
  SearchIcon,
  TimerIcon,
  UserIcon,
  UsersIcon,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
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
import { getQueryString } from "~/lib/helpers";
import { isInstagramFeed } from "~/shared/utils/validation/contentValidation";
import { validateAndAdjustActionDates } from "~/shared/utils/validation/dateValidation";

import {
  DndContext,
  type DragEndEvent,
  DragOverlay,
  type DragStartEvent,
  PointerSensor,
  pointerWithin,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { SiInstagram } from "@icons-pack/react-simple-icons";
import EditAction from "~/components/features/actions/EditAction";
import { DateTimePicker } from "~/components/features/actions/shared/ActionContextMenu";
import { DraggableItem } from "~/components/features/actions/shared/DraggableItem";
import { Input } from "~/components/ui/input";
import { useIsMobile } from "~/hooks/use-mobile";
import { IMAGE_SIZES, INTENTS, TIME_FORMAT, VARIANTS } from "~/lib/constants";
import { createClient } from "~/lib/database/supabase";
import {
  Avatar,
  AvatarGroup,
  getCategoriesQueryString,
  getInstagramFeed,
  getResponsibles,
  Icons,
  sortActions,
} from "~/lib/helpers";
import { useIDsToRemoveSafe } from "~/lib/hooks/data/useIDsToRemoveSafe";
import { usePendingDataSafe } from "~/lib/hooks/data/usePendingDataSafe";
import { CelebrationContainer } from "~/components/features/content/CelebrationContainer";

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

  const { data } = await supabase.auth.getClaims();

  if (!data?.claims) {
    return redirect("/login");
  }

  const user_id = data.claims.sub;

  let { data: people } = await supabase
    .from("people")
    .select("*")
    .match({ user_id: user_id });

  invariant(people);

  let person = people[0];

  const [{ data: actions }, { data: actionsChart }, { data: partners }] =
    await Promise.all([
      supabase
        .from("actions")
        .select("*")
        .is("archived", false)
        .contains("responsibles", person?.admin ? [] : [user_id])
        .contains("partners", [params["partner"]!])
        .order("title", { ascending: true }),
      supabase
        .from("actions")
        .select("id, category, state, date, partners, instagram_date")
        .is("archived", false)
        .contains("responsibles", person?.admin ? [] : [user_id])
        .contains("partners", [params["partner"]!]),

      supabase.from("partners").select().match({ slug: params["partner"]! }),
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

  const [searchParams, setSearchParams] = useSearchParams(useLocation().search);
  const [responsiblesFilter, setResponsiblesFilter] = useState<string[]>(
    partner.users_ids,
  );
  const [search, setSearch] = useState<string>("");

  const {
    stateFilter,
    setStateFilter,
    showFeed,
    setShowFeed,
    editingAction,
    setEditingAction,
    categoryFilter,
    setCategoryFilter,
  } = useOutletContext() as ContextType;

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
        // Remove feed if active to avoid conflicts
        newParams.delete("show_feed");
        setShowFeed(false);
        setSearchParams(newParams, { replace: true });
      }
    },
    [
      editingAction,
      navigate,
      searchParams,
      setSearchParams,
      setEditingAction,
      setShowFeed,
    ],
  );

  const fullEditingAction = (actions as Action[])?.find(
    (action) => action.id === editingAction,
  );

  const { categories, states, person, people, celebrations } = matches[1]
    .data as DashboardRootType;

  let params = new URLSearchParams(searchParams);

  const [isInstagramDate, setIsInstagramDate] = useState(
    !!searchParams.get("instagram_date"),
  );
  const [showResponsibles, setShowResponsibles] = useState(
    !!searchParams.get("show_responsibles"),
  );
  const [selectMultiple, setSelectMultiple] = useState(
    !!searchParams.get("select_multiple"),
  );
  const [showAllActions, setShowAllActions] = useState(
    !!searchParams.get("show_all_actions"),
  );

  const [showColor, setShowColor] = useState(!!searchParams.get("show_color"));

  const [selectedActions, setSelectedActions] = useState<Action[]>([]);
  const [currentDate, setCurrentDate] = useState(date);
  const [orderActionsBy, setOrderActionsBy] =
    useState<ORDER_ACTIONS_BY>("date");

  const [variant, setVariant] = useState<ActionVariant>(
    isInstagramDate || showFeed ? VARIANTS.CONTENT : VARIANTS.LINE,
  );

  const [draggedAction, setDraggedAction] = useState<Action | null>(null);

  const { actions: pendingActions } = usePendingDataSafe();
  const { actions: deletingIDsActions } = useIDsToRemoveSafe();

  const isMobile = useIsMobile();

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
  const partnerResponsibles = (partner as Partner).users_ids
    .map((user_id) => people.find((person) => person.user_id === user_id))
    .filter((person): person is Person => person !== undefined);

  const calendar = days.map((day) => {
    return {
      date: format(day, "yyyy-MM-dd"),
      actions: actionsArray?.filter(
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

        if (code === "KeyR") {
          if (params.get("show_responsibles")) {
            setShowResponsibles(false);
            params.delete("show_responsibles");
          } else {
            setShowResponsibles(true);
            params.set("show_responsibles", "true");
          }
          setSearchParams(params);
        } else if (code === "KeyI") {
          if (params.get("show_feed")) {
            setIsInstagramDate(false);
            setShowFeed(false);

            params.delete("show_feed");
            params.delete("instagram_date");
          } else {
            setIsInstagramDate(true);
            setShowFeed(true);

            params.set("instagram_date", "true");
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

  // Instagram date sync - only when instagram_date param changes
  useEffect(() => {
    setIsInstagramDate(!!searchParams.get("instagram_date"));
  }, [searchParams.get("instagram_date")]);

  // Show responsibles sync - only when show_responsibles param changes
  useEffect(() => {
    setShowResponsibles(!!searchParams.get("show_responsibles"));
  }, [searchParams.get("show_responsibles")]);

  // Select multiple sync - only when select_multiple param changes
  useEffect(() => {
    setSelectMultiple(!!searchParams.get("select_multiple"));
  }, [searchParams.get("select_multiple")]);

  // Show all actions sync - only when show_all_actions param changes
  useEffect(() => {
    setShowAllActions(!!searchParams.get("show_all_actions"));
  }, [searchParams.get("show_all_actions")]);
  // Show color sync - only when show_color param changes
  useEffect(() => {
    setShowColor(!!searchParams.get("show_color"));
  }, [searchParams.get("show_color")]);

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

  const handleDragStart = ({ active }: DragStartEvent) => {
    setDraggedAction(actions?.find((action) => action.id === active.id)!);
  };

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    const newDateString = over?.id as string;
    // setDraggedAction(actions?.find((action) => action.id === active.id)!);

    if (!draggedAction) return;

    // Constrói a nova data mantendo o horário original
    const originalTime =
      isInstagramDate && isInstagramFeed(draggedAction.category, true)
        ? format(parseISO(draggedAction.instagram_date), "HH:mm:ss")
        : format(parseISO(draggedAction.date), "HH:mm:ss");

    const newFullDate = parseISO(`${newDateString}T${originalTime}`);
    const currentDate = parseISO(draggedAction.date);
    const currentInstagramDate = parseISO(draggedAction.instagram_date);

    // Verificar se houve mudança real
    const hasChanged =
      isInstagramDate && isInstagramFeed(draggedAction.category, true)
        ? !isSameDay(currentInstagramDate, newFullDate)
        : !isSameDay(currentDate, newFullDate);

    if (hasChanged) {
      // Usar a nova função unificada de validação
      const updates = validateAndAdjustActionDates({
        [isInstagramDate && isInstagramFeed(draggedAction.category, true)
          ? "instagram_date"
          : "date"]: newFullDate,
        currentDate,
        currentInstagramDate,
        currentTime: draggedAction.time,
      });

      submit(
        {
          ...draggedAction,
          intent: INTENTS.updateAction,
          ...updates,
        },
        {
          action: "/handle-actions",
          method: "POST",
          navigate: false,
          fetcherKey: `action:${active.id}:update:move:calendar`,
        },
      );
    }

    setDraggedAction(null);
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: isMobile
        ? {
            delay: 100,
            tolerance: 10,
          }
        : {
            distance: 8,
          },
    }),
  );

  return (
    <div className="flex overflow-hidden">
      <div className={`flex h-full w-full flex-col overflow-hidden`}>
        {/* Calendário Header */}

        <div className="flex items-center justify-between border-b px-4 py-2">
          {/* Mês */}
          <div className="flex items-center">
            <DropdownMenu>
              <DropdownMenuTrigger className="outline-hidden" asChild>
                <Button variant={"ghost"} className={`cursor-pointer text-lg`}>
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
              className="rounded-r-none"
              onClick={() => {
                const date = format(subMonths(currentDate, 1), "yyyy-MM-'15'");
                setCurrentDate(date);
                params.set("date", date);

                setSearchParams(params);
              }}
            >
              <ChevronLeftIcon />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="rounded-l-none"
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
                    setSelectMultiple(false);
                    params.delete("select_multiple");
                  } else {
                    setSelectMultiple(true);
                    params.set("select_multiple", "true");
                  }
                  setSearchParams(params);
                }}
                title={"Selecionar múltiplas ações"}
              >
                <CopyCheckIcon className="size-4" />{" "}
              </Button>
              {/* Organizar pela data do Instagram */}
              <Button
                size={"sm"}
                variant={isInstagramDate ? "secondary" : "ghost"}
                onClick={() => {
                  if (isInstagramDate) {
                    setIsInstagramDate(false);
                    setVariant(VARIANTS.LINE);

                    params.delete("instagram_date");
                  } else {
                    setIsInstagramDate(true);
                    setVariant(VARIANTS.CONTENT);

                    params.set("instagram_date", "true");
                  }
                  setSearchParams(params);
                }}
                title={"Organizar ações pelas datas do Instagram ( ⇧ + ⌥ + I )"}
              >
                <SiInstagram className="size-4" />
              </Button>
              {/* Mostrar responsáveis */}
              <Button
                size={"sm"}
                variant={showResponsibles ? "secondary" : "ghost"}
                onClick={() => {
                  if (showResponsibles) {
                    setShowResponsibles(false);
                    params.delete("show_responsibles");
                  } else {
                    setShowResponsibles(true);
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
                {showResponsibles ? <UsersIcon /> : <UserIcon />}
              </Button>

              <Button
                variant={showColor ? "secondary" : "ghost"}
                size={"icon"}
                onClick={() => {
                  if (showColor) {
                    setShowColor(false);
                    params.delete("show_color");
                  } else {
                    setShowColor(true);
                    params.set("show_color", "true");
                  }

                  setSearchParams(params);
                }}
              >
                <PaletteIcon />
              </Button>
            </div>

            <div className="flex gap-1 px-2">
              <Button
                size={"sm"}
                variant={variant === VARIANTS.CONTENT ? "secondary" : "ghost"}
                onClick={() => {
                  setVariant(VARIANTS.CONTENT);
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
                variant={variant === VARIANTS.BLOCK ? "secondary" : "ghost"}
                onClick={() => {
                  setVariant(VARIANTS.BLOCK);
                }}
              >
                <Rows2Icon className="size-4" />
              </Button>
              <Button
                size={"sm"}
                variant={variant === VARIANTS.LINE ? "secondary" : "ghost"}
                onClick={() => {
                  setVariant(VARIANTS.LINE);
                }}
              >
                <Rows3Icon className="size-4" />
              </Button>
              <Button
                size={"sm"}
                variant={variant === VARIANTS.HAIR ? "secondary" : "ghost"}
                onClick={() => {
                  setVariant(VARIANTS.HAIR);
                }}
              >
                <Rows4Icon className="size-4" />
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
                      <span className="-mr-1 hidden font-normal xl:inline">
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
                      <span className="-mr-1 hidden font-normal xl:inline">
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
        <DndContext
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          sensors={sensors}
          collisionDetection={pointerWithin}
        >
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
                    showColor={showColor}
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
          <DragOverlay
            dropAnimation={{ duration: 150, easing: "ease-in-out" }}
            adjustScale={false}
          >
            {draggedAction && (
              <ActionItem
                action={draggedAction}
                variant={
                  variant === "content" &&
                  !isInstagramFeed(draggedAction.category)
                    ? VARIANTS.LINE
                    : variant
                }
              />
            )}
          </DragOverlay>
        </DndContext>
      </div>

      {/* Sidebar - renderização baseada no estado local */}
      {editingAction && fullEditingAction && !showFeed && (
        <EditAction
          partner={partner}
          action={fullEditingAction}
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
      {showFeed && editingAction === null && (
        <div
          className="relative flex w-full max-w-[480px] min-w-96 flex-col"
          id="instagram-grid"
        >
          {/* Instagram Grid Header */}
          <div className="flex items-center justify-between border-b border-l px-4 py-2.5 leading-none">
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
                    setShowAllActions(false);
                  } else {
                    params.set("show_all_actions", "true");
                    setShowAllActions(true);
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
  showColor,
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
  showColor?: boolean;
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
            <div className="flex flex-col gap-1">
              {day.actions?.filter((action) => isInstagramFeed(action.category))
                .length !== 0 && (
                <>
                  <div className="mb-2 flex items-center gap-1 text-sm font-medium">
                    <Grid3x3Icon className="size-4" />
                    <div>Feed</div>
                  </div>
                  <div className="mb-4 flex flex-col gap-2">
                    {sortActions(
                      day.actions?.filter((action) =>
                        isInstagramFeed(action.category),
                      ) as Action[],
                      orderActionsBy,
                      "asc",
                      states,
                      isInstagramDate,
                    )?.map((action) => (
                      <DraggableItem id={action.id}>
                        <ActionItem
                          variant={variant}
                          selectedActions={selectedActions}
                          editingAction={editingAction}
                          handleEditingAction={handleEditingAction}
                          selectMultiple={selectMultiple}
                          showResponsibles={showResponsibles}
                          showColor={showColor}
                          setSelectedActions={setSelectedActions}
                          showDelay
                          action={action}
                          key={action.id}
                          dateDisplay={{
                            timeFormat: TIME_FORMAT.WITH_TIME,
                          }}
                          isInstagramDate={isInstagramDate}
                          imageSize={IMAGE_SIZES.PREVIEW}
                        />
                      </DraggableItem>
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
                      showColor={showColor}
                      category={category}
                      actions={actions}
                      variant={variant === "content" ? VARIANTS.LINE : variant}
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
                ({ category, actions }) =>
                  actions &&
                  actions.length > 0 && (
                    <CategoryActions
                      orderActionsBy={orderActionsBy}
                      selectedActions={selectedActions}
                      editingAction={editingAction}
                      handleEditingAction={handleEditingAction}
                      selectMultiple={selectMultiple}
                      showResponsibles={showResponsibles}
                      showColor={showColor}
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
          <CelebrationContainer celebrations={day.celebrations} />
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
  showColor,
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
  showColor?: boolean;
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
    actions as Action[],
    orderActionsBy,
    "asc",
    states,
    isInstagramDate,
  ) as Action[];

  return actions && actions.length > 0 ? (
    <div key={category.slug} className="flex flex-col gap-3">
      {!(variant === VARIANTS.CONTENT && isInstagramFeed(category.slug)) && (
        <div className="mt-2 flex items-center gap-1 text-[8px] font-bold tracking-widest uppercase">
          <div>{category.title}</div>
        </div>
      )}

      <div className={`flex flex-col gap-1`}>
        {actions?.map((action) => (
          <DraggableItem id={action.id} key={action.id}>
            <ActionItem
              variant={variant}
              selectedActions={selectedActions}
              editingAction={editingAction}
              handleEditingAction={handleEditingAction}
              selectMultiple={selectMultiple}
              showResponsibles={showResponsibles}
              showColor={showColor}
              showDelay
              action={action}
              dateDisplay={{
                timeFormat: TIME_FORMAT.WITH_TIME,
              }}
              setSelectedActions={setSelectedActions}
              isInstagramDate={isInstagramDate}
            />
          </DraggableItem>
        ))}
      </div>
    </div>
  ) : null;
}
