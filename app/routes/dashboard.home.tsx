import { useGSAP } from "@gsap/react";
import {
  addMonths,
  endOfDay,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { gsap } from "gsap";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  RabbitIcon,
  TimerIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  Link,
  type LoaderFunctionArgs,
  type MetaFunction,
  redirect,
  useLoaderData,
  useMatches,
  useOutletContext,
} from "react-router";
import invariant from "tiny-invariant";

import Badge from "~/components/common/forms/Badge";
import { Heading } from "~/components/common/forms/Headings";
import { ActionsContainer } from "~/components/features/actions";
import { CalendarView } from "~/components/features/actions/views/CalendarView";
import { DelayedView } from "~/components/features/actions/views/DelayedView";
import { TodayView } from "~/components/features/actions/views/TodayView";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Toggle } from "~/components/ui/toggle";
import {
  DATE_FORMAT,
  ORDER_ACTIONS_BY,
  STATE,
  VARIANTS,
} from "~/lib/constants";
import { createClient } from "~/lib/database/supabase";
import {
  getDelayedActions,
  getMonthsActions,
  getThisWeekActions,
  getTodayActions,
  getTomorrowActions,
  getTotalPayment,
  sortActions,
} from "~/lib/helpers";
import { useIDsToRemoveSafe } from "~/lib/hooks/data/useIDsToRemoveSafe";
import { usePendingDataSafe } from "~/lib/hooks/data/usePendingDataSafe";

gsap.registerPlugin(useGSAP);

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { supabase } = createClient(request);

  // const result = await fetch("https://br.storage.bunnycdn.com/agencia-cnvt/", {
  //   method: "GET",
  //   headers: { AccessKey: ACCESS_KEY!, accept: "application/json" },
  // });
  // const folders = await result.json() as [];

  const { data } = await supabase.auth.getClaims();

  if (!data?.claims) {
    return redirect("/login");
  }

  const user_id = data.claims.sub;

  const [{ data: people }, { data: partners }, { data: archivedPartners }] =
    await Promise.all([
      supabase.from("people").select("*").match({ user_id: user_id }),
      supabase.from("partners").select("slug").match({ archived: false }),
      supabase.from("partners").select("slug").match({ archived: true }),
    ]);

  invariant(people);
  invariant(partners);
  invariant(archivedPartners);

  const person = people[0];

  let start = startOfWeek(startOfMonth(new Date()));
  let end = endOfDay(endOfWeek(endOfMonth(addMonths(new Date(), 1))));

  const [{ data: actions }, { data: actionsChart }] = await Promise.all([
    supabase
      .from("actions")
      .select("*")
      .is("archived", false)
      .contains("responsibles", person.admin ? [] : [user_id])
      .containedBy("partners", partners.map((p) => p.slug)!)
      // .not("partners", "overlaps", archivedPartners.map((p) => p.slug)!)
      .gte("date", format(start, "yyyy-MM-dd HH:mm:ss"))
      .lte("date", format(end, "yyyy-MM-dd HH:mm:ss"))
      .order("title", { ascending: true }),
    supabase
      .from("actions")
      .select("id, category, state, date, partners, instagram_date")
      .is("archived", false)
      .contains("responsibles", person?.admin ? [] : [user_id])
      .containedBy("partners", partners.map((p) => p.slug)!),
  ]);

  return { actions, actionsChart };
};

export const meta: MetaFunction = () => {
  return [
    { title: "ʙússoʟa - Domine, Crie e Conquiste." },
    {
      name: "description",
      content:
        "Aplicativo de Gestão de Projetos Criado e Mantido pela Agência CNVT®. ",
    },
  ];
};

export default function DashboardIndex() {
  let { actions } = useLoaderData<typeof loader>();
  const matches = useMatches();

  const { setTransitioning } = useOutletContext() as ContextType;

  actions = actions || [];

  const { person } = matches[1].data as DashboardRootType;

  const { actions: pendingActions } = usePendingDataSafe();
  const { actions: deletingIDsActions } = useIDsToRemoveSafe();

  //Actions
  // Transform into a Map
  const actionsMap = new Map<string, Action>(
    actions.map((action) => [action.id, action]),
  );
  // Add pending Created/Updated Actions
  for (const action of pendingActions as Action[]) {
    actionsMap.set(action.id, action);
  }
  // Remove pending deleting Actions
  for (const id of deletingIDsActions) {
    actionsMap.delete(id);
  }
  // transform and sort
  actions = sortActions(Array.from(actionsMap, ([, v]) => v));

  const lateActions = getDelayedActions({
    actions: actions as Action[],
  }) as Action[];

  const nextActions = actions?.filter((action) => action.state != "finished");

  useEffect(() => {
    setTransitioning(false);
  }, []);

  return (
    <div
      className="scrollbars-v grid grid-cols-[0.5rem_1fr_0.5rem] justify-center md:grid-cols-[1rem_1fr_1rem] 2xl:grid-cols-[2rem_1fr_2rem]"
      id="main"
    >
      <div className="border-r"></div>
      <div className="w-full min-w-0">
        {/* Progresso  */}

        <div suppressHydrationWarning>
          {person.admin && <ActionsProgress />}
        </div>

        {/* Sprint */}
        <Sprint actions={actions} />

        {/* Hoje */}
        <div className="before:bg-border relative before:absolute before:-left-[100vw] before:h-px before:w-[200vw]"></div>
        <div className="overflow-x-hidden">
          <TodayView
            actions={actions as Action[]}
            className="px-2 py-8 md:px-8 lg:py-24"
          />
        </div>

        {/* Parceiros */}
        <Partners actions={actions as Action[]} />

        {/* Ações em Atraso */}

        <DelayedView actions={lateActions} />

        {/* Mês */}

        <CalendarView actions={actions} />

        {/* Financeiro */}

        <FinancialView
          actions={
            actions?.filter(
              (action) =>
                action.category === "finance" &&
                isSameMonth(new Date(), action.date),
            ) as Action[]
          }
        />

        {/* Próximas Ações */}
        <NextActions actions={nextActions as Action[]} />
      </div>
      <div className="border-l"></div>
    </div>
  );
}

function NextActions({ actions }: { actions: Action[] }) {
  const matches = useMatches();
  const { person } = matches[1].data as DashboardRootType;

  return (
    <div className="relative">
      <div className="before:bg-border relative px-2 before:absolute before:-left-[100vw] before:h-px before:w-[200vw] md:px-8">
        {/* Próximas ações */}
        <div className="py-8 lg:py-24">
          <div className="relative text-center">
            <Heading className="flex justify-center gap-2">
              Próximas Ações
              <Badge value={actions?.length || 0} />
            </Heading>
          </div>
          <ActionsContainer
            actions={actions}
            columns={!person.admin ? 1 : 3}
            isCollapsible={person.admin}
            orderBy="time"
            dateDisplay={{ dateFormat: DATE_FORMAT.SHORT }}
          />
        </div>
      </div>
    </div>
  );
}

function Partners({ actions }: { actions?: Action[] }) {
  const matches = useMatches();
  const { partners } = matches[1].data as DashboardRootType;
  const { actionsChart } = matches[2].data as DashboardIndexType;
  const lateActions = getDelayedActions({
    actions: actionsChart as Action[],
  });

  actions = actions || [];

  return (
    <div className="before:bg-border relative before:absolute before:-left-[100vw] before:h-px before:w-[200vw]">
      <div
        className={`grid grid-cols-4 md:grid-cols-5 ${Math.ceil(partners.length / 2) <= 6 ? "lg:grid-cols-6" : Math.ceil(partners.length / 2) === 7 ? "lg:grid-cols-7" : "lg:grid-cols-8"} `}
      >
        {partners.length > 0
          ? partners.map((partner) => (
              <Link
                to={`/dashboard/${partner.slug}`}
                className="hover:bg-foreground hover:text-background group flex flex-col justify-center p-8"
                key={partner.id}
              >
                <div className="relative self-center text-center text-xl leading-none font-bold uppercase sm:text-3xl">
                  {partner.short.length > 4 ? (
                    <>
                      <div>{partner.short.substring(0, 3)}</div>
                      <div> {partner.short.substring(3)} </div>
                    </>
                  ) : (
                    <>
                      <div>{partner.short.substring(0, 2)}</div>
                      <div> {partner.short.substring(2)} </div>
                    </>
                  )}
                  <Badge
                    className="absolute top-0 -right-8"
                    value={
                      lateActions.filter((action) =>
                        action.partners.find((p: any) => p === partner.slug),
                      ).length
                    }
                    isDynamic
                  />
                </div>

                <div className="mt-4 hidden w-full opacity-0 group-hover:opacity-100">
                  <ProgressBar
                    actions={actions.filter((action) =>
                      action.partners.find((p: any) => p === partner.slug),
                    )}
                  />
                </div>
              </Link>
            ))
          : null}
      </div>
    </div>
  );
}

function ActionsProgress() {
  const matches = useMatches();

  const { actions } = matches[2].data as DashboardIndexType;

  const todayActions = getTodayActions(actions);
  const tomorrowActions = getTomorrowActions(actions);
  const thisWeekActions = getThisWeekActions(actions);
  const thisMonthActions = getMonthsActions(actions);
  const nextMonthActions = getMonthsActions(actions, addMonths(new Date(), 1));
  const lateActions = getDelayedActions({ actions: actions });

  return (
    <div className="md:flex">
      <Heading className="flex h-full flex-col justify-center border-b px-8 py-8 text-left md:border-none lg:py-12">
        <div className="text-sm tracking-wider uppercase">
          Acompanhamento do
        </div>
        <div className="flex flex-row sm:text-7xl md:flex-col md:text-8xl 2xl:flex-row">
          <div>Pro</div>
          <div>gres</div>
          <div>so</div>
        </div>
      </Heading>

      <div className="grid w-full grid-cols-3 justify-center rounded select-none md:grid-cols-3 lg:col-span-2 2xl:grid-cols-6">
        {[
          {
            title: "Atrasados",
            actions: lateActions,
          },
          {
            title: "Hoje",
            actions: todayActions,
          },
          {
            title: "Amanhã",
            actions: tomorrowActions,
          },
          {
            title: "Semana",
            actions: thisWeekActions,
          },
          {
            title: format(new Date(), "MMMM", { locale: ptBR }),
            actions: thisMonthActions,
          },
          {
            title: format(addMonths(new Date(), 1), "MMMM", {
              locale: ptBR,
            }),
            actions: nextMonthActions,
          },
        ].map(({ actions, title }, i) => (
          <div
            key={i}
            className={`overflow-hidden px-8 py-8 md:border-l lg:py-12 ${i < 3 ? "border-b xl:border-b-0" : ""}`}
          >
            <h3 className="overflow-hidden text-xl font-medium text-ellipsis whitespace-nowrap capitalize">
              {title}
            </h3>
            <div className="my-2 text-7xl font-light whitespace-nowrap">
              {actions.length}
            </div>

            <ProgressBar actions={actions} />
          </div>
        ))}
      </div>
    </div>
  );
}

function Sprint({ actions }: { actions?: Action[] }) {
  actions = actions?.filter((a) => (a.sprints ? true : false)) || [];

  const [order, setOrder] = useState<ORDER>("state");
  const [descending, setDescending] = useState(false);
  // const ids = new Set(sprints?.map((s) => s.action_id));

  return actions.length > 0 ? (
    <div className="before:bg-border relative shrink-0 grow px-2 py-8 before:absolute before:top-0 before:-left-[100vw] before:h-px before:w-[200vw] md:px-8">
      <div className="flex h-auto items-start justify-between py-8">
        <div className="relative flex">
          <h2 className="text-3xl font-semibold tracking-tight">Sprints</h2>
        </div>

        <div className="flex items-center gap-2">
          <Select
            value={order}
            onValueChange={(value) => setOrder(value as ORDER)}
          >
            <SelectTrigger className="bg-transparent">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-content">
              <SelectItem className="bg-select-item" value="state">
                Status
              </SelectItem>
              <SelectItem className="bg-select-item" value="priority">
                Prioridade
              </SelectItem>
              <SelectItem className="bg-select-item" value="time">
                Data
              </SelectItem>
            </SelectContent>
          </Select>
          <Toggle
            pressed={descending}
            variant={"outline"}
            onPressedChange={(pressed) => setDescending(pressed)}
          >
            {descending ? (
              <ArrowDownIcon className="size-4" />
            ) : (
              <ArrowUpIcon className="size-4" />
            )}
          </Toggle>
          {actions.length > 0 && (
            <div
              className={`flex items-center gap-1 rounded p-1 px-4 text-sm font-semibold whitespace-nowrap text-white ${
                actions.reduce((a, b) => a + b.time, 0) > 70
                  ? "bg-rose-500"
                  : actions.reduce((a, b) => a + b.time, 0) > 30
                    ? "bg-amber-500"
                    : "bg-lime-500"
              }`}
            >
              <TimerIcon className="size-4 opacity-75" />
              <span>{actions.reduce((a, b) => a + b.time, 0)} minutos</span>
            </div>
          )}
        </div>
      </div>

      {actions?.length > 0 ? (
        <ActionsContainer
          variant={VARIANTS.BLOCK}
          actions={actions}
          orderBy={order}
          descending={descending}
          showDelay={true}
          columns={6}
        />
      ) : (
        <div className="flex items-center gap-2">
          <RabbitIcon className="size-8 opacity-25" />
          <span>Nenhuma ação no sprint atual</span>
        </div>
      )}
    </div>
  ) : null;
}

const ProgressBar = ({ actions }: { actions: ActionChart[] }) => {
  const matches = useMatches();
  const { states } = matches[1].data as DashboardRootType;

  if (actions.length === 0) {
    return <div className="bg-border/40 h-1 w-full rounded" />;
  }

  return (
    <div className="flex h-1 w-full">
      {states
        .map((state) => {
          return {
            state: state.title,
            actions: actions.filter((action) => action.state === state.slug)
              .length,
            fill: state.color,
          };
        })
        .map((progress) => (
          <div
            key={progress.state}
            style={{
              width: `${(progress.actions / actions.length) * 100}%`,
              backgroundColor: progress.fill,
            }}
          ></div>
        ))}
    </div>
  );
};

const FinancialView = ({ actions }: { actions: Action[] }) => {
  const { partners } = useMatches()[1].data as DashboardRootType;
  actions.filter((action) => action.category === "finance");
  return (
    <div className="relative" id="financial">
      <div className="before:bg-border relative px-2 before:absolute before:-left-[100vw] before:h-px before:w-[200vw] md:px-8">
        {/* Próximas ações */}
        <div className="py-8 lg:py-24">
          <div className="flex items-center justify-between gap-4">
            <div className="relative flex">
              <h2 className="text-3xl font-semibold tracking-tight">
                Pagamentos
              </h2>
              <Badge value={actions.length} />
            </div>
            <div className="flex items-center gap-4 text-2xl tracking-tighter">
              <span className="text-error font-medium">
                {getTotalPayment(
                  actions.filter((action) => action.state !== STATE.Concluído),
                )}
              </span>
              <span className="text-success font-medium">
                {getTotalPayment(
                  actions.filter((action) => action.state === STATE.Concluído),
                )}
              </span>

              <div className="text-right font-semibold">
                {getTotalPayment(actions)}
              </div>
            </div>
          </div>
          <div className="pt-4">
            <ActionsContainer
              columns={6}
              variant={VARIANTS.FINANCE}
              actions={actions}
              orderBy={ORDER_ACTIONS_BY.state}
              showDelay={true}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
