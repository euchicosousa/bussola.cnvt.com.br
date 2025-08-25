import React, { Fragment, useState } from "react";
import { Link, useMatches } from "react-router";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  ArchiveRestoreIcon,
  CalendarClock,
  ClockIcon,
  CopyIcon,
  PencilLineIcon,
  RabbitIcon,
  SaveIcon,
  TimerIcon,
  TrashIcon,
} from "lucide-react";

import {
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubTrigger,
  ContextMenuPortal,
  ContextMenuSubContent,
  ContextMenuCheckboxItem,
  ContextMenuGroup,
} from "~/components/ui/context-menu";
import { Calendar } from "~/components/ui/calendar";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { toast } from "~/components/ui/use-toast";
import { INTENTS } from "~/lib/constants";
import {
  getPartners,
  getQueryString,
  getResponsibles,
  Icons,
  isInstagramFeed,
  isSprint,
  Avatar,
} from "~/lib/helpers";
import { cn } from "~/lib/ui/utils";

interface ActionContextMenuProps {
  action: Action;
  isInstagramDate?: boolean;
  handleActions: (data: HandleActionsDataType) => void;
}

const ChangeDatePopover = ({
  date,
  onChangeDate,
  children,
  className,
}: {
  date: string;
  onChangeDate: (date: Date) => void;
  children: React.ReactNode;
  className?: string;
}) => {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(new Date(date));
  const [time, setTime] = useState(format(selected, "HH:mm:ss"));

  return (
    <ContextMenuSub open={open} onOpenChange={setOpen}>
      <ContextMenuSubTrigger
        className={cn("bg-item flex items-center gap-2", className)}
      >
        {children}
      </ContextMenuSubTrigger>
      <ContextMenuPortal>
        <ContextMenuSubContent className="bg-content">
          <div className="px-2 pt-4">
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
          </div>
          <div className="border-t p-3">
            <div className="flex items-center gap-3">
              <div className="relative grow">
                <Input
                  type="time"
                  step="1"
                  defaultValue={time}
                  value={time}
                  onChange={(e) => {
                    setTime(e.target.value);

                    // Parse the time value (HH:mm:ss)
                    const [hours, minutes, seconds] = e.target.value
                      .split(":")
                      .map(Number);

                    // Create new date with updated time
                    const newDate = new Date(selected);
                    newDate.setHours(hours, minutes, seconds || 0);

                    setSelected(newDate);
                  }}
                  className="w-full pl-9 text-right [&::-webkit-calendar-picker-indicator]:hidden"
                />
                <div className="text-muted-foreground/80 pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 peer-disabled:opacity-50">
                  <ClockIcon className="size-4" aria-hidden="true" />
                </div>
              </div>

              <Button
                onClick={() => {
                  onChangeDate(selected);
                  setOpen(false);
                }}
              >
                <SaveIcon className="size-4" />
              </Button>
            </div>
          </div>
        </ContextMenuSubContent>
      </ContextMenuPortal>
    </ContextMenuSub>
  );
};

/**
 * Shared context menu component for all action variants.
 * This component provides consistent context menu functionality across
 * ActionHair, ActionLine, ActionContent, ActionBlock, and ActionGrid.
 */
export const ActionContextMenu = React.memo(function ActionContextMenu({
  action,
  isInstagramDate,
  handleActions,
}: ActionContextMenuProps) {
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

  const state = states.find((state) => state.slug === action.state);

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
        date={action.date}
        onChangeDate={(date) => {
          handleActions({
            ...action,
            date: format(date, "yyyy-MM-dd HH:mm:ss"),
            intent: INTENTS.updateAction,
          });
        }}
      >
        <CalendarClock className="size-3" />
        <span>Mudar Data</span>
      </ChangeDatePopover>

      {isInstagramFeed(action.category) && (
        <ChangeDatePopover
          date={action.instagram_date}
          onChangeDate={(date) => {
            handleActions({
              ...action,
              instagram_date: format(date, "yyyy-MM-dd HH:mm:ss"),
              intent: INTENTS.updateAction,
            });
          }}
        >
          <CalendarClock className="size-3" />
          <span>Mudar Data do Instagram</span>
        </ChangeDatePopover>
      )}

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
