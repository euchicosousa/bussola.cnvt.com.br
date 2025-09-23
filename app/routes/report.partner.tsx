import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isSameYear,
  isToday,
  parseISO,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import {
  Link,
  redirect,
  useLoaderData,
  useRevalidator,
  type LoaderFunctionArgs,
  type MetaFunction,
} from "react-router";

import { ptBR } from "date-fns/locale";
import {
  CalendarDaysIcon,
  GalleryVerticalIcon,
  Grid3X3Icon,
  Rows3Icon,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import invariant from "tiny-invariant";
import { createClient } from "~/lib/database/supabase";
import {
  Avatar,
  Content,
  getInstagramFeed,
  isInstagramFeed,
} from "~/lib/helpers";
import { DATE_FORMAT, TIME_FORMAT } from "~/lib/constants/constants";

export const config = { runtime: "edge" };

type loaderData = {
  action?: Action;
  actions?: Action[];
  partner?: Partner;
  partners?: Partner[];
  categories?: Category[];
  range?: string[];
  states?: State[];
};

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const { supabase } = createClient(request);

  const searchParams = new URL(request.url).searchParams;
  const today = new Date();
  const range =
    searchParams.get("range") !== null
      ? searchParams.get("range")!.split("---")
      : [
          format(startOfWeek(startOfMonth(today)), "yyyy-MM-dd"),
          format(endOfWeek(endOfMonth(today)), "yyyy-MM-dd"),
        ];

  const action = searchParams.get("action");
  const slug = params["partner"];

  if (!slug) {
    return redirect("/dashboard");
  }

  if (action) {
    const [{ data: post }, { data: partner }] = await Promise.all([
      // @ts-ignore
      supabase.from("actions").select("*").eq("id", action).single(),
      supabase.from("partners").select().match({ slug }).single(),
    ]);

    return {
      partner,
      action: post,
    };
  } else {
    let [start, end] = [
      format(
        new Date(
          Number(range[0].split("-")[0]),
          Number(range[0].split("-")[1]) - 1,
          Number(range[0].split("-")[2]),
        ),
        "yyyy-MM-dd 00:00:00",
      ),
      format(
        new Date(
          Number(range[1].split("-")[0]),
          Number(range[1].split("-")[1]) - 1,
          Number(range[1].split("-")[2]),
        ),
        "yyyy-MM-dd 23:59:59",
      ),
    ];

    const [
      { data: actions },
      { data: partner },
      { data: partners },
      { data: categories },
      { data: states },
    ] = await Promise.all([
      supabase
        .from("actions")
        .select("*")
        .is("archived", false)
        // @ts-ignore
        .neq("state", "idea")
        .contains("partners", [slug])
        // @ts-ignore
        .in("category", ["post", "reels", "carousel", "stories"])
        .gte("instagram_date", start)
        .lte("instagram_date", end)
        .order("instagram_date", { ascending: true }),
      await supabase.from("partners").select().match({ slug }).single(),
      await supabase.from("partners").select().match({ archived: false }),
      supabase.from("categories").select(),
      supabase.from("states").select(),
    ]);

    invariant(partner, "O Parceiro não foi encontrado");

    return {
      actions,
      partner,
      partners,
      categories,
      range: [range[0].replace(/-/g, "/"), range[1].replace(/-/g, "/")],
      states,
    };
  }
};

export const meta: MetaFunction = ({ data }) => {
  const partner = (data as { partner: Partner }).partner;

  return [{ title: "Relatório de " + partner.title }];
};

export default function ReportPage() {
  let { action, partner, range, actions } = useLoaderData<loaderData>();
  const revalidator = useRevalidator();
  const [view, setView] = useState<
    "instagram" | "feed" | "list" | "calendar" | "post"
  >("instagram");

  invariant(partner, "partner");
  actions = actions || [];

  let View = <ActionReport action={action as Action} partner={partner} />;

  // categories = categories || [];
  if (!action && range) {
    switch (view) {
      case "calendar":
        View = (
          <CalendarReportView
            actions={actions}
            partner={partner}
            range={range}
          />
        );
        break;
      case "feed":
        View = <FeedReportView actions={actions} partner={partner} />;
        break;
      case "instagram":
        View = <InstagramReportView actions={actions} partner={partner} />;
        break;
      case "list":
        View = <ListActionReport actions={actions!} />;
        break;
    }
  }

  return (
    <div className="min-h-[100vh] bg-slate-100 font-sans text-gray-500 antialiased">
      <div className="mx-auto lg:max-w-lg">
        <div className="flex flex-col p-4 pb-2">
          <div className="mb-4 flex items-center gap-4">
            <Avatar
              item={{
                short: partner.short,
                bg: partner.colors[0],
                fg: partner.colors[1],
              }}
              size="xl"
              isLowerCase
            />
            <div>
              <h2 className="text-2xl leading-none font-semibold tracking-tighter text-gray-950">
                {partner.title}
              </h2>
              <div>@{partner.slug}</div>
            </div>
          </div>
          <div className="text-sm">
            <div>✅ Aprovação de Conteúdo</div>
            <div className="flex items-center justify-between gap-4">
              {range ? (
                <>
                  📅
                  {` ${format(
                    range[0],
                    "d".concat(
                      !isSameMonth(range[0], range[1])
                        ? "/MM".concat(
                            !isSameYear(range[0], range[1]) ? " 'de' yyyy" : "",
                          )
                        : "",
                    ),
                    { locale: ptBR },
                  )} a
${format(range[1], "d/MM", { locale: ptBR })}`}{" "}
                  <div className="flex gap-2 text-[10px] font-medium tracking-wider uppercase">
                    <Link
                      className="hover:underline"
                      to={`/report/${partner.slug}?range=${format(
                        startOfWeek(new Date()),
                        "yyyy-MM-dd",
                      )}---${format(endOfWeek(new Date()), "yyyy-MM-dd")}`}
                      reloadDocument
                    >
                      Semana
                    </Link>{" "}
                    |{" "}
                    <Link
                      className="hover:underline"
                      to={`/report/${partner.slug}`}
                      reloadDocument
                    >
                      {format(new Date(), "MMMM", { locale: ptBR })}
                    </Link>
                    |{" "}
                    <Link
                      className="hover:underline"
                      to={`/report/${partner.slug}?range=${format(
                        startOfWeek(startOfMonth(addMonths(new Date(), 1))),
                        "yyyy-MM-dd",
                      )}---${format(endOfWeek(endOfMonth(addMonths(new Date(), 1))), "yyyy-MM-dd")}`}
                      reloadDocument
                    >
                      {format(addMonths(new Date(), 1), "MMMM", {
                        locale: ptBR,
                      })}
                    </Link>
                  </div>
                </>
              ) : null}
            </div>
            <div>🤝 Agência CNVT®</div>
          </div>
        </div>
        <div className="flex justify-between gap-2 px-8 text-center">
          <button
            className={`flex items-center justify-center border-b-2 border-gray-950 px-3 py-2 text-gray-950 ${
              view !== "instagram" && "border-b-transparent opacity-25"
            }`}
            onClick={() => setView("instagram")}
          >
            <Grid3X3Icon className="size-6 sm:size-4" />
            <span className="ml-2 hidden sm:inline-block">Home</span>
          </button>
          <button
            className={`flex items-center justify-center border-b-2 border-gray-950 px-3 py-2 text-gray-950 ${
              view !== "feed" && "border-b-transparent opacity-25"
            }`}
            onClick={() => setView("feed")}
          >
            <GalleryVerticalIcon className="size-6 sm:size-4" />
            <span className="ml-2 hidden sm:inline-block">Feed</span>
          </button>
          <button
            className={`flex items-center justify-center border-b-2 border-gray-950 px-3 py-2 text-gray-950 ${
              view !== "list" && "border-b-transparent opacity-25"
            }`}
            onClick={() => setView("list")}
          >
            <Rows3Icon className="size-6 sm:size-4" />
            <span className="ml-2 hidden sm:inline-block">Lista</span>
          </button>
          <button
            className={`flex items-center justify-center border-b-2 border-gray-950 px-3 py-2 text-gray-950 ${
              view !== "calendar" && "border-b-transparent opacity-25"
            }`}
            onClick={() => setView("calendar")}
          >
            <CalendarDaysIcon className="size-6 sm:size-4" />
            <span className="ml-2 hidden sm:inline-block">Calendário</span>
          </button>
        </div>
      </div>

      {View}
      <div className="flex items-center justify-center gap-2 p-4 text-center text-xs">
        <span className="font-semibold">Agência CNVT®</span>

        <span className="tabular-nums">19.285.887/0001-30</span>
      </div>
    </div>
  );
}

const ActionReport = ({
  action,
  partner,
}: {
  action: Action;
  partner: Partner;
}) => {
  return (
    <div className="mx-auto rounded bg-white p-4 text-gray-950 lg:max-w-lg">
      <div className="mb-4 flex items-center gap-2">
        <Avatar
          item={{
            short: partner?.short!,
            bg: partner?.colors[0],
            fg: partner?.colors[1],
          }}
          size="md"
        />
        <div className="font-semibold">{partner?.slug}</div>
        <div className="text-sm opacity-50">
          {format(
            action.date,
            "d 'de' MMMM".concat(
              !isSameYear(action.date, new Date()) ? " 'de' yyyy" : "",
            ),
            { locale: ptBR },
          )}
        </div>
      </div>
      <div className="relative overflow-hidden rounded-sm">
        <Content
          action={action}
          aspect={action.category === "reels" ? "full" : "feed"}
          partner={partner}
          className="z-0"
        />
      </div>
      {/* <LikeFooter /> */}
      <div>
        {action.instagram_caption?.split("\n").map((line, index) => (
          <React.Fragment key={index}>
            {line}
            {index <
              (action.instagram_caption?.split("\n").length || 1) - 1 && <br />}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

const FeedReportView = ({
  actions,
  partner,
}: {
  actions: Action[];
  partner: Partner;
}) => {
  const feedActions = actions?.filter(
    (action) => isInstagramFeed(action.category) !== undefined,
  );

  return (
    <div className="mx-auto px-4 lg:max-w-lg">
      <div className="divide-y rounded bg-white px-4 text-gray-950">
        {feedActions?.map((action) => (
          <div key={action.id} className="py-4">
            <ActionReport action={action} partner={partner} />
          </div>
        ))}
      </div>
    </div>
  );
};

const ListActionReport = ({ actions }: { actions: Action[] }) => {
  return (
    <div className="mx-auto px-4 lg:max-w-3xl">
      <div className="flex flex-col gap-2 text-left">
        {actions?.map((action) => (
          <ActionlistReport action={action} key={action.id} />
        ))}
      </div>
    </div>
  );
};

const ActionlistReport = ({ action }: { action: Action }) => {
  const { categories, states, partner } = useLoaderData<loaderData>();

  invariant(partner, "partner");

  const state = states!.find((state) => state.slug === action.state);
  const category = categories!.find(
    (category) => category.slug === action.category,
  );

  return (
    <div key={action.id} className="rounded-sm bg-white p-4 md:p-8">
      <div className="mb-4 flex items-center justify-between gap-2 border-b border-black/10 pb-4 text-sm leading-none">
        <div className="first-letter:capitalize">
          {format(action.date, "E, d 'de' MMMM 'de' yyyy", {
            locale: ptBR,
          })}
        </div>
        <div className="flex items-center text-xs font-bold tracking-wider text-white uppercase">
          <div
            className={`rounded-l py-1 pr-2 pl-3`}
            style={{ backgroundColor: category?.color }}
          >
            {category?.title}
          </div>
          <div>
            <div
              className={`rounded-r py-1 pr-3 pl-2 text-xs font-bold uppercase`}
              style={{ backgroundColor: state?.color }}
            >
              {state?.title}
            </div>
          </div>
        </div>
      </div>
      <div className="grid items-start gap-4 md:grid-cols-2">
        <div className="w-full overflow-hidden rounded">
          <Content action={action as Action} aspect="full" partner={partner} />
        </div>
        <div className="w-full">
          <div className="mb-4 text-2xl leading-none font-bold tracking-tighter text-gray-950">
            {action.title}
          </div>

          {action.instagram_caption && (
            <>
              <h5 className="mt-4 text-sm font-bold tracking-normal text-gray-950 uppercase">
                Legenda
              </h5>

              <div className="mt-4">
                {action.instagram_caption?.split("\n").map((line, index) => (
                  <React.Fragment key={index}>
                    {line}
                    {index <
                      (action.instagram_caption?.split("\n").length || 1) -
                        1 && <br />}
                  </React.Fragment>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const CalendarReportView = ({
  actions,
  range,
  partner,
}: {
  actions: Action[];
  range: string[];
  partner: Partner;
}) => {
  const days = eachDayOfInterval({
    start: startOfWeek(range[0]),
    end: endOfWeek(range[1]),
  });

  const calendar = days.map((day) => {
    return {
      date: day,
      actions: actions?.filter((action) =>
        isSameDay(parseISO(action.instagram_date), day),
      ),
    };
  });

  return (
    <div className="overflow-x-auto overflow-y-hidden px-4">
      <div className="min-w-[1000px]">
        <div className="grid grid-cols-7 rounded bg-white text-xs font-bold uppercase">
          {eachDayOfInterval({
            start: startOfWeek(new Date()),
            end: endOfWeek(new Date()),
          }).map((day) => (
            <div key={day.getDate()} className="p-4">
              {format(day, "EEEEEE", { locale: ptBR })}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 text-left">
          {calendar.map((day, i) => (
            <div key={i} className="px-1 py-2">
              <div
                className={`mb-4 grid h-8 w-8 place-content-center rounded-full text-xl tracking-tighter ${
                  isToday(day.date)
                    ? "font-bold text-gray-950"
                    : "font-light text-gray-500"
                }`}
              >
                {day.date.getDate()}
              </div>

              <div>
                {day.actions?.map((action) => (
                  <div
                    key={action.id}
                    className="mb-1 flex flex-col overflow-hidden rounded bg-white"
                  >
                    <Content
                      action={action as Action}
                      aspect="feed"
                      partner={partner}
                      showFinished
                      showInfo
                      dateDisplay={{ timeFormat: TIME_FORMAT.WITH_TIME }}
                    />

                    {action.instagram_caption && (
                      <div className="p-3">
                        <div className="line-clamp-3 overflow-hidden text-xs">
                          {action.instagram_caption}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const InstagramReportView = ({
  actions,
  partner,
}: {
  actions: Action[];
  partner: Partner;
}) => {
  const [instagramActions, setInstagramActions] = useState<Action[]>(actions);
  useEffect(() => {
    setInstagramActions(getInstagramFeed({ actions: actions?.reverse() }));
  }, []);

  return (
    <div className="mx-auto px-4 lg:max-w-xl">
      <div className="grid grid-cols-3 gap-[1px] overflow-hidden rounded">
        {instagramActions?.map((action, i) => (
          <div key={i} className="relative">
            <Content
              action={action as Action}
              aspect="feed"
              partner={partner}
              showInfo
              showFinished
              dateDisplay={{
                dateFormat: DATE_FORMAT.FULL,
                timeFormat: TIME_FORMAT.WITH_TIME,
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

//recommit
