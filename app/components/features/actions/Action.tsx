import {
  addHours,
  addMinutes,
  format,
  formatDistanceToNow,
  isAfter,
  isBefore,
  isSameYear,
  parseISO,
  subHours,
} from "date-fns";
import {
  Link,
  useMatches,
  useNavigate,
  useSearchParams,
  useSubmit,
} from "react-router";

import { useDraggable } from "@dnd-kit/core";
import { ptBR } from "date-fns/locale";
import {
  ArchiveRestoreIcon,
  CalendarClock,
  CopyIcon,
  ExpandIcon,
  Grid3x3Icon,
  HeartHandshakeIcon,
  PencilLineIcon,
  RabbitIcon,
  ShrinkIcon,
  TimerIcon,
  TrashIcon,
} from "lucide-react";
import React, {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useIsMobile } from "~/lib/hooks/ui/useIsMobile";
import { flushSync } from "react-dom";
import {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuPortal,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "~/components/ui/context-menu";
import { INTENTS, PRIORITIES } from "~/lib/constants";
import {
  amIResponsible,
  Avatar,
  AvatarGroup,
  Content,
  FinishedCheck,
  getActionsByPriority,
  getActionsByState,
  getActionsByTime,
  getPartners,
  getQueryString,
  getResponsibles,
  Icons,
  isInstagramFeed,
  isSprint,
  LikeFooter,
} from "~/lib/helpers";
import { cn } from "~/lib/ui/utils";
import { Calendar } from "~/components/ui/calendar";
import { Checkbox } from "~/components/ui/checkbox";
import { Toggle } from "~/components/ui/toggle";
import { toast } from "~/components/ui/use-toast";

import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";

// Constants
const DEFAULT_UPDATE_TIMESTAMP = () =>
  format(new Date(), "yyyy-MM-dd HH:mm:ss");
const FOLD_MULTIPLIER = 4;
const HOURS_TO_MINUTES = 60;
const DAY_TO_MINUTES = 24 * 60;
const WEEK_TO_MINUTES = 7 * 24 * 60;
const MONTH_TO_MINUTES = 30 * 24 * 60;

export const ActionLine = React.memo(function ActionLine({
  action,
  date,
  short,
  long,
  showResponsibles,
  showCategory,
  showDelay,
  showContent,
  showPartner,
  isHair,
  selectMultiple,
  setSelectedActions,
  editingAction,
  setEditingAction,
}: {
  action: Action;
  date?: dateTimeFormat;
  short?: boolean;
  long?: boolean;
  showResponsibles?: boolean;
  showCategory?: boolean;
  showDelay?: boolean;
  showContent?: boolean;
  showPartner?: boolean;
  isHair?: boolean;
  selectMultiple?: boolean;
  setSelectedActions?: React.Dispatch<React.SetStateAction<string[]>>;
  editingAction?: string | null;
  setEditingAction?: React.Dispatch<React.SetStateAction<string | null>>;
}) {
  const navigate = useNavigate();
  const submit = useSubmit();
  const matches = useMatches();
  const [searchParams, setSearchParams] = useSearchParams();
  let params = new URLSearchParams(searchParams);

  const [edit, setEdit] = useState(false);
  const [isHover, setHover] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const isMobile = useIsMobile();

  const isInstagramDate = isHydrated
    ? searchParams.get("instagram_date")
    : null;

  const { states, categories, person, people, priorities, partners, sprints } =
    matches[1].data as DashboardRootType;

  const inputRef = useRef<HTMLInputElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const state = states.find((state) => state.slug === action.state) as State;

  if (!state) {
    return false;
  }

  const partner = partners.find(
    (partner) => partner.slug === action.partners[0],
  ) as Partner;

  const responsibles = useMemo(
    () => getResponsibles(people, action.responsibles),
    [people, action.responsibles],
  );

  const handleActions = useCallback(
    (data: HandleActionsDataType) => {
      submit(
        { ...data, updated_at: DEFAULT_UPDATE_TIMESTAMP() },
        {
          action: "/handle-actions",
          method: "post",
          navigate: false,
        },
      );
    },
    [submit],
  );

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const { attributes, listeners, transform, setNodeRef, isDragging } =
    useDraggable({
      id: action.id,
      data: { ...action },
    });

  const style = useMemo(
    () =>
      transform
        ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0px)` }
        : undefined,
    [transform],
  );

  return (
    <ContextMenu>
      <ContextMenuTrigger className={isDragging ? "z-10" : ""}>
        {isHair ? (
          <div
            title={isHydrated ? action.title : undefined}
            suppressHydrationWarning
            onClick={() => {
              navigate(
                `/dashboard/action/${action.id}/${partner.slug}${getQueryString()}`,
              );
            }}
            ref={setNodeRef}
            {...listeners}
            {...attributes}
            style={style}
          >
            <div
              className={`flex cursor-pointer items-center justify-between gap-2 overflow-hidden transition-all ${
                isBefore(action.date, new Date()) && state.slug !== "finished"
                  ? "bg-error/5 hover:bg-error/20 text-error"
                  : "hover:bg-muted/50"
              } `}
              onMouseEnter={() => {
                setHover(true);
              }}
              onMouseLeave={() => {
                setHover(false);
              }}
            >
              {isHover && !edit ? <ShortcutActions action={action} /> : null}

              <div className="flex items-center gap-2 overflow-hidden">
                <div
                  className="h-6 w-1 shrink-0"
                  style={{ backgroundColor: state.color }}
                ></div>

                <div className="overflow-hidden text-xs tracking-tight text-ellipsis whitespace-nowrap">
                  {action.title}
                </div>
              </div>
              <div className="pr-2 text-[10px] tracking-tighter opacity-50">
                {formatActionDatetime({ date: action.date, timeFormat: 1 })}
              </div>
            </div>
          </div>
        ) : isInstagramFeed(action.category) && showContent ? (
          <div
            title={isHydrated ? action.title : undefined}
            suppressHydrationWarning
            onClick={() => {
              if (setEditingAction) {
                if (editingAction === action.id) {
                  navigate(
                    `/dashboard/action/${action.id}/${partner.slug}${getQueryString()}`,
                  );
                } else {
                  setEditingAction(action.id);
                  params.set("editing_action", action.id);
                  params.delete("show_feed");
                  setSearchParams(params);
                }
              } else {
                navigate(
                  `/dashboard/action/${action.id}/${partner.slug}${getQueryString()}`,
                );
              }
            }}
            // onClick={() => {
            //   navigate(`/dashboard/action/${action.id}/${partner.slug}${getQueryString()}`);
            // }}
            ref={setNodeRef}
            {...listeners}
            {...attributes}
            style={style}
            className="outline-none"
          >
            <div
              className={`ring-ring ring-offset-background relative cursor-pointer ring-offset-2 outline-hidden focus-within:ring-3 ${
                showDelay &&
                state.slug !== "finished" &&
                (isBefore(action.instagram_date, new Date()) ||
                  isBefore(action.date, new Date()))
                  ? "action-content-delayed"
                  : ""
              }`}
              onMouseEnter={() => {
                setHover(true);
              }}
              onMouseLeave={() => {
                setHover(false);
              }}
            >
              {isHover && !edit ? <ShortcutActions action={action} /> : null}
              <Content
                aspect="feed"
                action={action}
                partner={partner!}
                showInfo
                date={{ timeFormat: 1 }}
                className={`the-action-content aspect-[3/4] overflow-hidden rounded-md hover:opacity-75`}
              />
              <div className="late-border border-background ring-error absolute inset-0 hidden rounded-md border ring-2"></div>

              <div className="absolute -top-3 right-2 flex gap-2">
                {isSprint(action.id, sprints) && (
                  <div className="border-background bg-primary text-primary-foreground grid size-6 place-content-center rounded-md border-2">
                    <RabbitIcon className="size-4" />
                  </div>
                )}

                {showResponsibles && (
                  <AvatarGroup
                    avatars={responsibles.map((responsible) => ({
                      item: {
                        short: responsible.initials,
                        image: responsible.image,
                        title: responsible.name,
                      },
                    }))}
                  />
                )}

                {state.slug !== "finished" ? (
                  <div
                    className={`border-background rounded-md border-2 px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase`}
                    style={{
                      backgroundColor: state.color,
                      color: state.foreground,
                    }}
                  >
                    <span>{state.title}</span>
                  </div>
                ) : (
                  <FinishedCheck
                    className="border-background border-2"
                    size="lg"
                  />
                )}
              </div>
            </div>
            <LikeFooter size="sm" liked={state.slug === "finished"} />
          </div>
        ) : (
          <div
            title={isHydrated ? action.title : undefined}
            suppressHydrationWarning
            ref={setNodeRef}
            {...listeners}
            {...attributes}
            style={style}
            className={`action group/action action-item items-center gap-2 hover:z-100 [&>*]:border-red-500 ${
              isDragging ? "z-[100]" : "z-0"
            } ${
              short ? "action-item-short px-2 py-1" : long ? "px-4 py-3" : "p-3"
            } font-base @container md:text-sm ${
              showDelay &&
              isBefore(action.date, new Date()) &&
              state.slug !== "finished"
                ? "action-delayed"
                : ""
            } ${isSprint(action.id, sprints) ? "action-sprint" : ""}`}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();

              if (!edit && !selectMultiple) {
                // navigate(`/dashboard/action/${action.id}/${partner.slug}${getQueryString()}`);

                if (setEditingAction) {
                  if (editingAction === action.id) {
                    navigate(
                      `/dashboard/action/${action.id}/${partner.slug}${getQueryString()}`,
                    );
                  } else {
                    setEditingAction(action.id);
                    params.set("editing_action", action.id);
                    params.delete("show_feed");
                    setSearchParams(params);
                  }
                } else {
                  navigate(
                    `/dashboard/action/${action.id}/${partner.slug}${getQueryString()}`,
                  );
                }
              }
            }}
            onMouseEnter={() => {
              setHover(() => true);
            }}
            onMouseLeave={() => {
              setHover(false);
            }}
            role="button"
            tabIndex={0}
          >
            {/* Atalhos */}
            {isHover && !edit ? <ShortcutActions action={action} /> : null}

            {selectMultiple && (
              <Checkbox
                className="bg-accent border-0"
                onCheckedChange={(state) => {
                  if (setSelectedActions) {
                    setSelectedActions((actions) => {
                      if (state) {
                        return [...actions, action.id];
                      } else {
                        return actions.filter((id) => id !== action.id);
                      }
                    });
                  }
                }}
              />
            )}

            {/* State */}
            <div
              className="absolute top-0 bottom-0 left-0 -ml-[1px] w-1 shrink-0 rounded-l-full"
              style={{ backgroundColor: state.color }}
            ></div>
            {/* {short ? (
              <div
                className="-my-2 -ml-2 h-6 w-1 shrink-0 rounded-l-full"
                style={{ backgroundColor: state.color }}
              ></div>
            ) : (
              <div
                className="size-2 shrink-0 rounded-full"
                style={{ backgroundColor: state.color }}
              ></div>
            )} */}

            {/* Title */}

            <div
              className={`relative flex w-full shrink overflow-hidden ${
                long ? "text-base" : ""
              }`}
            >
              {edit ? (
                <input
                  ref={inputRef}
                  type="text"
                  name="title"
                  defaultValue={action.title}
                  className="w-full bg-transparent outline-hidden"
                  onKeyDown={(event) => {
                    if (event.key === "Escape") {
                      flushSync(() => {
                        setEdit(() => false);
                      });
                      buttonRef.current?.focus();
                    } else if (event.key === "Enter") {
                      event.preventDefault();
                      if (inputRef.current?.value !== action.title) {
                        flushSync(() => {
                          handleActions({
                            intent: INTENTS.updateAction,
                            ...action,
                            title: String(inputRef.current?.value),
                          });
                        });

                        buttonRef.current?.focus();
                      }
                      setEdit(() => false);
                    }
                  }}
                  onBlur={(event) => {
                    event.preventDefault();
                    if (inputRef.current?.value !== action.title) {
                      flushSync(() => {
                        handleActions({
                          intent: INTENTS.updateAction,
                          ...action,
                          title: String(inputRef.current?.value),
                        });
                      });
                    }
                    setEdit(() => false);
                  }}
                />
              ) : (
                <button
                  ref={buttonRef}
                  className={`relative w-full cursor-text items-center overflow-hidden text-left text-nowrap text-ellipsis outline-hidden select-none`}
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    if (!edit) {
                      flushSync(() => {
                        setEdit(true);
                      });
                      inputRef.current?.select();
                    }
                  }}
                >
                  <span suppressHydrationWarning>{action.title}</span>
                </button>
              )}
            </div>

            {/* Categoria */}

            {showCategory && (
              <div
                title={
                  categories.find(
                    (category) => category.slug === action.category,
                  )?.title
                }
              >
                <Icons
                  id={
                    categories.find(
                      (category) => category.slug === action.category,
                    )?.slug
                  }
                  className={`hidden shrink-0 opacity-25 @[200px]:block ${
                    long ? "size-6" : "size-4"
                  }`}
                />
              </div>
            )}

            {/* parceiro */}

            {partner && (showPartner || long) ? (
              <div
                title={getPartners(action.partners, partners)
                  .map((partner) => partner.title)
                  .join(" • ")}
                className={long ? "flex w-32 shrink-0 justify-center" : ""}
              >
                {getPartners(action.partners, partners).length === 1 ? (
                  <Avatar
                    item={{
                      short: partner.short,
                      bg: partner.colors[0],
                      fg: partner.colors[1],
                    }}
                    size={long ? "sm" : "xs"}
                  />
                ) : (
                  <AvatarGroup
                    size={long ? "sm" : "xs"}
                    ringColor={
                      isSprint(action.id, sprints)
                        ? "ring-primary"
                        : "ring-card"
                    }
                    avatars={getPartners(action.partners, partners).map(
                      (partner) => ({
                        item: {
                          short: partner.short,
                          bg: partner.colors[0],
                          fg: partner.colors[1],
                          title: partner.title,
                        },
                      }),
                    )}
                  />
                )}
              </div>
            ) : (
              action.partners.length > 1 && (
                <div
                  className="opacity-25"
                  title={getPartners(action.partners, partners)
                    .map((partner) => partner.title)
                    .join(" • ")}
                >
                  <HeartHandshakeIcon className={long ? "size-6" : "size-4"} />
                </div>
              )
            )}

            {/* priority */}

            {long ? (
              <div
                title={`Prioridade ${
                  priorities.find(
                    (priority) => priority.slug === action.priority,
                  )?.title
                }`}
              >
                <Icons
                  id={
                    priorities.find(
                      (priority) => priority.slug === action.priority,
                    )?.slug
                  }
                  className={`${long ? "size-6" : "size-5"} shrink-0`}
                  type="priority"
                />
              </div>
            ) : (
              action.priority === PRIORITIES.high && (
                <Icons
                  id="high"
                  className={`text-red-500 ${
                    long ? "size-6" : "size-5"
                  } shrink-0`}
                />
              )
            )}

            {/* Responsibles */}
            {showResponsibles || long ? (
              <div
                className={`flex shrink-0 justify-center ${long ? "w-24" : ""}`}
              >
                <AvatarGroup
                  avatars={people
                    .filter(
                      (person) =>
                        action.responsibles.filter(
                          (responsible_id: string) =>
                            responsible_id === person.user_id,
                        ).length > 0,
                    )
                    .map((person) => ({
                      item: {
                        image: person.image,
                        short: person.initials!,
                        title: person.name,
                      },
                    }))}
                  size={long ? "sm" : "xs"}
                  ringColor="ring-card"
                />
              </div>
            ) : (
              <div
                title={
                  isHydrated &&
                  amIResponsible(action.responsibles, person.user_id)
                    ? `${person.name} é a pessoa responsável pela ação`
                    : undefined
                }
                suppressHydrationWarning
              >
                {isHydrated &&
                  amIResponsible(action.responsibles, person.user_id) && (
                    <Avatar
                      item={{
                        image: person.image,
                        short: person.initials!,
                      }}
                      size={long ? "sm" : "xs"}
                    />
                  )}
              </div>
            )}

            {long ? (
              <div className="hidden w-56 shrink-0 overflow-x-hidden text-right text-sm whitespace-nowrap opacity-50 md:text-xs @[150px]:block">
                {formatActionDatetime({
                  date: action.date,
                  dateFormat: 4,
                  timeFormat: 1,
                })}
              </div>
            ) : (
              date && (
                <div
                  className="hidden shrink grow-0 text-right text-xs whitespace-nowrap opacity-50 md:text-[10px] @[130px]:block"
                  suppressHydrationWarning
                >
                  {isHydrated &&
                    formatActionDatetime({
                      date:
                        isInstagramDate &&
                        isInstagramFeed(action.category, true)
                          ? action.instagram_date
                          : action.date,
                      dateFormat: date.dateFormat,
                      timeFormat: date.timeFormat,
                    })}
                </div>
              )
            )}
          </div>
        )}
      </ContextMenuTrigger>
      <ContextMenuItems
        action={action}
        handleActions={handleActions}
        isInstagramDate={Boolean(isInstagramDate)}
      />
    </ContextMenu>
  );
});

export const ActionBlock = React.memo(function ActionBlock({
  action,
  sprint,
}: {
  action: Action;
  sprint?: Boolean;
}) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const submit = useSubmit();
  const [edit, setEdit] = useState(false);
  const [isHover, setHover] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const isMobile = useIsMobile();

  const matches = useMatches();
  const navigate = useNavigate();

  const { categories, states, sprints, partners, people } = matches[1]
    .data as DashboardRootType;

  const actionPartners = getPartners(action.partners, partners);

  const state = states.find((state) => state.slug === action.state) as State;

  const handleActions = useCallback(
    (data: HandleActionsDataType) => {
      submit(
        { ...data, updated_at: DEFAULT_UPDATE_TIMESTAMP() },
        {
          action: "/handle-actions",
          method: "post",
          navigate: false,
        },
      );
    },
    [submit],
  );

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const { attributes, listeners, transform, setNodeRef, isDragging } =
    useDraggable({
      id: action.id,
      data: { ...action },
    });

  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0px)` }
    : undefined;

  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <div ref={setNodeRef} {...attributes} {...listeners} style={style}>
          <div
            title={isHydrated ? action.title : undefined}
            suppressHydrationWarning
            className={`action group/action action-item action-item-block @container cursor-pointer flex-col justify-between gap-2 text-sm ${
              isDragging ? "z-[100]" : "z-0"
            } ${isSprint(action.id, sprints) && sprint ? "action-sprint" : ""}`}
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              if (!edit) {
                navigate(
                  `/dashboard/action/${action.id}/${action.partners[0]}${getQueryString()}`,
                );
              }
            }}
            onMouseEnter={() => {
              setHover(true);
            }}
            onMouseLeave={() => {
              setHover(false);
            }}
          >
            {isHover && !edit ? <ShortcutActions action={action} /> : null}
            {/* Title */}
            <div className="leading-tighter relative overflow-hidden text-xl font-medium tracking-tighter">
              {edit ? (
                <input
                  ref={inputRef}
                  type="text"
                  defaultValue={action.title}
                  className={`w-full overflow-hidden bg-transparent outline-hidden`}
                  onKeyDown={(event) => {
                    if (event.key === "Escape") {
                      flushSync(() => {
                        setEdit(() => false);
                      });
                      buttonRef.current?.focus();
                    } else if (event.key === "Enter") {
                      event.preventDefault();
                      if (inputRef.current?.value !== action.title) {
                        flushSync(() => {
                          handleActions({
                            intent: INTENTS.updateAction,
                            ...action,
                            title: String(inputRef.current?.value),
                          });
                        });

                        buttonRef.current?.focus();
                      }
                      setEdit(() => false);
                    }
                  }}
                  onBlur={() => {
                    if (
                      inputRef.current?.value !== undefined &&
                      inputRef.current?.value !== action.title
                    )
                      handleActions({
                        intent: INTENTS.updateAction,
                        ...action,
                        title: inputRef.current?.value,
                      });

                    setEdit(() => false);
                  }}
                />
              ) : (
                <button
                  ref={buttonRef}
                  className={`relative block max-w-full cursor-text items-center overflow-hidden text-left text-ellipsis whitespace-nowrap outline-hidden`}
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    if (!edit) {
                      flushSync(() => {
                        setEdit(true);
                      });
                      inputRef.current?.focus();
                    }
                  }}
                >
                  <span suppressHydrationWarning>{action.title}</span>
                </button>
              )}
            </div>

            <div className="flex items-center justify-between gap-4 overflow-x-hidden">
              <div className="flex items-center gap-2">
                <div
                  className="size-2 shrink-0 rounded-full"
                  style={{ backgroundColor: state.color }}
                ></div>
                {/* Partners | Clientes  */}
                <AvatarGroup partners={actionPartners} ringColor="ring-card" />
                {/* Category - Categoria */}
                <div className="opacity-50">
                  <Icons
                    id={
                      categories.find(
                        (category) => category.slug === action.category,
                      )?.slug
                    }
                    className="w-4"
                  />
                </div>
                {/* Priority - Prioridade */}
                {action.priority === PRIORITIES.high ? (
                  <div>
                    <Icons id={"high"} className="w-4" type="priority" />
                  </div>
                ) : null}
                {/* Responsibles -  Responsáveis */}
                <AvatarGroup
                  people={getResponsibles(people, action.responsibles)}
                />
              </div>
              <div className="flex items-center justify-end gap-1 overflow-hidden text-right text-sm font-medium whitespace-nowrap opacity-50 md:text-xs">
                <span className="@[240px]:hidden">
                  {formatActionDatetime({
                    date: action.date,
                    dateFormat: 2,
                    timeFormat: 1,
                  })}
                </span>
                <span className="hidden @[240px]:block @[360px]:hidden">
                  {formatActionDatetime({
                    date: action.date,
                    dateFormat: 3,
                    timeFormat: 1,
                  })}
                </span>
                <span className="hidden @[360px]:block">
                  {formatActionDatetime({
                    date: action.date,
                    dateFormat: 4,
                    timeFormat: 1,
                  })}
                </span>
                •<div>{action.time.toString().concat("m")}</div>
              </div>
            </div>
          </div>
        </div>
      </ContextMenuTrigger>
      <ContextMenuItems action={action} handleActions={handleActions} />
    </ContextMenu>
  );
});

export function ListOfActions({
  actions,
  showCategory,
  showPartner,
  date,
  columns = 1,
  isFoldable,
  descending = false,
  orderBy = "state",
  short,
  long,
  scroll,
  isHair,
}: {
  actions?: Action[] | null;
  showCategory?: boolean;
  showPartner?: boolean;
  date?: { dateFormat?: 0 | 1 | 2 | 3 | 4; timeFormat?: 0 | 1 };
  columns?: 1 | 2 | 3 | 6;
  isFoldable?: boolean;
  descending?: boolean;
  orderBy?: "state" | "priority" | "time";
  short?: boolean;
  long?: boolean;
  scroll?: boolean;
  isHair?: boolean;
}) {
  const matches = useMatches();
  const { states } = matches[1].data as DashboardRootType;

  actions = actions
    ? orderBy === "state"
      ? getActionsByState(actions, states, descending)
      : orderBy === "priority"
        ? getActionsByPriority(actions, descending)
        : actions
    : [];

  const foldCount = columns * FOLD_MULTIPLIER;
  const [fold, setFold] = useState(isFoldable ? foldCount : undefined);
  return actions.length > 0 ? (
    <div className="group">
      <div
        className={`${
          columns === 1
            ? "flex flex-col"
            : columns === 2
              ? "grid sm:grid-cols-2"
              : columns === 3
                ? "grid sm:grid-cols-2 md:grid-cols-3"
                : "grid sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6"
        } ${scroll ? "scrollbars-v pt-1 pb-8" : ""} ${isHair ? "gap-y-[1px]" : "gap-y-1"} @container h-full gap-x-4`}
      >
        {actions?.slice(0, fold).map((action) => (
          <ActionLine
            short={short}
            long={long}
            key={action.id}
            action={action}
            showCategory={showCategory}
            showPartner={showPartner}
            date={date}
            isHair={isHair}
          />
        ))}
      </div>

      {actions && isFoldable && actions.length > foldCount ? (
        <div className="p-4 text-center opacity-0 group-hover:opacity-100">
          <Toggle
            size={"sm"}
            onPressedChange={(isPressed) => {
              setFold(isPressed ? undefined : foldCount);
            }}
            className="inline-flex gap-2 text-xs font-semibold"
          >
            {fold ? (
              <>
                <span>Exibir todos</span>
                <ExpandIcon className="size-3" />
              </>
            ) : (
              <>
                <span>Exibir menos</span>
                <ShrinkIcon className="size-3" />
              </>
            )}
          </Toggle>
        </div>
      ) : null}
    </div>
  ) : null;
}

export function BlockOfActions({
  actions,
  max,
  orderBy = "state",
  descending = false,
  sprint,
}: {
  actions?: Action[] | null;
  max?: 1 | 2;
  orderBy?: "state" | "priority" | "time";
  descending?: boolean;
  sprint?: Boolean;
}) {
  const matches = useMatches();
  const { states } = matches[1].data as DashboardRootType;

  actions = actions
    ? orderBy === "state"
      ? getActionsByState(actions, states, descending)
      : orderBy === "priority"
        ? getActionsByPriority(actions, descending)
        : getActionsByTime(actions, descending)
    : [];

  return (
    <div className="@container -mx-1 h-full overflow-hidden">
      <div
        className={`${
          !max
            ? "grid @[600px]:grid-cols-2 @[1000px]:grid-cols-3 @[1300px]:grid-cols-4"
            : max === 2
              ? "grid grid-cols-2"
              : "flex flex-col"
        } scrollbars-v gap-2 p-1 pb-8`}
      >
        {actions?.map((action) => (
          <ActionBlock action={action} key={action.id} sprint={sprint} />
        ))}
      </div>
    </div>
  );
}

export function GridOfActions({
  actions,
  partner,
}: {
  actions?: Action[];
  partner: Partner;
}) {
  actions = actions?.sort((a, b) =>
    isAfter(a.instagram_date, b.instagram_date) ? -1 : 1,
  );

  return (
    <div className="scrollbars-v">
      <div className="grid grid-cols-3 overflow-hidden rounded-xs">
        {actions?.map((action, index) => (
          <Link
            to={`/dashboard/action/${action.id}/${partner.slug}${getQueryString()}`}
            key={index}
          >
            <Content
              showFinished
              action={action}
              aspect="feed"
              partner={partner}
            />
          </Link>
        ))}
      </div>
    </div>
  );
}

const ShortcutActions = React.memo(function ShortcutActions({
  action,
}: {
  action: Action;
}) {
  const navigate = useNavigate();
  const submit = useSubmit();
  const matches = useMatches();
  const [searchParams] = useSearchParams();
  const isInstagramDate = !!searchParams.get("instagram_date");

  const { states, categories, priorities, person, sprints } = matches[1]
    .data as DashboardRootType;

  const handleActions = useCallback(
    (data: HandleActionsDataType) => {
      submit(
        { ...data, updated_at: DEFAULT_UPDATE_TIMESTAMP() },
        {
          action: "/handle-actions",
          method: "post",
          navigate: false,
        },
      );
    },
    [submit],
  );

  const keyDownHandler = useCallback(
    async (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      const code = event.code;

      // ATALHOS COM ALT E SHIFT
      if (event.ctrlKey) {
        if (key === "s")
          handleActions({
            ...action,
            intent: INTENTS.updateAction,
            ...getNewDateValues(action, isInstagramDate, 7 * 24 * 60, false),
          });
      }
      // ATALHOS SÓ COM SHIFT
      else if (event.shiftKey) {
        if (key === "e") {
          navigate(
            `/dashboard/action/${action.id}/${action.partners[0]}${getQueryString()}`,
          );
        } else if (key === "d") {
          handleActions({
            ...action,
            newId: window.crypto.randomUUID(),
            created_at: format(new Date(), "yyyy-MM-dd HH:mm:ss"),
            updated_at: format(new Date(), "yyyy-MM-dd HH:mm:ss"),
            intent: INTENTS.duplicateAction,
          });
        } else if (key === "u") {
          handleActions({
            id: window.crypto.randomUUID(),
            action_id: action.id,
            user_id: person.user_id,
            created_at: format(new Date(), "yyyy-MM-dd HH:mm:ss"),
            intent: isSprint(action.id, sprints)
              ? INTENTS.unsetSprint
              : INTENTS.setSprint,
          });
        } else if (key === "x") {
          if (confirm("Deseja mesmo excluir essa ação?")) {
            handleActions({
              ...action,
              intent: INTENTS.deleteAction,
            });
          }
        }
        //em uma hora
        else if (code === "Digit1") {
          handleActions({
            ...action,
            intent: INTENTS.updateAction,

            ...getNewDateValues(action, isInstagramDate, 60),
          });
        }
        //em duas horas
        else if (code === "Digit2") {
          handleActions({
            ...action,
            intent: INTENTS.updateAction,
            ...getNewDateValues(action, isInstagramDate, 2 * 60), // Em minutos
          });
        }
        //em três horas
        else if (code === "Digit3") {
          handleActions({
            ...action,
            intent: INTENTS.updateAction,
            ...getNewDateValues(action, isInstagramDate, 3 * 60), // Em minutos
          });
        }
        //Hoje
        else if (key === "h") {
          handleActions({
            ...action,
            intent: INTENTS.updateAction,
            ...getNewDateValues(action, isInstagramDate),
          });
        }
        // Amanhã
        else if (key === "a") {
          handleActions({
            ...action,
            intent: INTENTS.updateAction,
            ...getNewDateValues(action, isInstagramDate, 24 * 60),
          });
        }

        // Adiciona uma semana além de hoje
        else if (key === "s") {
          handleActions({
            ...action,
            intent: INTENTS.updateAction,
            ...getNewDateValues(action, isInstagramDate, 7 * 24 * 60, true),
          });
        }
        // Adiciona um mês
        else if (key === "m") {
          handleActions({
            ...action,
            intent: INTENTS.updateAction,
            ...getNewDateValues(action, isInstagramDate, 30 * 24 * 60, true),
          });
        }
      } else if (event.altKey) {
        //ATALHOS SÓ COM ALT
        if (
          categories.find(
            (category) => category.shortcut === code.toLowerCase().substring(3),
          ) &&
          event.altKey
        ) {
          // Set Category
          let category =
            categories.find(
              (category) =>
                category.shortcut === code.toLowerCase().substring(3),
            )?.slug || "post";

          handleActions({
            intent: INTENTS.updateAction,
            ...action,
            category,
          });
        }
      }
      // Set States
      else if (states.find((state) => state.shortcut === key)) {
        let state =
          states.find((state) => state.shortcut === key)?.slug || "do";

        handleActions({
          intent: INTENTS.updateAction,
          ...action,
          state,
        });
      }
      // Set Priorities
      else if (priorities.find((priority) => priority.shortcut === key)) {
        let priority =
          priorities.find((priority) => priority.shortcut === key)?.slug ||
          PRIORITIES.medium;
        handleActions({
          ...action,
          intent: INTENTS.updateAction,
          priority,
        });
      }
    },
    [
      action,
      navigate,
      handleActions,
      isInstagramDate,
      categories,
      states,
      priorities,
      person,
      sprints,
    ],
  );

  useEffect(() => {
    window.addEventListener("keydown", keyDownHandler);
    return () => window.removeEventListener("keydown", keyDownHandler);
  }, [keyDownHandler]);

  return <></>;
});

/**
 * Retorna a formatação da data e da hora de acordo com os parâmetros
 *  DATA
 *  0 - Sem informação de data
 *  1 - Distância
 *  2 - Curta
 *  3 - Média
 *  4 - Longa
 *
 * HORA
 *  0 - Sem informação de horas
 *  1 - Com horas
 * @param {string | Date} date - data em formato de string ou Date
 * @param {number | undefined} dateFormat - Formato da data de 0 a 4
 * @param {number | undefined} timeFormat - Fomrato da hora de 0 a 1
 * @returns {string} O texto explicativo para a IA usar
 * */
export function formatActionDatetime({
  date,
  dateFormat,
  timeFormat,
}: {
  date: Date | string;
  dateFormat?: 0 | 1 | 2 | 3 | 4;
  timeFormat?: 0 | 1;
}) {
  date = typeof date === "string" ? parseISO(date) : date;
  const formatString = (
    dateFormat === 2
      ? `d/M${
          !isSameYear(date.getFullYear(), new Date().getUTCFullYear())
            ? "/yy"
            : ""
        }`
      : dateFormat === 3
        ? `d 'de' MMM${
            !isSameYear(date.getFullYear(), new Date().getUTCFullYear())
              ? " 'de' yy"
              : ""
          }`
        : dateFormat === 4
          ? `E, d 'de' MMMM${
              !isSameYear(date.getFullYear(), new Date().getUTCFullYear())
                ? " 'de' yyy"
                : ""
            }`
          : ""
  ).concat(
    timeFormat
      ? `${dateFormat ? " 'às' " : ""}H'h'${date.getMinutes() > 0 ? "m" : ""}`
      : "",
  );

  return dateFormat === 1
    ? formatDistanceToNow(date, { locale: ptBR, addSuffix: true })
    : format(date, formatString, { locale: ptBR });
}

export const ContextMenuItems = React.memo(function ContextMenuItems({
  action,
  isInstagramDate,
  handleActions,
}: {
  action: Action;
  isInstagramDate?: boolean;
  handleActions: (data: HandleActionsDataType) => void;
}) {
  const matches = useMatches();
  const {
    people,
    states,
    categories,
    priorities,
    areas,
    partners,
    person,
    sprints,
  } = matches[1].data as DashboardRootType;

  const [delay, setDelay] = useState({ hour: 0, day: 0, week: 0 });

  const state = states.find((state) => state.slug === action.state);
  // const _partners = getPartners(action.partners, partners);

  return (
    <ContextMenuContent className="bg-content">
      {/* Editar */}
      <ContextMenuItem asChild>
        <Link
          className="bg-item flex items-center gap-2"
          to={`/dashboard/action/${action.id}/${action.partners[0]}${getQueryString()}`}
        >
          <PencilLineIcon className="size-3" />
          <span>Editar</span>
          <ContextMenuShortcut className="pl-2">⇧+E</ContextMenuShortcut>
        </Link>
      </ContextMenuItem>
      {/* Sprint */}
      <ContextMenuItem
        className="bg-item flex items-center gap-2"
        onSelect={() => {
          handleActions({
            id: window.crypto.randomUUID(),
            user_id: person.user_id,
            action_id: action.id,
            created_at: format(new Date(), "yyyy-MM-dd HH:mm:ss"),
            intent: isSprint(action.id, sprints)
              ? INTENTS.unsetSprint
              : INTENTS.setSprint,
          });
        }}
      >
        <RabbitIcon className="size-3" />
        {isSprint(action.id, sprints) ? (
          <span>Retirar do Sprint</span>
        ) : (
          <span>Colocar no Sprint</span>
        )}
        <ContextMenuShortcut className="pl-2">⇧+U</ContextMenuShortcut>
      </ContextMenuItem>
      {/* Duplicar */}
      <ContextMenuItem className="bg-item flex items-center gap-2">
        <CopyIcon className="size-3" />
        <span>Duplicar</span>
        <ContextMenuShortcut className="pl-2">⇧+D</ContextMenuShortcut>
      </ContextMenuItem>

      <ChangeDatePopover
        action={action}
        handleActions={handleActions}
        isInstagramDate={false}
      >
        <CalendarClock className="size-3" />
        <span>Mudar Data</span>
      </ChangeDatePopover>

      <ContextMenuItem className="bg-item flex items-center gap-2">
        <Grid3x3Icon className="size-3" />
        <span>Mudar Data do Instagram</span>
      </ContextMenuItem>

      {/* Hora */}
      <ContextMenuSub>
        <ContextMenuSubTrigger className="bg-item flex items-center gap-2">
          <TimerIcon className="size-3" />
          <span>Mudar horário</span>
        </ContextMenuSubTrigger>
        <ContextMenuPortal>
          <ContextMenuSubContent className="bg-content font-medium">
            {Array(12)
              .fill(1)
              .map((a, i) => (
                <ContextMenuItem
                  className="bg-item"
                  key={i}
                  onSelect={() => {
                    handleActions({
                      intent: INTENTS.updateAction,
                      ...action,
                      [isInstagramDate ? "instagram_date" : "date"]: format(
                        new Date(
                          isInstagramDate ? action.instagram_date : action.date,
                        ).setHours(i + 6, 0),
                        "yyyy-MM-dd HH:mm:ss",
                      ),
                    });
                  }}
                >
                  {`${i + 6}h`}
                </ContextMenuItem>
              ))}
          </ContextMenuSubContent>
        </ContextMenuPortal>
      </ContextMenuSub>

      {/* Deletar */}
      <ContextMenuItem
        className="bg-item flex items-center gap-2"
        onSelect={() => {
          handleActions({
            ...action,
            intent: action.archived
              ? INTENTS.recoverAction
              : INTENTS.deleteAction,
          });
        }}
      >
        {action.archived ? (
          <>
            <ArchiveRestoreIcon className="size-3" />
            <span>Restaurar</span>
          </>
        ) : (
          <>
            <TrashIcon className="size-3" />
            <span>Deletar</span>
          </>
        )}
        <ContextMenuShortcut className="pl-2">⇧+X</ContextMenuShortcut>
      </ContextMenuItem>
      <ContextMenuSeparator className="bg-border" />
      {/* Parceiros */}
      <ContextMenuSub>
        <ContextMenuSubTrigger className="bg-item">
          <div
            className={`flex items-center ${
              action.partners.length === 1 ? "gap-2" : "-space-x-1"
            }`}
          >
            {getPartners(action.partners, partners).map((partner) => (
              <Fragment key={partner.id}>
                <Avatar
                  item={{
                    short: partner.short,
                    bg: partner.colors[0],
                    fg: partner.colors[1],
                  }}
                  size="sm"
                  key={partner.id}
                  ring
                />
                {action.partners.length === 1 ? partner.title : null}
              </Fragment>
            ))}
          </div>
        </ContextMenuSubTrigger>
        <ContextMenuPortal>
          <ContextMenuSubContent className="bg-content">
            {partners.map((partner) => (
              <ContextMenuCheckboxItem
                checked={
                  action.partners?.find(
                    (partner_slug: string) => partner_slug === partner.slug,
                  )
                    ? true
                    : false
                }
                key={partner.id}
                className="bg-select-item flex items-center gap-2"
                onClick={(event) => {
                  const checked = action.partners.includes(partner.slug);
                  let r = action.partners || [partner.slug];

                  if (checked && action.partners.length < 2) {
                    toast({
                      variant: "destructive",
                      title: "Ops!",
                      description: "A ação precisa ter pelo menos um parceiro.",
                    });
                    return false;
                  }

                  if (event.shiftKey) {
                    handleActions({
                      ...action,
                      partners: [partner.slug],
                      intent: INTENTS.updateAction,
                    });
                  } else {
                    const tempPartners = checked
                      ? action.partners.filter(
                          (id: string) => id !== partner.slug,
                        )
                      : [...action.partners, partner.slug];
                    handleActions({
                      ...action,
                      partners: tempPartners,
                      intent: INTENTS.updateAction,
                    });
                  }
                }}
              >
                <Avatar
                  item={{
                    bg: partner.colors[0],
                    fg: partner.colors[1],
                    short: partner.short,
                  }}
                  size="sm"
                />
                {partner.title}
              </ContextMenuCheckboxItem>
            ))}
          </ContextMenuSubContent>
        </ContextMenuPortal>
      </ContextMenuSub>
      {/* States */}
      <ContextMenuSub>
        <ContextMenuSubTrigger className="bg-item flex items-center gap-2">
          <div
            className={`text-muted} size-2 rounded-full`}
            style={{ backgroundColor: state?.color }}
          ></div>
          <span>{state?.title}</span>
        </ContextMenuSubTrigger>
        <ContextMenuPortal>
          <ContextMenuSubContent className="bg-content">
            {states.map((state) => (
              <ContextMenuItem
                key={state.slug}
                className="bg-item flex items-center gap-2"
                onSelect={() => {
                  handleActions({
                    ...action,
                    state: state.slug,
                    intent: INTENTS.updateAction,
                  });
                }}
              >
                <div
                  className={`text-muted size-2 rounded-full`}
                  style={{ backgroundColor: state.color }}
                ></div>
                <span>{state.title}</span>
                <ContextMenuShortcut className="pl-2">
                  {state.shortcut}
                </ContextMenuShortcut>
              </ContextMenuItem>
            ))}
          </ContextMenuSubContent>
        </ContextMenuPortal>
      </ContextMenuSub>

      {/* Categoria */}
      <ContextMenuSub>
        <ContextMenuSubTrigger className="bg-item flex items-center gap-2">
          <Icons
            id={
              categories.find((category) => category.slug === action.category)
                ?.slug
            }
            className="size-3"
          />
          <span>
            {
              categories.find((category) => category.slug === action.category)
                ?.title
            }
          </span>
        </ContextMenuSubTrigger>
        <ContextMenuPortal>
          <ContextMenuSubContent className="bg-content">
            {areas.map((area, i) => (
              <ContextMenuGroup key={area.id}>
                {i > 0 && <ContextMenuSeparator />}
                <h4 className="px-3 py-1 text-[10px] font-bold tracking-wider uppercase">
                  {area.title}
                </h4>
                {categories.map((category) =>
                  category.area === area.slug ? (
                    <ContextMenuItem
                      key={category.slug}
                      className="bg-item flex items-center gap-2"
                      onSelect={() => {
                        handleActions({
                          ...action,
                          category: category.slug,
                          intent: INTENTS.updateAction,
                        });
                      }}
                    >
                      <Icons id={category.slug} className="size-3" />
                      {category.title}
                      <ContextMenuShortcut className="flex w-12 pl-2 text-left">
                        ⌥+
                        <div className="w-full text-center">
                          {category.shortcut.toUpperCase()}
                        </div>
                      </ContextMenuShortcut>
                    </ContextMenuItem>
                  ) : null,
                )}
              </ContextMenuGroup>
            ))}
          </ContextMenuSubContent>
        </ContextMenuPortal>
      </ContextMenuSub>
      {/* Responsibles - Responsáveis  */}
      <ContextMenuSub>
        <ContextMenuSubTrigger className="bg-item">
          <div
            className={`flex items-center ${
              action.responsibles.length === 1 ? "gap-2" : "-space-x-1"
            }`}
          >
            {getResponsibles(people, action.responsibles).map((person) => (
              <Fragment key={person.id}>
                <Avatar
                  item={{
                    image: person.image,
                    short: person.initials!,
                  }}
                  size="sm"
                  key={person.id}
                  ring
                />
                {action.responsibles.length === 1 ? person.name : null}
              </Fragment>
            ))}
          </div>
        </ContextMenuSubTrigger>
        <ContextMenuPortal>
          <ContextMenuSubContent className="bg-content">
            {getResponsibles(
              people,
              getPartners(action.partners, partners)[0].users_ids,
            ).map((person) => (
              <ContextMenuCheckboxItem
                checked={
                  action.responsibles?.find(
                    (user_id: string) => user_id === person.user_id,
                  )
                    ? true
                    : false
                }
                key={person.id}
                className="bg-select-item flex items-center gap-2"
                onClick={(event) => {
                  const checked = action.responsibles.includes(person.user_id);

                  if (checked && action.responsibles.length < 2) {
                    toast({
                      variant: "destructive",
                      title: "Ops!",
                      description:
                        "É necessário ter pelo menos um responsável pela ação",
                    });

                    return false;
                  }

                  if (event.shiftKey) {
                    handleActions({
                      ...action,
                      responsibles: person.user_id,

                      intent: INTENTS.updateAction,
                    });
                  } else {
                    const tempResponsibles = checked
                      ? action.responsibles.filter(
                          (id: string) => id !== person.user_id,
                        )
                      : [...action.responsibles, person.user_id];
                    handleActions({
                      ...action,
                      responsibles: tempResponsibles,

                      intent: INTENTS.updateAction,
                    });
                  }
                }}
              >
                <Avatar
                  item={{
                    image: person.image,
                    short: person.initials!,
                  }}
                  size="sm"
                />
                {`${person.name} ${person.surname}`}
              </ContextMenuCheckboxItem>
            ))}
          </ContextMenuSubContent>
        </ContextMenuPortal>
      </ContextMenuSub>
      {/* Color */}
      {isInstagramFeed(action.category) && (
        <ContextMenuSub>
          <ContextMenuSubTrigger className="bg-item">
            <div
              className="h-4 w-full rounded border"
              style={{ backgroundColor: action.color }}
            ></div>
          </ContextMenuSubTrigger>
          <ContextMenuPortal>
            <ContextMenuSubContent className="bg-content">
              {getPartners(action.partners, partners)[0].colors.map(
                (color: string, i: number) =>
                  i !== 1 && (
                    <ContextMenuItem
                      key={i}
                      className="bg-item flex items-center gap-2"
                      onSelect={() => {
                        handleActions({
                          ...action,
                          color: color,
                          intent: INTENTS.updateAction,
                        });
                      }}
                    >
                      <div
                        style={{
                          backgroundColor: color,
                        }}
                        className="h-4 w-full rounded border"
                      ></div>
                    </ContextMenuItem>
                  ),
              )}
            </ContextMenuSubContent>
          </ContextMenuPortal>
        </ContextMenuSub>
      )}

      {/* Prioridade */}
      <ContextMenuSub>
        <ContextMenuSubTrigger className="bg-item flex items-center gap-2">
          <Icons id={action.priority} className="size-3" type="priority" />
          <span>
            {
              priorities.find((priority) => priority.slug === action.priority)
                ?.title
            }
          </span>
        </ContextMenuSubTrigger>
        <ContextMenuPortal>
          <ContextMenuSubContent className="bg-content">
            {priorities.map((priority) => (
              <ContextMenuItem
                key={priority.slug}
                className="bg-item flex items-center gap-2"
                onSelect={() => {
                  handleActions({
                    ...action,
                    priority: priority.slug,
                    intent: INTENTS.updateAction,
                  });
                }}
              >
                <Icons id={priority.slug} type="priority" className="size-3" />
                {priority.title}
                <ContextMenuShortcut className="pl-2">
                  {priority.shortcut}
                </ContextMenuShortcut>
              </ContextMenuItem>
            ))}
          </ContextMenuSubContent>
        </ContextMenuPortal>
      </ContextMenuSub>
    </ContextMenuContent>
  );
});

/**
 * Calcula novos valores de data para uma ação, com base em diferentes configurações
 * 
 * @description Esta função determina a nova data para uma ação considerando se é uma data 
 * do Instagram, se deve ser relativa ao tempo atual, e se há constraints específicas para 
 * posts do Instagram (onde a data de postagem deve ser anterior à data da ação).
 * 
 * @param action - A ação que terá suas datas atualizadas
 * @param isInstagramDate - Se true, trabalha com instagram_date ao invés de date
 * @param minutes - Quantidade de minutos a adicionar na data base (padrão: 30)
 * @param isRelative - Se true, considera a data atual como base se a data da ação for passada
 * @param absoluteDate - Data específica a ser usada, ignorando cálculos relativos
 * 
 * @returns Objeto com os novos valores de data para atualizar a ação
 */

export function getNewDateValues(
  action: Action,
  isInstagramDate?: boolean,
  minutes = 30,
  isRelative = false,
  absoluteDate?: Date,
) {
  let values = {};
  let currentDate = isInstagramDate ? action.instagram_date : action.date;

  // determina a nova data
  // se for relativo, checa se a data da ação é anterior à data atual
  // caso sim, usa uma nova data, se não usa a data da ação
  // adiciona a quantidade de minutos na data base
  const newDate =
    absoluteDate ||
    addMinutes(
      isRelative
        ? isBefore(currentDate, new Date())
          ? new Date()
          : currentDate
        : new Date(),
      minutes,
    );

  // Se for uma ação do instagram

  if (isInstagramFeed(action.category, true)) {
    // Se a data de fazer ação for depois da data de postagem
    // define uma nova data de postagem, sendo uma hora antes da data da ação
    if (isInstagramDate) {
      values = {
        date: isAfter(action.date, newDate)
          ? format(subHours(newDate, 1), "yyyy-MM-dd HH:mm:ss")
          : action.date,
        instagram_date: format(newDate, "yyyy-MM-dd HH:mm:ss"),
      };
    } else {
      values = {
        date: format(newDate, "yyyy-MM-dd HH:mm:ss"),
        instagram_date: isAfter(newDate, action.instagram_date)
          ? format(addHours(newDate, 1), "yyyy-MM-dd HH:mm:ss")
          : action.instagram_date,
      };
    }
  } else {
    values = {
      date: format(newDate, "yyyy-MM-dd HH:mm:ss"),
    };
  }

  return values;
}

const ChangeDatePopover = ({
  action,
  handleActions,
  isInstagramDate,
  children,
  className,
}: {
  action: Action;
  handleActions: (data: HandleActionsDataType) => void;
  isInstagramDate: boolean;
  children: React.ReactNode;
  className?: string;
}) => {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(new Date(action.date));

  return (
    <ContextMenuSub>
      <ContextMenuSubTrigger
        className={cn("bg-item flex items-center gap-2", className)}
      >
        {children}
      </ContextMenuSubTrigger>
      <ContextMenuPortal>
        <ContextMenuSubContent className="bg-content">
          <Calendar
            locale={ptBR}
            mode="single"
            selected={selected}
            onSelect={(date) => {
              if (date) {
                setSelected(date);
              }
            }}
          />
          <div className="flex w-full justify-between gap-2">
            <div className="mx-auto flex w-full px-4 pb-4">
              <Input
                value={selected.getHours()}
                className="border-border w-1/2 rounded-r-none border border-r-0 text-right focus:z-10"
                type="number"
                min={0}
                max={23}
                onChange={(event) => {
                  let temp = selected;
                  temp.setHours(Number(event.target.value));
                  setSelected(temp);
                }}
              />
              <Input
                className="border-border w-1/2 rounded-l-none border border-l-0 text-left"
                type="number"
                min={0}
                max={59}
                value={selected.getMinutes()}
                onChange={(event) => {
                  let temp = selected;
                  temp.setMinutes(Number(event.target.value));
                  setSelected(temp);
                }}
              />
            </div>
            <div className="shrink-0">
              <Button>Salvar</Button>
            </div>
          </div>
          {/* <button
            onClick={() => {
              handleActions({
                ...action,
                date: isInstagramDate
                  ? format(selected, "yyyy-MM-dd HH:mm:ss")
                  : action.date,
                instagram_date: isInstagramDate
                  ? format(selected, "yyyy-MM-dd HH:mm:ss")
                  : action.instagram_date,

                intent: INTENTS.updateAction,
              });
            }}
          >
            Salvar
          </button> */}
        </ContextMenuSubContent>
      </ContextMenuPortal>
    </ContextMenuSub>
  );
};
