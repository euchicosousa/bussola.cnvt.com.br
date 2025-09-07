import {
  addDays,
  format,
  formatRelative,
  isThisWeek,
  isToday,
  subDays,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  CalendarClock,
  CalendarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ComponentIcon,
  GridIcon,
  KanbanIcon,
  Rows3Icon,
  Rows4Icon,
} from "lucide-react";
import { useState } from "react";
import { useMatches, useSearchParams } from "react-router";

import Badge from "~/components/common/forms/Badge";
import {
  CreateAction,
  ActionItem,
  type ActionVariant,
} from "~/components/features/actions";
import { CategoriesView } from "~/components/features/actions/views/CategoriesView";
import { HoursView } from "~/components/features/actions/views/HoursView";
import { KanbanView } from "~/components/features/actions/views/KanbanView";
import { Button } from "~/components/ui/button";
import { Calendar } from "~/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { Toggle } from "~/components/ui/toggle";
import { TIME_FORMAT, VARIANTS } from "~/lib/constants";
import {
  Avatar,
  sortActions,
  getActionsForThisDay,
  getInstagramFeed,
  Icons,
  isInstagramFeed,
} from "~/lib/helpers";
import { cn } from "~/lib/ui/utils";

export function TodayView({
  actions,
  className,
  date,
  fullSize: _fullSize,
}: {
  actions: Action[];
  className?: string;
  date?: Date;
  fullSize?: boolean;
}) {
  const [todayView, setTodayView] = useState<
    "kanban" | "hours" | "categories" | "feed"
  >("hours");
  const isInstagramDate = todayView === "feed";
  const [variant, setVariant] = useState<ActionVariant>(VARIANTS.LINE);
  const [currentDay, setCurrentDay] = useState(date || new Date());
  const currentActions = getActionsForThisDay({
    actions,
    date: currentDay,
    isInstagramDate,
  }).filter((action) =>
    isInstagramDate ? isInstagramFeed(action.category) : true,
  );

  console.log({ currentActions });

  const [searchParams, setSearchParams] = useSearchParams();
  const params = new URLSearchParams(searchParams);

  const matches = useMatches();
  const { states, partners } = matches[1].data as DashboardRootType;

  return (
    <>
      {/* Ações de Hoje */}
      <div className={cn(className)}>
        <div className="flex justify-between pb-8">
          <div className="flex">
            <div className="relative flex items-center gap-2">
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
              <Badge
                value={currentActions?.length}
                isDynamic={todayView !== "hours"}
              />

              <CreateAction
                date={format(currentDay, "yyyy-MM-dd")}
                mode="day"
              />
            </div>
            <Button
              onClick={() => {
                params.set(
                  "date",
                  format(subDays(currentDay, 1), "yyyy-MM-dd"),
                );
                setCurrentDay(subDays(currentDay, 1));
                setSearchParams(params);
              }}
              size={"icon"}
              variant={"ghost"}
              className="ml-12"
            >
              <ChevronLeftIcon className="size-4" />
            </Button>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant={"ghost"}>
                  <CalendarIcon />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="bg-content">
                <Calendar
                  locale={ptBR}
                  mode="single"
                  selected={currentDay}
                  onSelect={(date) => {
                    if (date) {
                      setCurrentDay(date);
                      params.set("date", format(date, "yyyy-MM-dd"));
                      setSearchParams(params);
                    }
                  }}
                />
              </PopoverContent>
            </Popover>
            <Button
              onClick={() => {
                params.set(
                  "date",
                  format(addDays(currentDay, 1), "yyyy-MM-dd"),
                );
                setCurrentDay(addDays(currentDay, 1));
                setSearchParams(params);
              }}
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
                  onPressedChange={(pressed) =>
                    setVariant(pressed ? VARIANTS.BLOCK : VARIANTS.LINE)
                  }
                  pressed={variant === VARIANTS.BLOCK}
                  title={
                    variant === VARIANTS.BLOCK
                      ? "Modo de visualização de bloco"
                      : "Modo de visualização de lista"
                  }
                >
                  {variant === VARIANTS.BLOCK ? (
                    <Rows3Icon className="size-4" />
                  ) : (
                    <Rows4Icon className="size-4" />
                  )}
                </Toggle>
              </div>
            )}
            {[
              // {
              //   id: "kanban",
              //   title: "Kanban",
              //   description: "Ver o Kanban de progresso",
              //   Icon: <KanbanIcon className="w-6" />,
              // },
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
                  setTodayView(button.id as "kanban" | "hours" | "categories");
                }}
              >
                {button.Icon}
                <div className="hidden md:block">{button.title}</div>
              </Button>
            ))}
          </div>
        </div>

        {currentActions?.length > 0 && (
          <>
            {todayView === "kanban" ? (
              <KanbanView
                actions={currentActions}
                list={variant === VARIANTS.LINE}
              />
            ) : todayView === "hours" ? (
              <HoursView actions={currentActions} />
            ) : todayView === "feed" ? (
              <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6">
                {(
                  sortActions(
                    getInstagramFeed({
                      actions: currentActions,
                    }) as Action[],
                    "state",
                    "asc",
                    states,
                  ) || []
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
                      <ActionItem
                        action={action}
                        variant="content"
                        dateDisplay={{ timeFormat: TIME_FORMAT.WITH_TIME }}
                      />
                    </div>
                  );
                })}
              </div>
            ) : (
              <CategoriesView actions={currentActions} />
            )}
          </>
        )}
      </div>
    </>
  );
}
