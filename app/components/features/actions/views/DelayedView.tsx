import { 
  ComponentIcon,
  ListIcon, 
  ListTodoIcon,
  SearchIcon,
  SignalIcon,
  XIcon 
} from "lucide-react";
import { useEffect, useState } from "react";

import Badge from "~/components/common/forms/Badge";
import { CategoriesView } from "~/components/features/actions/views/CategoriesView";
import { ListOfActions } from "~/components/features/actions";
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
    <>
      <div className="border-b"></div>
      <div className="px-2 py-8 md:px-8 lg:py-24">
        <div className="flex justify-between pb-8">
          <div className="relative flex">
            <h2 className="text-3xl font-semibold tracking-tight">Atrasados</h2>
            <Badge value={actions.length} />
          </div>

          <div className="flex items-center gap-4">
            <div className="flex gap-2">
              {showSearch && (
                <div className="relative">
                  <Input
                    value={query}
                    onChange={(e) => {
                      setQuery(e.target.value);
                    }}
                    className="pr-12"
                  />
                  <SearchIcon
                    className={`size-4 ${
                      showSearch ? "absolute top-3 right-4" : ""
                    }`}
                  />
                </div>
              )}

              <Button
                variant={"ghost"}
                onClick={() => {
                  setShowSearch(!showSearch);
                  setFiltered(actions);
                  setQuery("");
                }}
              >
                {showSearch ? (
                  <XIcon className={"size-4"} />
                ) : (
                  <SearchIcon className={`size-4`} />
                )}
              </Button>
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
          <ListOfActions
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
    </>
  ) : null;
}