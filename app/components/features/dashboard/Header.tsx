import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  ArchiveIcon,
  CalendarPlusIcon,
  Grid3x3Icon,
  HandshakeIcon,
  HelpCircle,
  HexagonIcon,
  LogOutIcon,
  MenuIcon,
  MonitorIcon,
  MoonIcon,
  PlusIcon,
  SearchIcon,
  SettingsIcon,
  SunIcon,
  UserIcon,
  Users2Icon,
} from "lucide-react";
import { Fragment, useState } from "react";
import {
  Link,
  useLocation,
  useMatches,
  useNavigate,
  useNavigation,
  useOutletContext,
  useSearchParams,
} from "react-router";
import Loader from "~/components/common/feedback/Loader";
import { CircularProgress } from "~/components/common/feedback/Progress";
import CreateAction from "~/components/features/actions/CreateAction";
import { SOW } from "~/lib/constants";
import {
  Avatar,
  Bussola,
  getDelayedActions,
  ReportReview,
} from "~/lib/helpers";

import { Button } from "~/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "~/components/ui/command";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";

import { Theme, useTheme } from "remix-themes";
import Badge from "~/components/common/forms/Badge";
import { getMonthsActions } from "~/lib/helpers";
import { ActionsContainer } from "../actions";

export default function Header({
  setOpen,
}: {
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const matches = useMatches();
  const navigation = useNavigation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [theme, setTheme] = useTheme();
  const isLoading = navigation.state !== "idle";

  const { showFeed, setShowFeed, editingAction, setEditingAction } =
    useOutletContext() as ContextType;

  const { person } = matches[1].data as DashboardRootType;
  let { actions, actionsChart, partner } = (
    matches[3] ? matches[3].data : {}
  ) as {
    actions: Action[];
    actionsChart: ActionChart[];
    partner: Partner;
  };

  actionsChart = matches[2].data
    ? (matches[2].data as DashboardIndexType).actionsChart
    : actionsChart;

  actions = matches[2].data
    ? (matches[2].data as DashboardIndexType).actions
    : actions;

  partner =
    matches[2].data && !partner
      ? (matches[2].data as { partner: Partner }).partner
      : partner;

  let lateActions = getDelayedActions({ actions: actions as Action[] });

  const date = searchParams.get("date")
    ? parseISO(searchParams.get("date") as string)
    : new Date();

  return (
    <header
      className={`flex items-center justify-between gap-4 border-b px-6 py-2`}
    >
      {/* Logo */}
      <div className="relative flex items-center gap-1">
        <Link
          to="/dashboard"
          className="ring-ring ring-offset-background -ml-2 rounded px-4 py-2 outline-hidden focus:ring-2"
        >
          <Bussola className="md:hidden" size="md" short />
          <Bussola className="hidden md:block" size="xs" />
        </Link>
        {/* Atrasados */}
        <PopoverLateActions
          link={`/dashboard/late${partner ? `?partner_slug=${partner?.slug}` : ""}`}
          actions={lateActions}
        />
        {/* <Link
          to={`/dashboard/late${partner ? `?partner_slug=${partner?.slug}` : ""}`}
          className="ring-ring ring-offset-background absolute top-0 right-1 translate-x-full rounded-full ring-offset-2 outline-none focus:ring-2"
        >
          <Badge value={lateActions.length} isDynamic size="sm" />
        </Link> */}
      </div>
      <div className="flex items-center gap-4 md:gap-4">
        {/* Revisão e Instagram */}
        <div className="flex items-center gap-1">
          {partner ? (
            <>
              <ReportReview partner={partner} />
              <Button
                variant={showFeed ? "secondary" : "ghost"}
                onClick={() => {
                  if (showFeed) {
                    // Update global state FIRST for instant UX
                    setShowFeed(false);

                    // Then sync URL in background
                    const newParams = new URLSearchParams(searchParams);
                    newParams.delete("show_feed");
                    setSearchParams(newParams, { replace: true });
                  } else {
                    // Update global state FIRST for instant UX
                    setShowFeed(true);
                    // Remove editing if active to avoid conflicts
                    setEditingAction(null);

                    // Then sync URL in background
                    const newParams = new URLSearchParams(searchParams);
                    newParams.set("show_feed", "true");
                    newParams.delete("editing_action");
                    setSearchParams(newParams, { replace: true });
                  }
                }}
                size={"icon"}
              >
                <Grid3x3Icon className="size-6" />
              </Button>
            </>
          ) : null}

          {/* Busca Search */}

          <Button
            variant={"ghost"}
            onClick={() => {
              setOpen((value) => !value);
            }}
            size={"icon"}
          >
            <SearchIcon className="size-6" />
          </Button>

          <div suppressHydrationWarning>
            {person.admin && partner && (
              <Button variant={"ghost"} size={"icon"} asChild>
                <Link to={`/dashboard/admin/partner/${partner.slug}`}>
                  <SettingsIcon className="size-4" />
                </Link>
              </Button>
            )}
          </div>
        </div>

        {/* Botão de criar ação */}

        <CreateAction mode="plus" shortcut />

        {/* parceiros         */}
        <div className="flex items-center gap-4">
          {partner && (
            <Link to={`/dashboard/${partner.slug}`}>
              <div className="flex gap-4">
                <div className="relative">
                  <Avatar
                    size="md"
                    item={{
                      short: partner.short,
                      bg: partner.colors[0],
                      fg: partner.colors[1],
                    }}
                  />

                  <CircularProgress
                    actions={getMonthsActions(actions, date)}
                    title={format(new Date(), "MMMM 'de' yyyy", {
                      locale: ptBR,
                    })}
                    className="absolute -top-1/2 -left-1/2"
                  />
                </div>
                <span className="hidden text-2xl font-bold tracking-tight lg:block">
                  {partner.title}
                </span>
              </div>
            </Link>
          )}
          <PartnerCombobox />
        </div>

        {/* menu de ações */}
        {person && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="relative rounded-full p-1" variant={"ghost"}>
                <Avatar
                  size="md"
                  item={{
                    image: person.image,
                    short: person.initials!,
                  }}
                />
                {isLoading && (
                  <div className="absolute top-0 right-0">
                    <Loader size="lgs" />
                  </div>
                )}
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent className="bg-content mr-4">
              <DropdownMenuSub>
                <DropdownMenuSubTrigger className="bg-item">
                  {theme === Theme.LIGHT && (
                    <SunIcon className="size-4 opacity-50" />
                  )}
                  {theme === Theme.DARK && (
                    <MoonIcon className="size-4 opacity-50" />
                  )}
                  {theme === null && (
                    <MonitorIcon className="size-4 opacity-50" />
                  )}
                  <div>
                    Tema{" "}
                    <span className="font-medium uppercase">
                      {theme || "system"}
                    </span>
                  </div>
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent className="bg-content">
                  <DropdownMenuCheckboxItem
                    checked={theme === Theme.LIGHT}
                    onCheckedChange={() => setTheme(Theme.LIGHT)}
                    className="bg-select-item"
                  >
                    <SunIcon className="mr-2 size-4 opacity-50" />
                    <div>Light Mode</div>
                  </DropdownMenuCheckboxItem>

                  <DropdownMenuCheckboxItem
                    checked={theme === Theme.DARK}
                    onCheckedChange={() => setTheme(Theme.DARK)}
                    className="bg-select-item"
                  >
                    <MoonIcon className="mr-2 size-4 opacity-50" />
                    <div>Dark Mode</div>
                  </DropdownMenuCheckboxItem>

                  <DropdownMenuCheckboxItem
                    checked={theme === null}
                    onCheckedChange={() => setTheme(null)}
                    className="bg-select-item"
                  >
                    <MonitorIcon className="mr-2 size-4 opacity-50" />
                    <div>System Mode</div>
                  </DropdownMenuCheckboxItem>
                </DropdownMenuSubContent>
              </DropdownMenuSub>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                className="bg-item"
                id="archived"
                onSelect={() => navigate(`/dashboard/me`)}
              >
                <UserIcon className="size-4 opacity-50" />
                <div>Minha conta</div>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="bg-item"
                id="archived"
                onSelect={() =>
                  navigate(
                    `/dashboard/${
                      partner ? partner.slug.concat("/") : ""
                    }archived`,
                  )
                }
              >
                <ArchiveIcon className="size-4 opacity-50" />
                <div>Arquivados</div>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="bg-item"
                id="help"
                onSelect={() => navigate("/dashboard/help")}
              >
                <HelpCircle className="size-4 opacity-50" />
                <div>Ajuda</div>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="bg-item"
                id="ajuda"
                onSelect={() => navigate("/logout")}
              >
                <LogOutIcon className="size-4 opacity-50" />
                <div>Sair</div>
              </DropdownMenuItem>
              <div suppressHydrationWarning>
                {person.admin && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="bg-item"
                      id="new-partner"
                      onSelect={() =>
                        navigate("/dashboard/admin/celebration/new")
                      }
                    >
                      <CalendarPlusIcon className="size-4 opacity-50" />
                      <div>Novo Data Comemorativa</div>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="bg-item"
                      id="partners"
                      onSelect={() => navigate("/dashboard/cnvt6")}
                    >
                      <HexagonIcon className="size-4 opacity-50" />
                      <div>CNVT.6</div>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="bg-item"
                      id="partners"
                      onSelect={() => navigate("/dashboard/admin/partners")}
                    >
                      <HandshakeIcon className="size-4 opacity-50" />
                      <div>Parceiros</div>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="bg-item"
                      id="new-partner"
                      onSelect={() => navigate("/dashboard/admin/partner/new")}
                    >
                      <PlusIcon className="size-4 opacity-50" />
                      <div>Novo parceiro</div>
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="bg-item"
                      id="users"
                      onSelect={() => navigate("/dashboard/admin/users/")}
                    >
                      <Users2Icon className="size-4 opacity-50" />
                      <div>Usuários</div>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="bg-item"
                      id="new-user"
                      onSelect={() => navigate("/dashboard/admin/user/new")}
                    >
                      <PlusIcon className="size-4 opacity-50" />
                      <div>Novo usuário</div>
                    </DropdownMenuItem>
                  </>
                )}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  );
}

function PartnerCombobox() {
  const matches = useMatches();
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);

  const { partners } = matches[1].data as DashboardRootType;
  const partnersBySOW = [
    { category: SOW.marketing, title: "Consultoria de Marketing" },
    { category: SOW.socialmedia, title: "Social Media" },
    { category: SOW.demand, title: "Sob demanda" },
  ].map((sow) => ({
    title: sow.title,
    partners: partners.filter((partner) => partner.sow === sow.category),
  }));
  const [searchParams, setSearchParams] = useSearchParams(useLocation().search);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger className="outline-none" asChild>
        <div className="flex cursor-pointer items-center gap-2">
          {/* <ChevronsUpDownIcon className="size-6" /> */}
          <MenuIcon className="size-6" />
        </div>
      </PopoverTrigger>
      <PopoverContent className="mx-8 bg-transparent p-0">
        <Command className="outline-none">
          <CommandInput />
          <CommandList>
            <CommandEmpty>Nenhum Parceiro encontrado</CommandEmpty>
            {partnersBySOW.map((sow, i) => (
              <Fragment key={i}>
                <CommandGroup heading={sow.title} key={i}>
                  {sow.partners.map((partner) => (
                    <CommandItem
                      value={partner.slug}
                      key={partner.id}
                      className="bg-item flex"
                      onSelect={(value) => {
                        navigate(`/dashboard/${value}`);
                        setOpen(false);
                      }}
                    >
                      {partner.title}
                    </CommandItem>
                  ))}
                </CommandGroup>
                <CommandSeparator />
              </Fragment>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

function PopoverLateActions({
  link,
  actions,
}: {
  link: string;
  actions: Action[];
}) {
  // const data = useMatches()[2].data;
  // if (!data) {
  //   return null;
  // }
  // const { actions: actionsFull } = data as {
  //   actions: Action[];
  // };

  // if (!actionsFull || actionsFull.length === 0) return null;

  // const lateActions = actionsFull.filter((af) =>
  //   actions.find((a) => a.id === af.id),
  // );

  if (!actions || actions.length === 0) {
    return null;
  }

  return (
    <Popover>
      <PopoverTrigger>
        <Badge value={actions.length} isDynamic size="sm" />
      </PopoverTrigger>
      <PopoverContent className="scrollbars-v max-h-[50vh] min-w-80">
        <ActionsContainer actions={actions} orderBy="date" />
      </PopoverContent>
    </Popover>
  );
}
