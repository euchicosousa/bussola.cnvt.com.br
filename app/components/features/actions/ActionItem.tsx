import { useDraggable } from "@dnd-kit/core";
import { SiInstagram } from "@icons-pack/react-simple-icons";
import { format } from "date-fns";
import { HeartHandshakeIcon, RabbitIcon } from "lucide-react";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useMatches, useNavigate, useSubmit } from "react-router";
import { ContextMenu, ContextMenuTrigger } from "~/components/ui/context-menu";
import { SelectionCheckbox } from "~/components/ui/selection-checkbox";
import { EditableTitle } from "~/components/ui/editable-title";
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
import { isActionDelayed } from "~/lib/filters/actions";
import { cn, getTextColor } from "~/lib/ui";
import { ActionContextMenu } from "./shared/ActionContextMenu";
import { formatActionDatetime } from "./shared/formatActionDatetime";
import { ShortcutActions } from "./shared/ShortcutActions";
import { DeleteActionDialog } from "./shared/DeleteActionDialog";

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
  showColor?: boolean;
  selectMultiple?: boolean;
  setSelectedActions?: React.Dispatch<React.SetStateAction<Action[]>>;
  selectedActions?: Action[];
  editingAction?: string | null;
  handleEditingAction?: (actionId: string, actionPartnerSlug: string) => void;
  sprint?: boolean;
  partner?: Partner; // Para ActionGrid
  isInstagramDate?: boolean; // Para usar instagram_date quando appropriado
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
  showColor,
  selectMultiple,
  setSelectedActions,
  selectedActions,
  editingAction,
  handleEditingAction,
  isInstagramDate,
}: NewActionProps) {
  // Shared state
  const submit = useSubmit();
  const navigate = useNavigate();
  const matches = useMatches();

  const [edit, setEdit] = useState(false);
  const [isHover, setHover] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const [deleteAction, setDeleteAction] = useState<Action | null>(null);

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

  // Use passed prop to determine if should use instagram_date
  const shouldUseInstagramDate =
    isInstagramDate && isInstagramFeed(action.category, true);

  variant =
    variant === "content" && !isInstagramFeed(action.category)
      ? "block"
      : variant;

  // Unified delay logic
  const isDelayed =
    showDelay &&
    (isActionDelayed(action, state, true) ||
      isActionDelayed(action, state, false));

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

  const styleColors = useMemo(() => {
    return showColor && isInstagramFeed(action.category)
      ? {
          color: getTextColor(action.color),
          backgroundColor: action.color,
        }
      : undefined;
  }, [showColor, action.color]);

  const renderActionVariant = () => {
    switch (variant) {
      case "hair":
        return (
          <div
            title={action.title}
            suppressHydrationWarning
            onClick={() => {
              if (!selectMultiple) {
                navigate(
                  `/dashboard/action/${action.id}/${actionPartner.slug}${getQueryString()}`,
                );
              }
            }}
            ref={setNodeRef}
            {...listeners}
            {...attributes}
            style={style}
            className={isDragging ? "z-10" : ""}
          >
            <div
              className={`flex cursor-pointer items-center justify-between gap-2 overflow-hidden transition-all ${
                isActionDelayed(action, state)
                  ? "bg-error/5 hover:bg-error/20 text-error"
                  : "hover:bg-muted/50"
              }`}
              onMouseEnter={() => setHover?.(true)}
              onMouseLeave={() => setHover?.(false)}
              style={styleColors}
            >
              <div className="flex items-center gap-2 overflow-hidden">
                <div
                  className="h-6 w-1 shrink-0"
                  style={{ backgroundColor: state.color }}
                />
                {selectMultiple && setSelectedActions && (
                  <SelectionCheckbox
                    className="size-4"
                    isSelected={
                      selectedActions?.some((a) => a.id === action.id) || false
                    }
                    action={action}
                    onSelectionChange={setSelectedActions}
                    currentSelection={selectedActions || []}
                  />
                )}
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

      // Instagram feed content view
      case "content":
        return (
          <div
            title={isHydrated ? action.title : undefined}
            suppressHydrationWarning
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              if (!selectMultiple) {
                if (handleEditingAction) {
                  handleEditingAction(action.id, actionPartner.slug);
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
              <Content
                aspect="feed"
                action={action}
                partner={actionPartner!}
                showInfo
                date={{ timeFormat: 1 }}
                className={`the-action-content aspect-[4/5] overflow-hidden rounded-md hover:opacity-75`}
              />

              <div className="late-border border-background ring-error absolute inset-0 hidden rounded-md border ring-2"></div>

              <div className="absolute -top-3 right-2 flex gap-2">
                {selectMultiple && setSelectedActions && (
                  <SelectionCheckbox
                    className="border-background"
                    isSelected={
                      selectedActions?.some((a) => a.id === action.id) || false
                    }
                    action={action}
                    onSelectionChange={setSelectedActions}
                    currentSelection={selectedActions || []}
                  />
                )}
                {isSprint(action.id, sprints) && (
                  <SprintIcon hasBackground className="size-6" />
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
          </div>
        );

      case "grid":
        return (
          <div
            className="group/action @container cursor-pointer overflow-hidden"
            onClick={() => {
              if (!selectMultiple) {
                navigate(
                  `/dashboard/action/${action.id}/${(partner || actionPartner).slug}${getQueryString()}`,
                );
              }
            }}
          >
            <Content
              aspect="feed"
              action={action}
              partner={partner || actionPartner!}
              showInfo
              className="action-grid aspect-[4/5] overflow-hidden"
            />
            <div className="absolute -top-3 right-3">
              {selectMultiple && setSelectedActions && (
                <SelectionCheckbox
                  className="border-background"
                  isSelected={
                    selectedActions?.some((a) => a.id === action.id) || false
                  }
                  action={action}
                  onSelectionChange={setSelectedActions}
                  currentSelection={selectedActions || []}
                />
              )}
            </div>
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
              style={styleColors}
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                if (!edit && !selectMultiple) {
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
              {/* Title */}
              <EditableTitle
                title={action.title}
                isEditing={edit}
                setIsEditing={setEdit}
                onSave={(newTitle) => {
                  handleActions({
                    intent: INTENTS.updateAction,
                    ...action,
                    title: newTitle,
                  });
                }}
                className="leading-tighter relative overflow-hidden text-xl font-medium tracking-tighter"
              />

              <div className="flex items-center justify-between gap-4 overflow-x-hidden py-1">
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
                      date: shouldUseInstagramDate
                        ? action.instagram_date
                        : action.date,
                      dateFormat: 2,
                      timeFormat: 1,
                    })}
                  </span>
                  <span className="hidden @[240px]:block @[360px]:hidden">
                    {formatActionDatetime({
                      date: shouldUseInstagramDate
                        ? action.instagram_date
                        : action.date,
                      dateFormat: 3,
                      timeFormat: 1,
                    })}
                  </span>
                  <span className="hidden @[360px]:block">
                    {formatActionDatetime({
                      date: shouldUseInstagramDate
                        ? action.instagram_date
                        : action.date,
                      dateFormat: 4,
                      timeFormat: 1,
                    })}
                  </span>
                  •<div>{action.time.toString().concat("m")}</div>
                </div>
              </div>

              <div className="absolute -top-3 right-3">
                {selectMultiple && setSelectedActions && (
                  <SelectionCheckbox
                    className="border-background"
                    isSelected={
                      selectedActions?.some((a) => a.id === action.id) || false
                    }
                    action={action}
                    onSelectionChange={setSelectedActions}
                    currentSelection={selectedActions || []}
                  />
                )}
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
          >
            <div
              // [&>*]:border-red-500
              // estava aqui sem eu ver necessidade
              className={`action group/action action-item items-center gap-2 hover:z-100 ${
                isDragging ? "z-[100]" : "z-0"
              } ${long ? "px-4 py-3" : "p-3"} font-base @container md:text-sm ${getDelayClasses(variant)}`}
              style={styleColors}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();

                if (!edit && !selectMultiple) {
                  if (handleEditingAction) {
                    handleEditingAction(action.id, actionPartner.slug);
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

              {selectMultiple && setSelectedActions && (
                <SelectionCheckbox
                  isSelected={
                    selectedActions?.some((a) => a.id === action.id) || false
                  }
                  action={action}
                  onSelectionChange={setSelectedActions}
                  currentSelection={selectedActions || []}
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
              <EditableTitle
                title={action.title}
                isEditing={edit}
                setIsEditing={setEdit}
                onSave={(newTitle) => {
                  handleActions({
                    intent: INTENTS.updateAction,
                    ...action,
                    title: newTitle,
                  });
                }}
                className={`relative flex w-full shrink overflow-hidden ${
                  long ? "text-base" : ""
                }`}
              />

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
                    <HeartHandshakeIcon
                      className={long ? "size-6" : "size-4"}
                    />
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
          </div>
        );
    }
  };

  // Para outras variantes, envolvemos com ContextMenu
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{renderActionVariant()}</ContextMenuTrigger>
      <ActionContextMenu
        action={action}
        handleActions={handleActions}
        onDeleteAction={setDeleteAction}
      />
      {isHover && !edit && (
        <ShortcutActions
          action={action as Action}
          onDeleteAction={setDeleteAction}
        />
      )}
      {deleteAction && (
        <DeleteActionDialog
          isOpen={true}
          onOpenChange={() => setDeleteAction(null)}
          onConfirm={() => {
            handleActions({
              ...deleteAction,
              intent: INTENTS.deleteAction,
            });
            setDeleteAction(null);
          }}
          actionTitle={deleteAction.title}
          isArchived={!!deleteAction.archived}
          isPermanent={false}
        />
      )}
    </ContextMenu>
  );
});

function SprintIcon({
  hasBackground,
  className,
}: {
  hasBackground?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        `grid size-5 shrink-0 place-content-center rounded-md`,
        hasBackground
          ? "bg-primary text-primary-foreground ring-background ring-2"
          : "text-foreground animate-pulse",
        className,
      )}
    >
      <RabbitIcon className="size-4" />
    </div>
  );
}
