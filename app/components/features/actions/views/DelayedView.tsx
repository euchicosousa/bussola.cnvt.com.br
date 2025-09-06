import {
  ComponentIcon,
  ListIcon,
  ListTodoIcon,
  SearchIcon,
  SignalIcon,
} from "lucide-react";
import { useEffect, useState } from "react";

import Badge from "~/components/common/forms/Badge";
import { CategoriesView } from "~/components/features/actions/views/CategoriesView";
import { ActionsContainer } from "~/components/features/actions";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";

export function DelayedView({ actions }: { actions: Action[] }) {
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
    <div className="before:bg-border relative before:absolute before:-left-[100vw] before:h-px before:w-[200vw]">
      <div className="px-2 py-8 md:px-8 lg:py-24">
        <div className="flex flex-col justify-between gap-4 pb-8 md:flex-row">
          <div className="relative flex">
            <h2 className="text-3xl font-semibold tracking-tight">Atrasados</h2>
            <Badge value={actions.length} />
          </div>

          <div className="flex items-center justify-end gap-4">
            <div className="relative">
              <Input
                placeholder="Procurar ação"
                className="border"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <SearchIcon className="absolute top-1/2 right-2 size-4 -translate-y-1/2" />
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
          <ActionsContainer
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
    </div>
  ) : null;
}
