import clsx from "clsx";
import { Link, useFetchers, useMatches, useSearchParams } from "react-router";
// @ts-ignore
import Color from "color";
import {
  compareAsc,
  endOfDay,
  endOfWeek,
  format,
  isAfter,
  isBefore,
  isSameDay,
  isSameMonth,
  isThisWeek,
  isToday,
  isTomorrow,
  parseISO,
  startOfDay,
  startOfWeek,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  BadgeCheckIcon,
  BookmarkIcon,
  CameraIcon,
  CheckIcon,
  CircleFadingPlusIcon,
  ClapperboardIcon,
  ClipboardCheckIcon,
  Code2Icon,
  ComponentIcon,
  DollarSignIcon,
  GalleryHorizontal,
  HeartIcon,
  ImageIcon,
  ListChecksIcon,
  MegaphoneIcon,
  MessageCircleIcon,
  PenToolIcon,
  PrinterIcon,
  RouteIcon,
  SendIcon,
  SignalIcon,
  SignalLowIcon,
  SignalMediumIcon,
  UsersIcon,
  type LucideIcon,
} from "lucide-react";
import React, { useEffect, useMemo, useState, type CSSProperties } from "react";
import { type DateRange } from "react-day-picker";
import invariant from "tiny-invariant";
import { formatActionDatetime } from "~/components/Action";
import {
  AvatarFallback,
  AvatarImage,
  Avatar as AvatarShad,
} from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import { Calendar } from "~/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { BASE_COLOR, INTENTS, PRIORITIES } from "./constants";
import { cn } from "./utils";
import { Label } from "~/components/ui/label";
import { Input } from "~/components/ui/input";

export function ShortText({
  text,
  className,
  isLowerCase,
}: {
  text: string;
  className?: string;
  isLowerCase?: boolean;
}) {
  const length = text.length;
  return (
    <div
      className={cn(
        `text-center text-[10px] font-bold tracking-wide ${isLowerCase ? "leading-2 lowercase" : "leading-none uppercase"}`,
        className,
      )}
    >
      {length >= 4 ? (
        <>
          <div> {text.substring(0, Math.ceil(length / 2))} </div>
          <div> {text.substring(Math.ceil(length / 2))} </div>
        </>
      ) : (
        <div>{text}</div>
      )}
    </div>
  );
}

export function AvatarGroup({
  avatars,
  people,
  partners,
  size = "sm",
  className,
  ringColor,
  isLowerCase,
}: {
  avatars?: {
    item: {
      image?: string | null;
      bg?: string;
      fg?: string;
      short: string;
      title: string;
    };

    style?: CSSProperties;
    className?: string;
  }[];
  people?: Person[];
  partners?: Partner[];
  size?: Size;
  className?: string;
  ringColor?: string;
  isLowerCase?: boolean;
}) {
  if (people) {
    avatars = people.map((person) => ({
      item: {
        short: person.initials,
        image: person.image,
        title: person.name,
      },
    }));
  } else if (partners) {
    avatars = partners.map((partner) => ({
      item: {
        short: partner.short,
        bg: partner.colors[0],
        fg: partner.colors[1],
        title: partner.title,
      },
    }));
  }

  invariant(avatars, "Nenhum Avatar foi definido");

  const spaceX = {
    xs: "-space-x-0.5",
    sm: "-space-x-0.5",
    md: "-space-x-1",
    lg: "-space-x-1",
    xl: "-space-x-2",
  };

  return (
    <div
      className={cn(`flex ${spaceX[size]}`, className)}
      title={avatars.map((avatar) => avatar.item.title).join(" • ")}
    >
      {avatars.map(({ item, className, style }, i) => (
        <Avatar
          isLowerCase={isLowerCase}
          key={i}
          item={item}
          className={`${className} ${ringColor}`}
          ring={true}
          size={size}
          style={style}
        />
      ))}
    </div>
  );
}

export function Avatar({
  item,
  size = "sm",
  style,
  className,
  ring,
  isLowerCase,
}: {
  item: {
    image?: string | null;
    bg?: string;
    fg?: string;
    short: string;
    title?: string;
  };
  size?: Size;
  style?: CSSProperties;
  className?: string;
  ring?: boolean;
  isLowerCase?: boolean;
}) {
  const textSizes = isLowerCase
    ? {
        xs: "",
        sm: "scale-[0.8]",
        md: "scale-[1.3]",
        lg: "scale-[1.6]",
        xl: "scale-[2]",
      }
    : {
        xs: "",
        sm: "scale-[0.6]",
        md: "scale-[0.85]",
        lg: "scale-[1.3]",
        xl: "scale-[1.6]",
      };

  return (
    <AvatarShad
      title={item.title}
      tabIndex={-1}
      className={cn([
        size === "xs"
          ? "size-4"
          : size === "sm"
            ? "size-6"
            : size === "md"
              ? "size-8"
              : size === "lg"
                ? "size-12"
                : "size-16",
        ring ? "ring-2 ring-white" : "",

        "block border",

        className,
      ])}
      style={style}
    >
      {item.image ? (
        <AvatarImage src={item.image} />
      ) : (
        <AvatarFallback
          className="bg-secondary text-secondary-foreground"
          style={{
            backgroundColor: item.bg,
            color: item.fg,
          }}
        >
          <ShortText
            isLowerCase={isLowerCase}
            text={size === "xs" ? item.short[0] : item.short}
            className={textSizes[size]}
          />
        </AvatarFallback>
      )}
    </AvatarShad>
  );
}

export function sortActions(
  actions?: Action[] | null,
  order: "asc" | "desc" = "asc",
) {
  return actions
    ? actions
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .sort((a, b) =>
          order === "desc"
            ? Number(b.state) - Number(a.state)
            : Number(a.state) - Number(b.state),
        )
    : null;
}

export function getDelayedActions({
  actions,
  priority,
}: {
  actions?: Action[] | ActionChart[] | null;
  priority?: PRIORITIES;
}) {
  priority = priority
    ? ({
        low: PRIORITIES.low,
        mid: PRIORITIES.medium,
        high: PRIORITIES.high,
      }[priority] as PRIORITIES)
    : undefined;

  actions = actions
    ? actions.filter(
        (action) =>
          isBefore(parseISO(action.date), new Date()) &&
          action.state !== "finished" &&
          (priority && "priority" in action
            ? action.priority === priority
            : true),
      )
    : [];

  return actions;
}

export function getNotFinishedActions({
  actions,
}: {
  actions?: Action[] | null;
}) {
  return actions
    ? actions.filter(
        (action) =>
          isAfter(parseISO(action.date), new Date()) &&
          action.state !== "finished",
      )
    : [];
}

export function getUrgentActions(actions: Action[] | null) {
  return actions
    ? actions.filter(
        (action) =>
          action.priority === PRIORITIES.high && action.state !== "finished",
      )
    : [];
}

export function getActionsByPriority(actions: Action[], descending?: boolean) {
  let _sorted: Action[][] = [];

  Object.entries(PRIORITIES).map(([, value]) => {
    _sorted.push(actions.filter((action) => action.priority === value));
  });

  return descending ? _sorted.reverse().flat() : _sorted.flat();
}

export function getActionsByState(
  actions: Action[],
  states: State[],
  descending?: boolean,
) {
  let _sorted: Action[][] = [];
  Object.entries(states).map(([, value]) => {
    _sorted.push(actions.filter((action) => action.state === value.slug));
  });

  return descending ? _sorted.reverse().flat() : _sorted.flat();
}

export function getActionsByTime(actions: Action[], descending?: boolean) {
  let _sorted = actions.sort((a, b) => (isBefore(a.date, b.date) ? -1 : 1));

  return descending ? _sorted.reverse() : _sorted;
}

export function getActionsForThisDay({
  actions,
  date,
  isInstagramDate,
}: {
  actions?: Action[] | null;
  date?: Date | null;
  isInstagramDate?: boolean;
}) {
  const currentDate = date || new Date();

  return actions
    ? actions.filter((action) =>
        isSameDay(
          parseISO(isInstagramDate ? action.instagram_date : action.date),
          currentDate,
        ),
      )
    : [];
}

export function getInstagramFeed({
  actions,
  stories,
}: {
  actions?: Action[] | RawAction[] | null;
  stories?: boolean;
}): Action[] {
  return actions
    ? (actions
        .filter((action) => isInstagramFeed(action.category, stories))
        .sort((a, b) =>
          compareAsc(b.instagram_date, a.instagram_date),
        ) as Action[])
    : // .sort((a, b) =>
      // 	differenceInMilliseconds(b.instagram_date, a.instagram_date)
      // ) as Action[])
      [];
}

const iconsList: { [key: string]: LucideIcon } = {
  all: ComponentIcon,
  //Category
  capture: CameraIcon,
  todo: ListChecksIcon,
  post: ImageIcon,
  carousel: GalleryHorizontal,
  reels: ClapperboardIcon,
  stories: CircleFadingPlusIcon,
  sm: BadgeCheckIcon,
  meeting: UsersIcon,
  ads: MegaphoneIcon,
  plan: RouteIcon,
  finance: DollarSignIcon,
  design: PenToolIcon,
  print: PrinterIcon,
  dev: Code2Icon,
  //Priority
  low: SignalLowIcon,
  mid: SignalMediumIcon,
  high: SignalIcon,
  base: SignalIcon,
};

export const Icons = ({
  id,
  className,
  type = "category",
}: {
  id?: string;
  className?: string;
  type?: "category" | "priority";
}) => {
  const View = iconsList[id as string] ?? ComponentIcon;

  return type === "category" ? (
    <View className={cn(className)} />
  ) : (
    <div className="relative">
      <SignalIcon
        className={cn(["absolute top-0 left-0 z-0 opacity-30", className])}
      />
      <View
        className={cn([
          "isolate",
          id === "low"
            ? "text-lime-500"
            : id === "mid"
              ? "text-amber-500"
              : "text-rose-600",
          className,
        ])}
      />
    </div>
  );
};

export function useIDsToRemove(): {
  actions: string[];
  sprints: { action_id: string; user_id: string }[];
} {
  return {
    actions: useFetchers()
      .filter((fetcher) => {
        if (!fetcher.formData) {
          return false;
        }
        return fetcher.formData.get("intent") === INTENTS.deleteAction;
      })
      .map((fetcher) => {
        return String(fetcher.formData?.get("id"));
      }),
    sprints: useFetchers()
      .filter((fetcher) => {
        if (!fetcher.formData) {
          return false;
        }
        return fetcher.formData.get("intent") === INTENTS.unsetSprint;
      })
      .map((fetcher) => {
        return {
          action_id: String(fetcher.formData?.get("action_id")),
          user_id: String(fetcher.formData?.get("user_id")),
        };
      }),
  };
}
export function usePendingData(): { actions: Action[]; sprints: Sprint[] } {
  return {
    actions: useFetchers()
      .filter((fetcher) => {
        if (!fetcher.formData) {
          return false;
        }
        return (
          fetcher.formData.get("intent") === INTENTS.createAction ||
          fetcher.formData.get("intent") === INTENTS.updateAction
        );
      })
      .map((fetcher) => {
        const action: Action = {
          id: String(fetcher.formData?.get("id")),
          title: String(fetcher.formData?.get("title")),
          description: String(fetcher.formData?.get("description")),
          user_id: String(fetcher.formData?.get("user_id")),
          date: String(fetcher.formData?.get("date")),
          instagram_date: String(fetcher.formData?.get("instagram_date")),
          responsibles: String(fetcher.formData?.getAll("responsibles")).split(
            ",",
          ),
          time: Number(fetcher.formData?.get("time")),
          created_at: String(fetcher.formData?.get("created_at")),
          updated_at: String(fetcher.formData?.get("updated_at")),
          category: String(fetcher.formData?.get("category")),
          state: String(fetcher.formData?.get("state")),
          priority: String(fetcher.formData?.get("priority")),
          caption: String(fetcher.formData?.get("caption")),
          color: String(fetcher.formData?.get("color")),
          files: String(fetcher.formData?.get("files")).split(","),
          archived: Boolean(fetcher.formData?.get("archived")),
          partners: String(fetcher.formData?.get("partners")).split(","),
          topics: String(fetcher.formData?.get("topics"))
            .split(",")
            .map(Number),
        };

        return { ...action };
      }) as Action[],
    sprints: useFetchers()
      .filter((fetcher) => {
        if (!fetcher.formData) {
          return false;
        }
        return fetcher.formData.get("intent") === INTENTS.setSprint;
      })
      .map((fetcher) => {
        const sprint: Sprint = {
          id: String(fetcher.formData?.get("id")),
          action_id: String(fetcher.formData?.get("action_id")),

          user_id: String(fetcher.formData?.get("user_id")),

          created_at: String(fetcher.formData?.get("created_at")),
        };

        return { ...sprint };
      }) as Sprint[],
  };
}

export function getResponsibles(people: Person[], users_ids?: string[] | null) {
  return people
    .filter((person) =>
      users_ids?.find((user) => person.user_id === user),
    )
    .sort((a, b) => {
      const nameCompare = a.name.localeCompare(b.name, 'pt-BR');
      if (nameCompare !== 0) return nameCompare;
      // Secondary sort by user_id for stability
      return a.user_id.localeCompare(b.user_id, 'pt-BR');
    });
}
export function getPartners(partners_slug: string[], partners: Partner[]) {
  if (partners_slug.length) {
    return partners
      .filter((partner) =>
        partners_slug?.find((p) => partner.slug === p),
      )
      .sort((a, b) => {
        const titleCompare = a.title.localeCompare(b.title, 'pt-BR');
        if (titleCompare !== 0) return titleCompare;
        // Secondary sort by slug for stability
        return a.slug.localeCompare(b.slug, 'pt-BR');
      });
  }
  return partners.sort((a, b) => {
    const titleCompare = a.title.localeCompare(b.title, 'pt-BR');
    if (titleCompare !== 0) return titleCompare;
    // Secondary sort by slug for stability
    return a.slug.localeCompare(b.slug, 'pt-BR');
  });
}

export function amIResponsible(responsibles: string[], user_id: string) {
  return responsibles.findIndex((id) => id === user_id) >= 0;
}

export function getActionNewDate(date: Date) {
  return format(
    (() => {
      if (new Date().getHours() > 11) {
        date.setHours(new Date().getHours() + 1, new Date().getMinutes());
      } else {
        date.setHours(11, 0);
      }
      return date;
    })(),
    "yyyy-MM-dd HH:mm:ss",
  );
}

export function Bussola({
  size = "sm",
  short,
  className,
}: {
  size?: Size;
  short?: boolean;
  className?: string;
}) {
  return (
    <div className={cn(``, className)}>
      {short ? (
        <svg
          viewBox="0 0 307 316"
          style={{
            fillRule: "evenodd",
            clipRule: "evenodd",
            strokeLinejoin: "round",
            strokeMiterlimit: 2,
          }}
          fill="currentColor"
          className={getBussolaSize(size)}
          xmlSpace="preserve"
        >
          <g transform="translate(-7439 -16159)">
            <g transform="translate(2821 411)">
              <path d="m4924.5 15748v287.2h-81.84v-39.8h-5.53c-21.01 32-58.11 48.1-92.4 48.1-77.65 0-126.73-49.8-126.73-117.8v-177.7h81.85v166.1c0 34.8 26.68 59.1 73.09 59.1 32.62 0 69.72-26 69.72-61.9v-66.3l38.41-17.5v-16h-141.22v-63.5h184.65z" />
            </g>
          </g>
        </svg>
      ) : (
        <svg
          style={{
            fillRule: "evenodd",
            clipRule: "evenodd",
            strokeLinejoin: "round",
            strokeMiterlimit: 2,
          }}
          fill="currentColor"
          className={getBussolaSize(size)}
          viewBox="0 0 2124 302"
          xmlSpace="preserve"
        >
          <g transform="translate(-7144.8 -16781)">
            <g transform="translate(2426.6 4785)">
              <path d="m4873 12289h-154.82v-287.2h147.2c67.78 0 107.89 31.3 107.89 79.5 0 29.6-18.45 51.3-41.72 59.3v4c28.48 7.6 49.74 32.9 49.74 67 0 49.3-41.31 77.4-108.29 77.4zm-70.19-119.9v58.9h51.74c22.46 0 39.3-12.4 39.3-29.6 0-16.9-16.84-29.3-39.3-29.3h-51.74zm0-106.3v54.1h46.12c21.66 0 36.9-11.2 36.9-27.2 0-16.1-15.24-26.9-36.9-26.9h-46.12zm691.17 232.2c-78.61 0-130.75-41.3-130.75-100.6h79.41c0.4 24 20.05 39.7 54.54 39.7 27.28 0 44.92-10.1 44.92-27.7 0-20.9-23.66-25.7-52.94-29.7-49.33-6.8-123.93-12.8-123.93-86.6 0-57 48.93-93.9 124.74-93.9 76.2 0 127.14 40.9 127.14 100.3h-76.61c0-25.3-18.85-39.7-47.73-39.7-26.87 0-42.91 11.2-42.91 27.3 0 21.6 28.48 25.2 61.76 30 48.93 7.3 115.11 17.7 115.11 87.1 0 56.9-52.54 93.8-132.75 93.8zm289.17 0c-78.61 0-130.75-41.3-130.75-100.6h79.41c0.4 24 20.06 39.7 54.55 39.7 27.27 0 44.92-10.1 44.92-27.7 0-20.9-23.66-25.7-52.94-29.7-49.33-6.8-123.93-12.8-123.93-86.6 0-57 48.93-93.9 124.73-93.9 76.2 0 127.14 40.9 127.14 100.3h-76.61c0-25.3-18.85-39.7-47.72-39.7-26.87 0-42.92 11.2-42.92 27.3 0 21.6 28.48 25.2 61.77 30 48.93 7.3 115.11 17.7 115.11 87.1 0 56.9-52.54 93.8-132.76 93.8zm320.89 2.9c-94.56 0-157.05-59.2-157.05-150.5 0-91.2 62.49-150.4 157.05-150.4 94.01 0 157.05 59.2 157.05 150.4 0 91.8-63.04 150.5-157.05 150.5zm0-69.7c43.69 0 74.66-33.8 74.66-80.8s-30.97-80.1-74.66-80.1c-44.24 0-75.21 33.1-75.21 80.1s30.97 80.8 75.21 80.8zm280.78-43.9-23.66 17.7v16h155.62v71h-210.16v-280.7h78.2v176zm457.23-177.2v279.5h-59.36l-6.42-24.9c-24.06 21.3-55.35 33.3-90.64 33.3-84.23 0-146.79-63.3-146.79-148 0-84.6 62.56-147.6 146.79-147.6 35.69 0 67.38 12.9 91.84 34.5l8.03-26.8h56.55zm-150.41 216.5c43.72 0 76.21-32.9 76.21-76.6 0-44.1-32.49-76.6-76.21-76.6-44.11 0-76.2 32.5-76.2 76.6 0 43.7 32.09 76.6 76.2 76.6zm-1372.8-221.8v287.2h-81.84v-39.8h-5.53c-21.02 32.1-58.11 48.1-92.4 48.1-77.65 0-126.73-49.8-126.73-117.8v-177.7h81.84v166.1c0 34.8 26.69 59.2 73.09 59.2 32.63 0 69.73-26 69.73-62v-66.2l38.41-17.6v-15.9h-141.23v-63.6h184.66z" />
            </g>
          </g>
        </svg>
      )}
    </div>
  );
}

export function Bia({
  size = "sm",
  className,
}: {
  size?: Size;
  className?: string;
}) {
  return (
    <div className={cn(``, className)}>
      <svg
        style={{
          fillRule: "evenodd",
          clipRule: "evenodd",
          strokeLinejoin: "round",
          strokeMiterlimit: 2,
        }}
        fill="currentColor"
        className={getBussolaSize(size)}
        xmlSpace="preserve"
        viewBox="0 0 937 524"
      >
        <path d="M243.87 200.19c36.5 19.9 56.961 53.64 56.961 96.77 0 81.29-66.911 124.43-147.651 124.43-20.46 0-38.71-2.77-54.19-8.3v110.05H0V151.52C0 57.51 55.3 0 147.65 0 226.18 0 285.9 45.35 285.9 117.24c0 33.73-14.38 62.48-42.03 82.95Zm-96.22 137.14c34.29 0 57.51-16.59 57.51-47 0-29.31-21.01-45.35-55.85-45.35h-24.33v-80.19h22.67c28.76 0 48.66-17.69 48.66-43.68 0-25.44-22.12-42.03-47-42.03-33.73 0-50.32 24.88-50.32 65.81v183.59c15.48 5.53 33.18 8.85 48.66 8.85Zm206.269 77.97V162.58l32.627-24.33v-22.12h-32.627V29.31h107.835V415.3H353.919ZM936.781 26.54v385.45h-81.844l-8.848-34.29c-33.18 29.31-76.314 45.9-124.978 45.9-116.13 0-202.398-87.38-202.398-204.06s86.268-203.5 202.398-203.5c49.217 0 92.904 17.69 126.637 47.56l11.06-37.06h77.973ZM729.406 325.16c60.277 0 105.07-45.34 105.07-105.62 0-60.83-44.793-105.62-105.07-105.62-60.83 0-105.07 44.79-105.07 105.62 0 60.28 44.24 105.62 105.07 105.62Z" />
      </svg>
    </div>
  );
}

export const Content = ({
  action,
  aspect,
  partner,
  className,
  showInfo,
  showFinished,
  date,
}: {
  action:
    | Action
    | (Action & {
        previews: { preview: string; type: string }[] | null;
      });
  aspect: "feed" | "full";
  partner: Partner;
  className?: string;
  showInfo?: boolean;
  showFinished?: boolean;
  date?: dateTimeFormat;
}) => {
  let files =
    "previews" in action && action.previews
      ? action.previews
      : action.files && action.files[0]
        ? action.files.map((f) => ({
            preview: f,
            type: getTypeOfTheContent(f),
          }))
        : undefined;

  let isPreview = !(action.files !== null && action.files[0] !== "");
  let isFile = files && !["", "null", null].find((p) => p === files[0].preview);

  return (
    <div className="group/action relative">
      {files && !["", "null", null].find((p) => p === files[0].preview) ? (
        // Se for carrossel ou Stories
        files.length > 1 && aspect != "feed" ? (
          <div
            className={clsx(
              `flex snap-x snap-mandatory gap-[1px] overflow-hidden overflow-x-auto transition-opacity ${
                isPreview && "opacity-50"
              } `,
              className,
            )}
          >
            {files.map((file, i) => (
              <div className="w-full shrink-0 snap-center" key={i}>
                <img src={`${file.preview}`} />
              </div>
            ))}
          </div>
        ) : files[0].type === "image" ? (
          <img
            src={`${files[0].preview}`}
            className={cn(
              `object-cover transition-opacity ${isPreview && "opacity-50"}`,
              className,
            )}
            style={{ backgroundColor: action.color }}
          />
        ) : (
          <video
            src={files[0].preview}
            className={clsx(
              `w-full object-cover ${aspect === "feed" ? "aspect-4/5" : ""}`,
              className,
            )}
            controls
          />
        )
      ) : (
        <Post className={className} action={action} colors={partner!.colors} />
      )}
      {showFinished && action.state === "finished" && (
        <FinishedCheck className="absolute top-2 left-2" size="sm" />
      )}
      {showInfo && (
        <ContentLowerBar action={action} date={date} isOverlay={isFile} />
      )}
    </div>
  );
};

export const Post = ({
  action,
  colors,
  className,
}: {
  action: Action;
  colors: string[];
  className?: string;
}) => {
  // Use action.id for deterministic color selection
  const hash = action.id.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
  let factor = hash % colors.length;
  factor = factor === 1 ? factor - 1 : factor;

  const bgColor =
    action.color && action.color != "null" && action.color !== "undefined"
      ? action.color
      : colors[factor];

  return (
    <div
      className={clsx(
        `@container grid aspect-[3/4] place-content-center overflow-hidden inset-ring inset-ring-black/5 transition-opacity`,
        className,
      )}
      style={{
        backgroundColor: bgColor,
      }}
    >
      <div
        className={`overflow-hidden p-2 text-center text-[10px] leading-none font-medium tracking-tight text-ellipsis ${
          action.title.length > 50
            ? "@[120px]:text-[12px] @[200px]:text-[20px] @[300px]:text-[24px]"
            : "@[120px]:text-[18px] @[200px]:text-[24px] @[300px]:text-[32px]"
        } :tracking-tighter bg-gradient-to-br from-[--tw-gradient-from] to-[--tw-gradient-to] bg-clip-text text-transparent @[200px]:p-4 @[300px]:p-8`}
        style={
          {
            "--tw-gradient-from": getTextColor(bgColor),
            "--tw-gradient-to": getTextColor(bgColor, 0.5),
          } as CSSProperties
        }
      >
        {action.title}
      </div>
    </div>
  );
};

function ContentLowerBar({
  action,
  date,
  isOverlay,
}: {
  action: Action;
  date?: dateTimeFormat;
  isOverlay?: boolean;
}) {
  const matches = useMatches();
  const { partners } = matches[1].data as DashboardRootType;
  const action_partners = getPartners(action.partners, partners);

  // ${isOverlay ? "bg-gradient-to-b from-transparent to-black/75" : ""}

  return (
    <div
      className={`absolute bottom-0 left-0 flex w-full justify-between rounded-b-md p-2 pt-8 text-xs font-semibold drop-shadow-xs transition-opacity ${
        action.files?.length ? "drop-shadow-sm" : ""
      } `}
      style={
        action.files?.length
          ? ({
              color: "white",
              "--drop-shadow-xs": "0 1px 1px rgb(0 0 0 / 0.5)",
            } as React.CSSProperties)
          : {
              color: getTextColor(action.color),
            }
      }
    >
      <Icons id={action.category} className="size-4" />
      {/* {action.partners.length > 1 && (
      <HeartHandshakeIcon className="size-4" />
    )} */}
      {action.partners.length > 1 && (
        <AvatarGroup
          size="xs"
          avatars={action_partners.map((partner) => ({
            item: {
              short: partner.short,
              bg: partner.colors[0],
              fg: partner.colors[1],
              title: partner.title,
            },
          }))}
        />
      )}
      {date && (
        <div>
          {formatActionDatetime({
            date: action.instagram_date,
            dateFormat: date.dateFormat,
            timeFormat: date.timeFormat,
          })}
        </div>
      )}
    </div>
  );
}

export function isInstagramFeed(category: string, stories = false) {
  return ["post", "reels", "carousel", stories ? "stories" : null].includes(
    category,
  );
}

export const Heart = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 32 32"
    version="1.1"
    xmlns="http://www.w3.org/2000/svg"
    className={`fill-rose-500 ${cn(className)}`}
  >
    <path d="M0.256 12.16q0.544 2.080 2.080 3.616l13.664 14.144 13.664-14.144q1.536-1.536 2.080-3.616t0-4.128-2.080-3.584-3.584-2.080-4.16 0-3.584 2.080l-2.336 2.816-2.336-2.816q-1.536-1.536-3.584-2.080t-4.128 0-3.616 2.080-2.080 3.584 0 4.128z"></path>
  </svg>
);

export function getCategoriesSortedByContent(categories: Category[]) {
  const firsts = categories.filter((c) => isInstagramFeed(c.slug));
  const lasts = categories.filter((c) => !isInstagramFeed(c.slug));

  return [firsts, lasts];
}

export function getTypeOfTheContent(content: string) {
  return /(.mp4|.mov)$/.test(content.toLowerCase()) ? "video" : "image";
}

export const ReportReview = ({ partner }: { partner: Partner }) => {
  const [range, setRange] = useState<DateRange | undefined>({
    from: startOfDay(startOfWeek(new Date())),
    to: endOfDay(endOfWeek(new Date())),
  });

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant={"ghost"} size={"icon"} className="gap-2">
          <ClipboardCheckIcon className="size-6" />
          {/* <span className="hidden md:block lg:hidden 2xl:block">
            Gerar Relatório
          </span> */}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="bg-content">
        <Calendar
          mode="range"
          selected={range}
          locale={ptBR}
          onSelect={(range) => setRange(range)}
        />
        {range?.from && range.to ? (
          <div className="border-accent/50 border-t py-4">
            <div className="pb-4 text-center text-sm">
              {range.from && range.to
                ? `${format(range.from, "d/M/yy")} a ${format(
                    range.to,
                    "d/M/yy",
                  )}`
                : "Selecione um intervalo de datas"}
            </div>
            <div className="flex items-center justify-center">
              <div className="mr-4 text-sm">Relatório do</div>
              <Button variant={"ghost"} size={"sm"} asChild>
                <Link
                  to={`/report/${partner.slug}?range=${format(
                    range.from,
                    "yyyy-MM-dd",
                  )}---${format(range.to, "yyyy-MM-dd")}`}
                >
                  Período
                </Link>
              </Button>
              <Button variant={"ghost"} size={"sm"} asChild>
                <Link to={`/report/${partner.slug}`} target="_blank">
                  Mês
                </Link>
              </Button>
            </div>
          </div>
        ) : null}
      </PopoverContent>
    </Popover>
  );
};

export function isSprint(action_id: string, sprints: Sprint[]) {
  return sprints
    ? sprints.filter((s) => s.action_id === action_id).length > 0
    : false;
}

export function LikeFooter({
  size = "md",
  liked,
}: {
  size?: "sm" | "md";
  liked?: boolean;
}) {
  const sizes = {
    sm: {
      parentClassName: "gap-2",
      className: "size-4",
      textClassName: "text-xs",
    },
    md: {
      parentClassName: "gap-4",
      className: "size-6",
      textClassName: "text-sm",
    },
  };

  const engagement = useMemo(
    () => [
      150, // Math.ceil(Math.random() * 200) + 50,
      75,  // Math.ceil(Math.random() * 130) + 10,
      12,  // Math.ceil(Math.random() * 20) + 5,
    ],
    [],
  );

  return (
    <div className={`flex justify-between py-2`}>
      <div className={`flex ${sizes[size].parentClassName}`}>
        <div className="flex items-center gap-1">
          {liked ? (
            <>
              <Heart className={cn(sizes[size].className)} />
              <div className={`${sizes[size].textClassName}`}>
                {engagement[0]}
              </div>
              <MessageCircleIcon
                className={cn(sizes[size].className, "-scale-x-100")}
              />
              <div className={`${sizes[size].textClassName}`}>
                {engagement[1]}
              </div>
              <SendIcon className={cn(sizes[size].className)} />
              <div className={`${sizes[size].textClassName}`}>
                {engagement[2]}
              </div>
            </>
          ) : (
            <>
              <HeartIcon className={cn(sizes[size].className)} />
              <MessageCircleIcon
                className={cn(sizes[size].className, "-scale-x-100")}
              />
              <SendIcon className={cn(sizes[size].className)} />
            </>
          )}
        </div>
      </div>
      <div>
        <BookmarkIcon className={cn(sizes[size].className)} />
      </div>
    </div>
  );
}

export function getTextColor(bgColor: string, opacity = 0) {
  const color =
    bgColor !== BASE_COLOR
      ? Color(bgColor).contrast(Color("white")) > 2
        ? Color("white").fade(opacity)
        : Color(bgColor).darken(0.5).desaturate(0.5).fade(opacity)
      : Color("white").fade(opacity);

  return (opacity ? color : color).hex();
}

function getBussolaSize(size: string) {
  return {
    xs: "h-4 min-h-4",
    sm: "h-6 min-h-6",
    md: "h-8 min-h-8",
    lg: "h-12 min-h-12",
    xl: "h-16 min-h-16",
  }[size];
}

export function getTodayActions(actions: Action[]) {
  return actions?.filter((action) => isToday(action.date)) as Action[];
}
export function getTomorrowActions(actions: Action[]) {
  return actions?.filter((action) => isTomorrow(action.date)) as Action[];
}

export function getThisWeekActions(actions: Action[]) {
  return actions?.filter((action) => isThisWeek(action.date)) as Action[];
}

export function getMonthsActions(actions: Action[], date = new Date()) {
  return actions?.filter((action) =>
    isSameMonth(action.date, date),
  ) as Action[];
}

export function useDocumentSize() {
  const [size, setSize] = useState({ width: 0, height: 0 });
  useEffect(() => {
    if (window) {
      setSize({ width: window.innerWidth, height: window.innerHeight });
    }
  }, []);

  return size;
}

export function getQueryString(qs?: string) {
  if (typeof window !== "undefined") {
    const searchParams = new URLSearchParams(location.search).toString();
    qs = qs ? `${qs}` : "";

    return searchParams ? `?${searchParams}&${qs}` : `?${qs}`;
  } else {
    const [searchParams] = useSearchParams();
    qs = qs ? `${qs}` : "";
    return searchParams.toString()
      ? `?${searchParams.toString()}&${qs}`
      : `?${qs}`;
  }
}

export function getBiaMessage(message: string) {
  return `<hr>${message}<h5>βia às ${format(new Date(), "HH:mm:ss")}</h5>`;
}

export function getCategoriesQueryString(category?: string) {
  let categories = "";

  if (typeof window !== "undefined") {
    const searchParams = new URLSearchParams(location.search);
    categories = searchParams.get("categories") || "";
    categories =
      categories !== "" && category !== undefined
        ? `${categories}-${category}`
        : category || "";
  } else {
    const [searchParams] = useSearchParams();
    categories = searchParams.get("categories") || "";
    categories =
      categories !== "" && category !== undefined
        ? `${categories}-${category}`
        : category || "";
  }

  return categories;
}

export function FinishedCheck({
  className,
  size = "md",
}: {
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const matches = useMatches();
  const { states } = matches[1].data as DashboardRootType;
  const sizes = {
    sm: { wrapper: "size-3", icon: "size-2" },
    md: { wrapper: "size-4", icon: "size-3" },
    lg: { wrapper: "size-6", icon: "size-4" },
  };
  return (
    <div
      className={cn(
        "grid place-content-center rounded-full",
        sizes[size].wrapper,
        className,
      )}
      style={{
        backgroundColor: states.find((s) => s.slug === "finished")?.color,
      }}
    >
      <CheckIcon className={sizes[size].icon} />
    </div>
  );
}
