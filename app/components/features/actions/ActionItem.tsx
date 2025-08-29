import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from "react";
import { parseISO, isBefore, format } from "date-fns";
import {
  useNavigate,
  useMatches,
  useSearchParams,
  useSubmit,
} from "react-router";
import { useDraggable } from "@dnd-kit/core";
import { flushSync } from "react-dom";
import { HeartHandshakeIcon, RabbitIcon } from "lucide-react";
import { Checkbox } from "~/components/ui/checkbox";
import { INTENTS, PRIORITIES } from "~/lib/constants";
import {
  amIResponsible,
  Avatar,
  AvatarGroup,
  Content,
  FinishedCheck,
  getPartners,
  getQueryString,
  getResponsibles,
  Icons,
  isInstagramFeed,
  isSprint,
} from "~/lib/helpers";
import { formatActionDatetime } from "./shared/formatActionDatetime";
import { ShortcutActions } from "./shared/ShortcutActions";
import { ContextMenu, ContextMenuTrigger } from "~/components/ui/context-menu";
import { ActionContextMenu } from "./shared/ActionContextMenu";
import { SiInstagram } from "@icons-pack/react-simple-icons";

// Tipos de variantes
export type ActionVariant = "hair" | "line" | "content" | "block" | "grid";

interface NewActionProps {
  action: Action;
  variant?: ActionVariant;
  // Props comuns para todas as variantes
  date?: dateTimeFormat;
  long?: boolean;
  showResponsibles?: boolean;
  showCategory?: boolean;
  showDelay?: boolean;
  showPartner?: boolean;
  selectMultiple?: boolean;
  setSelectedActions?: React.Dispatch<React.SetStateAction<string[]>>;
  selectedActions?: string[];
  editingAction?: string | null;
  setEditingAction?: React.Dispatch<React.SetStateAction<string | null>>;
  sprint?: boolean;
  partner?: Partner; // Para ActionGrid
}

/**
 * Componente ActionItem unificado que suporta diferentes variantes
 * com context menu compartilhado e lógica consistente
 */
const DEFAULT_UPDATE_TIMESTAMP = () =>
  format(new Date(), "yyyy-MM-dd HH:mm:ss");

export const ActionItem = React.memo(function ActionItem({
  action,
  variant = "line",
  partner,
  date,
  long,
  showResponsibles,
  showCategory,
  showDelay,
  showPartner,
  selectMultiple,
  setSelectedActions,
  selectedActions,
  editingAction,
  setEditingAction,
}: NewActionProps) {
  // Shared state
  const buttonRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const submit = useSubmit();
  const navigate = useNavigate();
  const matches = useMatches();
  const [searchParams, setSearchParams] = useSearchParams();
  let params = new URLSearchParams(searchParams);

  const [edit, setEdit] = useState(false);
  const [isHover, setHover] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  // const isInstagramDate = isHydrated
  //   ? searchParams.get("instagram_date")
  //   : null;

  // Shared data from matches
  const { categories, states, sprints, partners, people, priorities, person } =
    matches[1].data as DashboardRootType;

  // Shared computed values
  const state = states.find((state) => state.slug === action.state) as State;
  const actionPartner = partners.find(
    (partner) => partner.slug === action.partners[0],
  ) as Partner;
  const actionPartners = getPartners(action.partners, partners);
  const responsibles = useMemo(
    () => getResponsibles(people, action.responsibles),
    [people, action.responsibles],
  );

  // Shared handlers
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

  // Shared drag and drop
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

  // Early return for invalid state
  if (!state || (!actionPartner && variant !== "grid")) {
    return null;
  }

  variant =
    variant === "content" && !isInstagramFeed(action.category)
      ? "block"
      : variant;

  // Unified delay logic
  const isDelayed = showDelay && 
    state.slug !== "finished" && 
    (isBefore(parseISO(action.instagram_date), new Date()) || 
     isBefore(parseISO(action.date), new Date()));

  const getDelayClasses = (variantType: string) => {
    if (!isDelayed) return "";
    
    switch (variantType) {
      case "content":
        return "action-content-delayed";
      case "block":
      case "line": 
      case "hair":
        return "action-delayed";
      default:
        return "";
    }
  };

  const renderActionVariant = () => {
    switch (variant) {
      case "hair":
        return (
          <div
            title={action.title}
            suppressHydrationWarning
            onClick={() => {
              navigate(
                `/dashboard/action/${action.id}/${actionPartner.slug}${getQueryString()}`,
              );
            }}
            ref={setNodeRef}
            {...listeners}
            {...attributes}
            style={style}
            className={isDragging ? "z-10" : ""}
          >
            <div
              className={`flex cursor-pointer items-center justify-between gap-2 overflow-hidden transition-all ${
                isBefore(parseISO(action.date), new Date()) &&
                state.slug !== "finished"
                  ? "bg-error/5 hover:bg-error/20 text-error"
                  : "hover:bg-muted/50"
              }`}
              onMouseEnter={() => setHover?.(true)}
              onMouseLeave={() => setHover?.(false)}
            >
              {isHover && !edit && <ShortcutActions action={action} />}

              <div className="flex items-center gap-2 overflow-hidden">
                <div
                  className="h-6 w-1 shrink-0"
                  style={{ backgroundColor: state.color }}
                />
                <div className="overflow-hidden text-xs tracking-tight text-ellipsis whitespace-nowrap">
                  {action.title}
                </div>
              </div>

              <div className="pr-2 text-[10px] tracking-tighter opacity-50">
                {new Date(action.date).toLocaleTimeString("pt-BR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </div>
          </div>
        );

      case "content":
        // Instagram feed content view
        return (
          <div
            title={isHydrated ? action.title : undefined}
            suppressHydrationWarning
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              if (!selectMultiple) {
                if (setEditingAction) {
                  if (editingAction === action.id) {
                    navigate(
                      `/dashboard/action/${action.id}/${actionPartner.slug}${getQueryString()}`,
                    );
                  } else {
                    setEditingAction(action.id);
                    // params.set("editing_action", action.id);
                    params.delete("show_feed");
                    setSearchParams(params);
                  }
                } else {
                  navigate(
                    `/dashboard/action/${action.id}/${actionPartner.slug}${getQueryString()}`,
                  );
                }
              }
            }}
            ref={setNodeRef}
            {...listeners}
            {...attributes}
            style={style}
            className="outline-none"
          >
            <div
              className={`ring-ring group/action ring-offset-background relative cursor-pointer rounded-md ring-offset-2 outline-hidden focus-within:ring-3 ${getDelayClasses("content")}`}
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
                partner={actionPartner!}
                showInfo
                date={{ timeFormat: 1 }}
                className={`the-action-content aspect-[3/4] overflow-hidden rounded-md hover:opacity-75`}
              />

              <div className="late-border border-background ring-error absolute inset-0 hidden rounded-md border ring-2"></div>

              <div className="absolute -top-3 right-2 flex gap-2">
                {selectMultiple && (
                  <Checkbox
                    checked={selectedActions?.includes(action.id)}
                    className="bg-accent border-background size-6 rounded-full border-2"
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
                {isSprint(action.id, sprints) && <SprintIcon hasBackground />}

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
          </div>
        );

      case "grid":
        return (
          <div
            className="group/action @container cursor-pointer overflow-hidden"
            onClick={() => {
              navigate(
                `/dashboard/action/${action.id}/${(partner || actionPartner).slug}${getQueryString()}`,
              );
            }}
          >
            <Content
              aspect="feed"
              action={action}
              partner={partner || actionPartner!}
              showInfo
              className="action-grid aspect-[3/4] overflow-hidden"
            />
          </div>
        );

      case "block":
        return (
          <div ref={setNodeRef} {...attributes} {...listeners} style={style}>
            <div
              title={isHydrated ? action.title : undefined}
              suppressHydrationWarning
              className={`action group/action action-item action-item-block @container cursor-pointer flex-col justify-between gap-2 text-sm ${
                isDragging ? "z-[100]" : "z-0"
              }`}
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
                  {/* Sprint */}
                  {isSprint(action.id, sprints) && <SprintIcon />}
                  {/* Partners | Clientes  */}
                  <AvatarGroup
                    partners={actionPartners}
                    ringColor="ring-card"
                  />
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
        );

      case "line":
      default:
        // Regular line variant
        return (
          <div
            title={isHydrated ? action.title : undefined}
            suppressHydrationWarning
            ref={setNodeRef}
            {...listeners}
            {...attributes}
            style={style}
            // [&>*]:border-red-500
            // estava aqui sem eu ver necessidade
            className={`action group/action action-item items-center gap-2 hover:z-100 ${
              isDragging ? "z-[100]" : "z-0"
            } ${long ? "px-4 py-3" : "p-3"} font-base @container md:text-sm ${getDelayClasses(variant)}`}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();

              if (!edit && !selectMultiple) {
                if (setEditingAction) {
                  if (editingAction === action.id) {
                    navigate(
                      `/dashboard/action/${action.id}/${actionPartner.slug}${getQueryString()}`,
                    );
                  } else {
                    setEditingAction(action.id);
                    // params.set("editing_action", action.id);
                    params.delete("show_feed");
                    setSearchParams(params);
                  }
                } else {
                  navigate(
                    `/dashboard/action/${action.id}/${actionPartner.slug}${getQueryString()}`,
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
                checked={selectedActions?.includes(action.id)}
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

            {/* Sprint */}
            {isSprint(action.id, sprints) && (
              <SprintIcon hasBackground={long} />
            )}

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
            {actionPartner && (showPartner || long) ? (
              <div
                title={getPartners(action.partners, partners)
                  .map((partner) => partner.title)
                  .join(" • ")}
                className={long ? "flex w-32 shrink-0 justify-center" : ""}
              >
                {getPartners(action.partners, partners).length === 1 ? (
                  <Avatar
                    item={{
                      short: actionPartner.short,
                      bg: actionPartner.colors[0],
                      fg: actionPartner.colors[1],
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
                })}{" "}
                {isInstagramFeed(action.category) &&
                  action.instagram_date &&
                  " | ".concat(
                    formatActionDatetime({
                      date: action.instagram_date,
                      dateFormat: 4,
                      timeFormat: 1,
                    }),
                  )}
              </div>
            ) : (
              date && (
                <div className="hidden shrink grow-0 text-right text-xs whitespace-nowrap opacity-50 md:text-[10px] @[130px]:block">
                  <span
                    className={
                      isInstagramFeed(action.category)
                        ? "group-hover/action:hidden"
                        : ""
                    }
                  >
                    {formatActionDatetime({
                      date: action.date,
                      timeFormat: 1,
                    })}
                  </span>
                  {isInstagramFeed(action.category) && (
                    <span className="hidden items-center gap-1 group-hover/action:flex">
                      <SiInstagram className="size-3" />
                      {formatActionDatetime({
                        date: action.instagram_date,
                        dateFormat: 2,
                        timeFormat: 1,
                      })}
                    </span>
                  )}
                </div>
              )
            )}
          </div>
        );
    }
  };

  // Para outras variantes, envolvemos com ContextMenu
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{renderActionVariant()}</ContextMenuTrigger>
      <ActionContextMenu action={action} handleActions={handleActions} />
    </ContextMenu>
  );
});

function SprintIcon({ hasBackground }: { hasBackground?: boolean }) {
  return (
    <div
      className={`grid size-5 shrink-0 place-content-center rounded-md ${hasBackground ? "bg-primary text-primary-foreground ring-background ring-2" : "text-foreground animate-pulse"}`}
    >
      <RabbitIcon className="size-4" />
    </div>
  );
}
