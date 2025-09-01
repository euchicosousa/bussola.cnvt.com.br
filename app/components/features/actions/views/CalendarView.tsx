import {
  addDays,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  parseISO,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon, FilterIcon } from "lucide-react";
import { useState } from "react";
import { useMatches } from "react-router";

import { ListOfActions } from "~/components/features/actions";
import { Button } from "~/components/ui/button";
import { Calendar } from "~/components/ui/calendar";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";

export function CalendarView({ actions }: { actions: Action[] | null }) {
  const { categories } = useMatches()[1].data as DashboardRootType;

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

  const [categoryFilter, setCategoryFilter] = useState<Category[]>([]);

  const calendar = days.map((day) => {
    return {
      date: format(day, "yyyy-MM-dd", { locale: ptBR }),
      actions: actions?.filter(
        (action) =>
          isSameDay(parseISO(action.date), day) &&
          (categoryFilter.length === 0 ||
            categoryFilter.some((category) =>
              action.category.includes(category.slug),
            )),
      ),
    };
  });

  return (
    <div className="before:bg-border relative py-8 before:absolute before:top-0 before:-left-[100vw] before:h-px before:w-[200vw]">
      <div className="flex items-center justify-between gap-4 px-2 py-2 md:px-8">
        <div className="flex items-center gap-2">
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
                selected={parseISO(currentDate)}
                onSelect={(date) => {
                  if (date) {
                    setCurrentDate(
                      format(date, "yyyy-MM-dd", { locale: ptBR }),
                    );
                  }
                }}
              />
            </PopoverContent>
          </Popover>
        </div>
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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant={"ghost"}>
                {categoryFilter.length > 0
                  ? categoryFilter.map((category) => category.title).join(", ")
                  : "Filtros"}
                <FilterIcon />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-content">
              <DropdownMenuCheckboxItem
                className="bg-select-item"
                checked={categoryFilter.length === 0}
                onCheckedChange={() => {
                  setCategoryFilter([]);
                }}
              >
                Todos os itens
              </DropdownMenuCheckboxItem>
              {categories.map((category) => (
                <DropdownMenuCheckboxItem
                  key={category.id}
                  className="bg-select-item"
                  checked={categoryFilter.includes(category)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setCategoryFilter((prev) => [...prev, category]);
                    } else {
                      setCategoryFilter((prev) =>
                        prev.filter((c) => c.id !== category.id),
                      );
                    }
                  }}
                >
                  {category.title}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div className="scrollbars-h">
        {/* Calendar Header */}
        <div className="min-w-[1440px]">
          <div className="grid grid-cols-7 py-2 text-center text-xs font-medium tracking-wider uppercase">
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

                  <ListOfActions
                    actions={actions}
                    isHair
                    isFoldable
                    date={{ timeFormat: 1 }}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
