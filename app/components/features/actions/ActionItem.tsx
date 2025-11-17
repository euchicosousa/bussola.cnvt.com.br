import { useDraggable } from "@dnd-kit/core";
import { SiInstagram } from "@icons-pack/react-simple-icons";
import { format } from "date-fns";
import { HeartHandshakeIcon, RabbitIcon } from "lucide-react";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
} from "react";
import { useMatches, useNavigate, useSubmit } from "react-router";
import { ContextMenu, ContextMenuTrigger } from "~/components/ui/context-menu";
import { SelectionCheckbox } from "~/components/ui/selection-checkbox";
import { EditableTitle } from "~/components/ui/editable-title";
import {
  DATE_FORMAT,
  INTENTS,
  PRIORITIES,
  TIME_FORMAT,
  VARIANTS,
  type DateDisplay,
} from "~/lib/constants";
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
export type ActionVariant =
  | typeof VARIANTS.HAIR
  | typeof VARIANTS.LINE
  | typeof VARIANTS.CONTENT
  | typeof VARIANTS.BLOCK
  | typeof VARIANTS.GRID;

export interface NewActionProps {
  action: Action;
  variant?: ActionVariant;
  // Props comuns para todas as variantes
  dateDisplay?: DateDisplay;
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
  className?: string;
  imageSize?: "thumbnail" | "mini" | "preview" | "full";
  isDragging?: boolean;
}

/**
 * Componente ActionItem unificado que suporta diferentes variantes
 * com context menu compartilhado e lógica consistente
 */
const DEFAULT_UPDATE_TIMESTAMP = () =>
  format(new Date(), "yyyy-MM-dd HH:mm:ss");

export const ActionItem = React.memo(function ActionItem({
  action,
  variant = VARIANTS.LINE,
  partner,
  dateDisplay,
  showResponsibles,
  showCategory,
  showDelay,
  showPartner,
  showColor,
  selectMultiple,
  setSelectedActions,
  selectedActions,
  handleEditingAction,
  isInstagramDate,
  className,
  imageSize,
  isDragging,
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
  const { categories, states, partners, people, priorities, person } =
    matches[1].data as DashboardRootType;

  // Shared computed values
  const state = states.find((state) => state.slug === action.state) as State;
  const actionPartner = partners.find(
    (partner) => partner.slug === action.partners[0],
  ) as Partner;
  const actionPartners = getPartners(action.partners, partners);
  const mainPartner =
    variant === VARIANTS.FINANCE
      ? actionPartners.filter((p) => p.slug != "agenciacnvt")[0]
      : actionPartners[0];
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

  // Early return for invalid state
  if (!state || (!actionPartner && variant !== VARIANTS.GRID)) {
    return null;
  }

  // Use passed prop to determine if should use instagram_date
  const shouldUseInstagramDate =
    isInstagramDate && isInstagramFeed(action.category, true);

  variant =
    variant === VARIANTS.CONTENT && !isInstagramFeed(action.category)
      ? VARIANTS.BLOCK
      : variant;

  // Unified delay logic
  const isDelayed =
    showDelay &&
    (isActionDelayed(action, state, true) ||
      isActionDelayed(action, state, false));

  const getDelayClasses = (variantType: string) => {
    if (!isDelayed) return "";
    if (variantType === "content") {
      return "action-content-delayed";
    }
    return "action-delayed";
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
      case VARIANTS.HAIR:
        return (
          <div
            className={cn(
              `flex items-center justify-between gap-2 overflow-hidden transition-all ${
                isActionDelayed(action, state)
                  ? "bg-error/10 hover:bg-error/20 text-error-foreground"
                  : "hover:bg-muted/50 bg-card"
              }`,
            )}
            onMouseEnter={() => setHover?.(true)}
            onMouseLeave={() => setHover?.(false)}
            title={action.title}
            suppressHydrationWarning
            onClick={() => {
              if (!selectMultiple) {
                navigate(
                  `/dashboard/action/${action.id}/${actionPartner.slug}${getQueryString()}`,
                );
              }
            }}
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
        );

      // Instagram feed content view
      case VARIANTS.CONTENT:
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
            className={cn(
              `ring-ring group/action ring-offset-background relative cursor-pointer rounded-md ring-offset-2 outline-hidden outline-none focus-within:ring-3`,
              getDelayClasses("content"),
            )}
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
              dateDisplay={{ timeFormat: TIME_FORMAT.WITH_TIME }}
              className={`the-action-content aspect-[4/5] overflow-hidden rounded-md hover:opacity-75`}
              imageSize={imageSize}
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
              {isSprint(action, person.user_id) && (
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
        );

      case VARIANTS.GRID:
        return (
          <div
            suppressHydrationWarning
            className="group/action @container overflow-hidden"
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

      case VARIANTS.BLOCK:
        return (
          <div
            title={isHydrated ? action.title : undefined}
            suppressHydrationWarning
            className={cn(
              "action group/action action-item-block @container cursor-pointer flex-col justify-between gap-2 text-sm",
              getDelayClasses("block"),

              className,
            )}
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
            <StateBorder color={state.color} />
            {/* Title */}
            <EditableTitle
              title={action.title}
              isEditing={edit}
              isDragging={isDragging}
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
                {/* Sprint */}
                {isSprint(action, person.user_id) && <SprintIcon />}
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
        );

      case VARIANTS.FINANCE:
        return (
          <div
            title={isHydrated ? action.title : undefined}
            suppressHydrationWarning
            className={cn(
              "action group/action action-item-block @container cursor-pointer flex-col items-center justify-between gap-2 text-sm",
              getDelayClasses("block"),

              className,
            )}
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
            <StateBorder color={state.color} top />
            {/* Title */}
            <Avatar
              className={cn("-mt-8", isDelayed ? "ring-error" : "ring-card")}
              ring={true}
              size="xl"
              item={{
                short: mainPartner!.short,
                title: action.title,
                bg: mainPartner!.colors[0],
                fg: mainPartner!.colors[1],
              }}
            />

            <div className="text-center text-2xl">
              R$ {action.description?.replace(/(<([^>]+)>)/gi, "")}
            </div>

            <div className="text-center text-xs font-medium opacity-50 first-letter:uppercase">
              {isDelayed
                ? formatActionDatetime({
                    date: action.date,
                    dateFormat: DATE_FORMAT.RELATIVE,
                    prefix: "Em atraso ",
                  })
                : formatActionDatetime({
                    date: action.date,
                    dateFormat: 4,
                  })}
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
        );

      case VARIANTS.HOUR:
        return (
          <div
            title={isHydrated ? action.title : undefined}
            suppressHydrationWarning
            className={cn(
              "group/action action-item-hour border-foreground/10 flex w-full cursor-pointer justify-between gap-2 overflow-hidden border group-hover:w-0 hover:w-full hover:shrink hover:grow-1",
              className,
            )}
            style={{
              ...{
                backgroundColor: state.color,
                color: "white",
              },
            }}
            onMouseEnter={() => {
              setHover(true);
            }}
            onMouseLeave={() => {
              setHover(false);
            }}
          >
            <div className="overflow-hidden whitespace-nowrap">
              {action.title}
            </div>
            <div
              className={`${isHover ? "block" : "hidden"} flex items-center gap-4`}
            >
              <AvatarGroup
                avatars={action.partners.map((partner) => ({
                  item: {
                    short: partners.find((p) => p.slug === partner)!.short,
                    title: partner,
                    bg: "#fff",
                    fg: state.color,
                  },
                  style: { "--tw-ring-color": state.color } as CSSProperties,
                }))}
                size="xs"
              />
              <Icons id={action.category} className="size-4" />
              <AvatarGroup
                avatars={getResponsibles(people, action.responsibles).map(
                  (responsible) => ({
                    item: {
                      short: responsible.initials,
                      title: responsible.name,
                      image: responsible.image,
                    },
                    style: { "--tw-ring-color": state.color } as CSSProperties,
                  }),
                )}
                size="xs"
              />
            </div>
            {isHover && (
              <ShortcutActions
                action={action}
                onDeleteAction={setDeleteAction}
              />
            )}
          </div>
        );

      case VARIANTS.LINE:
      default:
        // Regular line variant
        return (
          <div
            suppressHydrationWarning
            title={isHydrated ? action.title : undefined}
            className={cn(
              `action group/action action-item @container items-center gap-2 px-3 py-2 hover:z-100`,
              isDragging ? "opacity-20" : "",
              getDelayClasses(variant),
            )}
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
                className="size-4"
                isSelected={
                  selectedActions?.some((a) => a.id === action.id) || false
                }
                action={action}
                onSelectionChange={setSelectedActions}
                currentSelection={selectedActions || []}
              />
            )}

            {/* State */}
            <StateBorder color={state.color} />

            {/* Sprint */}
            {isSprint(action, person.user_id) && <SprintIcon />}

            {/* Title */}
            <EditableTitle
              title={action.title}
              isEditing={edit}
              setIsEditing={setEdit}
              isDragging={isDragging}
              onSave={(newTitle) => {
                handleActions({
                  intent: INTENTS.updateAction,
                  ...action,
                  title: newTitle,
                });
              }}
              className={`relative flex w-full shrink overflow-hidden md:text-sm`}
            />
            {!edit && (
              <>
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
                      className={`hidden size-4 shrink-0 opacity-25 @[200px]:block`}
                    />
                  </div>
                )}

                {/* parceiro */}
                {actionPartner && showPartner ? (
                  <div
                    title={getPartners(action.partners, partners)
                      .map((partner) => partner.title)
                      .join(" • ")}
                  >
                    {getPartners(action.partners, partners).length === 1 ? (
                      <Avatar
                        size="xs"
                        item={{
                          short: actionPartner.short,
                          bg: actionPartner.colors[0],
                          fg: actionPartner.colors[1],
                        }}
                      />
                    ) : (
                      <AvatarGroup
                        size="xs"
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
                      <HeartHandshakeIcon />
                    </div>
                  )
                )}

                {/* priority */}
                {action.priority === PRIORITIES.high && (
                  <Icons id="high" className={`size-5 shrink-0 text-red-500`} />
                )}

                {/* Responsibles */}
                {showResponsibles ? (
                  <div className={`flex shrink-0 justify-center`}>
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
                      size={"xs"}
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
                          size="xs"
                        />
                      )}
                  </div>
                )}

                {dateDisplay && (
                  <div className="hidden shrink grow-0 text-right text-xs whitespace-nowrap opacity-50 md:text-[10px] @[130px]:block">
                    <span>
                      {formatActionDatetime({
                        date: shouldUseInstagramDate
                          ? action.instagram_date
                          : action.date,
                        timeFormat: 1,
                      })}
                    </span>
                  </div>
                )}
              </>
            )}
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

function StateBorder({ color, top }: { color: string; top?: boolean }) {
  const className = top
    ? "right-0 h-1 -mx-[1px] -mt-[1px] rounded-t-[4px]"
    : "bottom-0 -ml-[1px] -my-[1px] w-1 rounded-l-[4px]";
  return (
    <div
      className={cn("absolute top-0 left-0 shrink-0", className)}
      style={{ backgroundColor: color }}
    ></div>
  );
}
