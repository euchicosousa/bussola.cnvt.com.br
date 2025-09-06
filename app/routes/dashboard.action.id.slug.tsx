import {
  addHours,
  addMinutes,
  format,
  formatDistanceToNow,
  isAfter,
  isSameMonth,
  parseISO,
  subHours,
} from "date-fns";
import {
  Link,
  type LoaderFunctionArgs,
  type MetaFunction,
  useFetcher,
  useFetchers,
  useLoaderData,
  useMatches,
  useNavigate,
  useNavigation,
  useSubmit,
} from "react-router";

import { ptBR } from "date-fns/locale";
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsUpDownIcon,
  DownloadIcon,
  ImageIcon,
  LightbulbIcon,
  Link2Icon,
  Loader2Icon,
  SaveIcon,
  SlidersIcon,
  SparklesIcon,
  TimerIcon,
  TimerOffIcon,
  Trash2Icon,
  TrashIcon,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useDropzone } from "react-dropzone-esm";
import invariant from "tiny-invariant";

import Tiptap from "~/components/features/content/Tiptap";

import { PopoverPortal, PopoverTrigger } from "@radix-ui/react-popover";
import {
  CategoryDropdown,
  DateTimeAndInstagramDate,
  PartnersDropdown,
  ResponsibleForAction,
  StateDropdown,
  TopicsAction,
} from "~/components/features/actions/CreateAction";
import { Button } from "~/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "~/components/ui/command";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Popover, PopoverContent } from "~/components/ui/popover";
import { ToastAction } from "~/components/ui/toast";
import { useToast } from "~/components/ui/use-toast";
import { AI_INTENTS, INTENTS, TIMES } from "~/lib/constants";
import { validateAndAdjustActionDates } from "~/shared/utils/validation/dateValidation";
import {
  parametersOptimized,
  suggestionsParameters,
} from "~/lib/constants/parametros";
import { createClient } from "~/lib/database/supabase";
import {
  Avatar,
  Bia,
  Content,
  getBiaMessage,
  getInstagramFeed,
  actionToRawAction,
  getPartners,
  getQueryString,
  getTypeOfTheContent,
  Icons,
  isInstagramFeed,
} from "~/lib/helpers";
import { cn } from "~/lib/ui/utils";
import { SintagmaHooks, storytellingModels } from "./handle-openai";

export const config = { runtime: "edge" };

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const { supabase } = createClient(request);
  const { id } = params;
  const { slug } = params;

  if (!id) throw new Error("$id não foi definido");

  const [{ data: action }, { data: partner }, { data: topics }] =
    await Promise.all([
      supabase
        .from("actions")
        .select("*")
        .is("archived", false)
        .match({ id })
        .single(),
      supabase.from("partners").select("*").match({ slug }).single(),
      supabase.from("topics").select("*").match({ partner_slug: slug }),
    ]);

  invariant(action);
  invariant(
    partner,
    `Parceiro não encontrado com esse parâmetro: ${slug}<br/> ${action.id}`,
  );
  invariant(topics);

  return { action, partner, topics };
};

// File upload now handled by /handle-actions endpoint

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return [
    {
      title: `${data?.action?.title} / ʙússoʟa`,
    },
  ];
};

export default function ActionPage() {
  const {
    action: baseAction,
    partner,
    topics,
  } = useLoaderData<typeof loader>();

  const [action, setAction] = useState(baseAction);

  const matches = useMatches();

  const { people } = matches[1].data as DashboardRootType;

  const responsibles: Person[] = [];
  action.responsibles?.filter((user_id: string) =>
    responsibles.push(
      people.find((person) => person.user_id === user_id) as Person,
    ),
  );

  const navigation = useNavigation();
  const fetchers = useFetchers();

  const isWorking =
    navigation.state !== "idle" ||
    fetchers.filter((f) => f.formData).length > 0;

  const fetcher = useFetcher({ key: "action-page" });

  const intent = fetcher.formData?.get("intent")?.toString();

  // Atualizar a Inserir o conteúdo da IA
  useEffect(() => {
    if (fetcher.data && intent) {
      // Título
      if (intent === "title") {
        setAction(() => ({
          ...action,
          title: getCleanTitle(action.title)
            .concat(" | ")
            .concat((fetcher.data as { message: string }).message),
        }));
      } else if (
        ["carousel", "prompt", "hook", "reels", "ideas"].find(
          (category) => category === intent,
        )
      ) {
        const description = action.description || "";
        const index = action.description?.indexOf("<hr>") || -1;
        setAction(() => ({
          ...action,
          description:
            index < 0
              ? description.concat(
                  getBiaMessage((fetcher.data as { message: string }).message),
                )
              : description
                  .substring(0, action.description?.indexOf("<hr>"))
                  .concat(
                    getBiaMessage(
                      (fetcher.data as { message: string }).message,
                    ),
                  )
                  .concat(description.substring(index)),
        }));
      } else if (
        fetcher.formData &&
        ["instagram_caption", "stories", "shrink", "expand"].findIndex(
          (item) => item === intent,
        ) >= 0
      ) {
        setAction({
          ...action,
          instagram_caption: (fetcher.data as { message: string }).message,
        });
      }
    }
  }, [fetcher.data]);

  return (
    <div
      className={cn(
        "container mx-auto flex h-full flex-col overflow-hidden px-0 pt-4",
        isInstagramFeed(action.category, true) ? "max-w-7xl" : "max-w-5xl",
      )}
    >
      <div className="h-full gap-4 overflow-y-auto px-4 md:px-8 lg:flex lg:overflow-hidden">
        <div
          className={cn(
            `flex h-full w-full flex-col lg:overflow-hidden`,
            isInstagramFeed(action.category, true) ? "lg:w-3/4" : "",
          )}
        >
          {/* Header */}
          <Header action={action} partner={partner} />

          {/* Título */}
          <Title action={action} setAction={setAction} partner={partner} />
          {/* Descrição */}
          <Description
            action={action}
            setAction={setAction}
            isWorking={isWorking}
            partner={partner}
          />

          {/* Arquivos e Legenda */}
        </div>
        <RightSide
          action={action}
          setAction={setAction}
          isWorking={isWorking}
          partner={partner}
        />
      </div>
      {/* Lower bar */}
      <LowerBar
        action={action}
        setAction={setAction}
        isWorking={isWorking}
        partner={partner}
        topics={topics}
      />
    </div>
  );
}

//
//
//
//
//
//
//
//
//

export function Header({
  action,
  partner,
}: {
  action: Action;
  partner: Partner;
}) {
  return (
    <div className="flex w-full shrink grow-0 items-center justify-between text-sm">
      <div className="flex items-center gap-2">
        <Avatar
          item={{
            short: partner.short,
            bg: partner.colors[0],
            fg: partner.colors[1],
          }}
          size="md"
        />
        <div>
          <Link
            to={`/dashboard/${partner.slug}${getQueryString(
              !isSameMonth(action.date, new Date())
                ? `date=${format(action.date, "yyyy-MM-dd")}`
                : "",
            )}`}
            className="cursor-pointer font-bold tracking-tight"
          >
            {partner.title}
          </Link>
        </div>
      </div>
      <div className="text-xs opacity-75">
        {format(
          parseISO(action?.updated_at as string),
          "yyyy-MM-dd HH:mm:ss",
        ) ===
        format(parseISO(action?.created_at as string), "yyyy-MM-dd HH:mm:ss")
          ? "Criado "
          : "Atualizado "}
        {formatDistanceToNow(parseISO(action?.updated_at as string), {
          locale: ptBR,
          addSuffix: true,
        })}
      </div>
    </div>
  );
}

export function Title({
  action,
  setAction,
  partner,
  isSideBar = false,
}: {
  action: Action;
  setAction: React.Dispatch<React.SetStateAction<Action>>;
  partner: Partner;
  isSideBar?: boolean;
}) {
  const navigation = useNavigation();
  const fetchers = useFetchers();

  const fetcher = useFetcher({ key: "action-page" });
  const intent = fetcher.formData?.get("intent")?.toString();
  const isWorking =
    navigation.state !== "idle" ||
    fetchers.filter((f) => f.formData).length > 0;

  useEffect(() => {
    if (intent === "title") {
      setAction(() => ({
        ...action,
        title: getCleanTitle(action.title)
          .concat(" | ")
          .concat((fetcher.data as { message: string }).message),
      }));
    }
  }, [fetcher.data]);

  return (
    <div className="flex items-start gap-4 pt-2">
      <textarea
        value={action.title}
        className={`field-sizing-content w-full resize-none overflow-hidden border-none bg-transparent p-0 py-2 text-3xl leading-[85%] font-bold tracking-tighter outline-hidden ${
          isSideBar
            ? "text-2xl"
            : action.title.length > 30
              ? "md:text-5xl"
              : "md:text-6xl"
        }`}
        rows={1}
        onChange={(event) =>
          setAction({
            ...action,
            title: event.target.value,
          })
        }
      />

      <div className="pr-1">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              className={`h-7 w-7 p-1 ${
                isWorking &&
                fetcher.formData?.get("intent") === "carousel" &&
                "animate-colors"
              }`}
              variant="ghost"
            >
              <SparklesIcon />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-content">
            {SintagmaHooks.map((tense) => (
              <DropdownMenuSub key={tense.id}>
                <DropdownMenuSubTrigger className="bg-item">
                  {tense.title}
                </DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent className="bg-content flex max-h-[50vh] flex-col overflow-hidden">
                    <div className="border-b px-4 py-2 text-sm whitespace-break-spaces">
                      {tense.description}
                    </div>
                    <div className="scrollbars-v overflow-y-auto">
                      {tense.missions.map((mission) => (
                        <DropdownMenuGroup key={mission.id}>
                          <DropdownMenuLabel className="bg-label-small">
                            {mission.title}
                          </DropdownMenuLabel>
                          {mission.tactics.map((tactic) => (
                            <DropdownMenuItem
                              key={tactic.id}
                              className="bg-item"
                              onClick={async () => {
                                fetcher.submit(
                                  {
                                    title: action.title,
                                    description: action.description,
                                    context: `EMPRESA: ${partner.title} - DESCRIÇÃO: ${partner.context}`,
                                    intent: AI_INTENTS.generateTitle,
                                    tense: tense.id,
                                    tactic: tactic.id,
                                    mission: mission.id,
                                  },
                                  {
                                    action: "/handle-openai",
                                    method: "post",
                                  },
                                );
                              }}
                            >
                              {tactic.title}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuGroup>
                      ))}
                    </div>
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

export function Description({
  action,
  setAction,
  isWorking,
  partner,
}: {
  action: Action;
  setAction: (action: Action) => void;
  isWorking: boolean;
  partner: Partner;
}) {
  const fetcher = useFetcher({ key: "action-page" });
  const promptRef = useRef<HTMLTextAreaElement>(null);

  async function askBia(prompt?: string) {
    if (prompt) {
      fetcher.submit(
        {
          prompt,
          intent: AI_INTENTS.executePrompt,
        },

        {
          action: "/handle-openai",
          method: "post",
        },
      );
    }
  }

  return (
    <div className="flex h-full grow flex-col overflow-hidden lg:mb-0">
      <div className="mb-2 flex shrink-0 items-center justify-between gap-4 pt-1 pr-1">
        <div className="text-xs font-bold tracking-wider uppercase">
          Descrição
        </div>

        <div className="flex gap-2">
          {/* BIA */}
          <Popover>
            <PopoverTrigger className="button-trigger">
              <Bia size="xs" />
            </PopoverTrigger>
            <PopoverContent className="bg-content w-[90dvw] lg:max-w-[500px]">
              <fieldset
                disabled={fetcher.formData?.get("intent") === "prompt"}
                className="disabled:opacity-50"
              >
                <div className="mb-2 text-sm font-medium">Peça algo à βia</div>
                <div className="bg-input relative rounded-sm border p-2 pb-10">
                  <textarea
                    rows={2}
                    className="field-sizing-content max-h-[50vh] w-full resize-none outline-none"
                    ref={promptRef}
                    onKeyDown={async (e) => {
                      if (
                        e.key.toLocaleLowerCase() === "enter" &&
                        !e.shiftKey
                      ) {
                        e.preventDefault();
                        e.stopPropagation();
                        await askBia(promptRef.current?.value);
                      }
                    }}
                  ></textarea>

                  <Button
                    className={cn(
                      "absolute right-1 bottom-1 rounded-full",
                      fetcher.formData?.get("intent") === "prompt" &&
                        "animate-colors",
                    )}
                    size={"icon"}
                    variant={"ghost"}
                    onClick={async () => {
                      await askBia(promptRef.current?.value);
                    }}
                  >
                    <SparklesIcon />
                  </Button>
                </div>
              </fieldset>
            </PopoverContent>
          </Popover>

          {isInstagramFeed(action.category, true) && (
            <Button
              disabled={
                isWorking || !action.description?.replace(/(<([^>]+)>)/gi, "")
              }
              size={"sm"}
              className={` ${
                isWorking &&
                fetcher.formData?.get("intent") === "ideas" &&
                "animate-colors"
              }`}
              variant="ghost"
              onMouseDown={async () => {
                fetcher.submit(
                  {
                    description: action.description,
                    intent: AI_INTENTS.generateIdeas,
                  },
                  {
                    action: "/handle-openai",
                    method: "post",
                  },
                );
              }}
            >
              <LightbulbIcon />
            </Button>
          )}

          <PopoverParameters action={action} partner={partner} />
        </div>
      </div>

      <Tiptap
        content={action.description}
        onBlur={(text: string | null) => {
          setAction({
            ...action,
            description: text,
          });
        }}
      />
    </div>
  );
}

function RightSide({
  action,
  setAction,
  isWorking,
  partner,
}: {
  action: Action;
  setAction: (action: Action) => void;
  isWorking: boolean;
  partner: Partner;
}) {
  const [files, setFiles] = useState<{
    previews: { type: string; preview: string }[];
    files: string[];
  } | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [currentFileIndex, setCurrentFileIndex] = useState(0);

  const [length, setLength] = useState(120);

  const hasMultipleFiles =
    (action.files?.length || 0) > 1 || (files?.files?.length || 0) > 1;
  const totalFiles = (action.files?.length || 0) + (files?.files?.length || 0);

  const fetcher = useFetcher({ key: "action-page" });
  const { getInputProps, getRootProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      // Clear previous errors and start upload
      setUploadError(null);
      setIsUploading(true);

      // Client-side validation
      const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
      const allowedExtensions = [
        "jpg",
        "jpeg",
        "png",
        "gif",
        "webp",
        "pdf",
        "txt",
        "doc",
        "docx",
      ];

      for (const file of acceptedFiles) {
        const fileName = file.name || "unknown";

        if (file.size > MAX_FILE_SIZE) {
          setUploadError(
            `Arquivo ${fileName} é muito grande. Tamanho máximo: 10MB`,
          );
          setIsUploading(false);
          return;
        }

        const extension = fileName.toLowerCase().split(".").pop();
        if (!extension || !allowedExtensions.includes(extension)) {
          setUploadError(
            `Tipo de arquivo não permitido: ${fileName}. Tipos aceitos: ${allowedExtensions.join(", ")}`,
          );
          setIsUploading(false);
          return;
        }
      }

      const previews = acceptedFiles.map((f) => ({
        preview: URL.createObjectURL(f),
        type: getTypeOfTheContent(f.name || "unknown"),
      }));
      const filenames = acceptedFiles.map((f) => f.name || "unknown");

      setFiles({
        previews,
        files: filenames,
      });

      // Create FormData and submit
      const formData = new FormData();
      acceptedFiles.forEach((file) => formData.append("files", file));
      formData.append("intent", INTENTS.uploadFiles);
      formData.append("partner", partner.slug);
      formData.append("actionId", action.id);
      formData.append("filenames", filenames.join(","));
      formData.append(
        "title",
        action.title
          .toLocaleLowerCase()
          .replace(/\s/g, "-")
          .replace(/[^0-9a-z-]/g, ""),
      );

      // Use handle-actions endpoint
      fetch("/handle-actions", {
        method: "POST",
        body: formData,
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.success && data.data) {
            setAction(data.data);
            setFiles(null);
            setUploadError(null);
            setUploadSuccess(true);
            setCurrentFileIndex(0); // Reset carousel index

            // Hide success message after 2 seconds
            setTimeout(() => setUploadSuccess(false), 2000);
          } else if (data.error) {
            setUploadError(data.error);
          }
        })
        .catch((error) => {
          setUploadError(error.message);
        })
        .finally(() => {
          setIsUploading(false);
        });
    },
  });

  return isInstagramFeed(action.category, true) ? (
    <div className="relative mt-8 w-full lg:mt-0 lg:w-1/4 lg:overflow-hidden lg:overflow-y-auto">
      {/* Arquivo */}
      {action.category !== "stories" && (
        <>
          <div className="relative min-h-[50px] overflow-hidden rounded">
            <Content
              action={{
                ...action,
                previews: files ? files.previews : null,
              }}
              aspect="full"
              partner={partner}
              currentFileIndex={currentFileIndex}
            />

            <div {...getRootProps()} className="absolute top-0 h-full w-full">
              <input {...getInputProps()} multiple />

              {isUploading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center rounded bg-black/50 text-white">
                  <Loader2Icon className="mb-2 size-8 animate-spin" />
                  <span className="text-sm font-medium">
                    Enviando arquivo...
                  </span>
                </div>
              )}

              {uploadSuccess && (
                <div className="absolute inset-0 flex items-center justify-center rounded bg-green-500/90 text-white">
                  <div className="flex items-center space-x-2">
                    <svg
                      className="size-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span className="font-medium">
                      Arquivo enviado com sucesso!
                    </span>
                  </div>
                </div>
              )}

              {uploadError && (
                <div className="absolute inset-0 flex items-center justify-center rounded bg-red-500/80 p-4 text-center text-sm text-white">
                  <div>
                    <p className="mb-2 font-medium">Erro no upload:</p>
                    <p>{uploadError}</p>
                    <button
                      onClick={() => setUploadError(null)}
                      className="mt-2 rounded bg-white/20 px-3 py-1 text-xs hover:bg-white/30"
                    >
                      Fechar
                    </button>
                  </div>
                </div>
              )}

              {/* Carousel Navigation - Center positioned */}
              {hasMultipleFiles && (
                <>
                  {/* Left Navigation Button */}
                  {currentFileIndex > 0 && (
                    <button
                      onClick={(event) => {
                        event.stopPropagation();
                        event.preventDefault();
                        setCurrentFileIndex((prev) => prev - 1);
                      }}
                      className="absolute top-1/2 left-2 z-10 grid h-8 w-8 -translate-y-1/2 cursor-pointer place-content-center rounded-full bg-black/50 text-white transition-all hover:bg-black/70"
                    >
                      <ChevronLeftIcon className="size-5" />
                    </button>
                  )}

                  {/* Right Navigation Button */}
                  {currentFileIndex < totalFiles - 1 && (
                    <button
                      onClick={(event) => {
                        event.stopPropagation();
                        event.preventDefault();
                        setCurrentFileIndex((prev) => prev + 1);
                      }}
                      className="absolute top-1/2 right-2 z-10 grid h-8 w-8 -translate-y-1/2 cursor-pointer place-content-center rounded-full bg-black/50 text-white transition-all hover:bg-black/70"
                    >
                      <ChevronRightIcon className="size-5" />
                    </button>
                  )}

                  {/* Dots indicator */}
                  <div className="absolute bottom-2 left-1/2 z-10 flex -translate-x-1/2 gap-1">
                    {Array.from({ length: totalFiles }).map((_, index) => (
                      <div
                        key={index}
                        className={`h-1.5 w-1.5 rounded-full transition-all ${
                          index === currentFileIndex
                            ? "bg-white"
                            : "bg-white/50"
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}

              {isDragActive &&
              !isUploading &&
              !uploadError &&
              !uploadSuccess ? (
                <div className="from-background/80 grid h-full w-full place-content-center bg-linear-to-b">
                  <ImageIcon className="size-12 opacity-75" />
                </div>
              ) : (
                <div
                  className="flex items-center justify-end gap-2 p-2 text-right text-xs text-white"
                  style={{
                    textShadow: "rgba(0,0,0,0.5) 0px 1px 3px",
                  }}
                >
                  {action.files || files ? (
                    <>
                      <button
                        onClick={(event) => {
                          event.stopPropagation();
                          event.preventDefault();
                          setAction({
                            ...action,
                            files: null,
                          });
                          setFiles(null);
                          setCurrentFileIndex(0);
                        }}
                        className="grid h-6 w-6 cursor-pointer place-content-center rounded-sm p-1 text-white drop-shadow-xs drop-shadow-black/50 hover:drop-shadow-sm hover:drop-shadow-black/75"
                      >
                        <TrashIcon className="size-4" />
                      </button>
                      {action.files && action.files.length && (
                        <button
                          onClick={(event) => {
                            event.stopPropagation();
                            event.preventDefault();

                            const fileUrl =
                              action.files![currentFileIndex] ||
                              action.files![0];
                            window.open(fileUrl, "_blank");
                          }}
                          className="grid h-6 w-6 cursor-pointer place-content-center rounded-sm p-1 text-white drop-shadow-xs drop-shadow-black/50 hover:drop-shadow-sm hover:drop-shadow-black/75"
                        >
                          <DownloadIcon className="size-4" />
                        </button>
                      )}
                    </>
                  ) : (
                    <>Arraste seus arquivos para cá.</>
                  )}
                </div>
              )}
            </div>
          </div>
          {/* <LikeFooter liked={action.state === "finished"} /> */}
        </>
      )}
      {/* Legenda */}
      <div className="flex items-center justify-between gap-2">
        <div className="text-xs font-bold tracking-wider uppercase">
          {action.category === "stories" ? "Sequência de Stories" : "Legenda"}
        </div>
        <div className="flex items-center gap-2 overflow-x-hidden p-1">
          <input
            type="range"
            min={60}
            max={300}
            step={60}
            value={length}
            onChange={(e) => setLength(e.target.valueAsNumber)}
            className="bg-accent h-2 w-20 cursor-pointer appearance-none rounded-full"
          />

          <span className="block w-8 text-center text-xs">{length}</span>

          {action.category === "stories" ? (
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  size={"sm"}
                  className={` ${
                    isWorking &&
                    "stories" === fetcher.formData?.get("intent") &&
                    "animate-colors"
                  }`}
                  variant="ghost"
                >
                  <SparklesIcon className="size-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="p-0 md:w-90">
                <Command>
                  <CommandInput placeholder="Como são os Stories você quer gerar?" />
                  <CommandList>
                    <CommandEmpty>Nenhuma Stories foi encontrado</CommandEmpty>

                    <CommandGroup>
                      {Object.keys(storytellingModels.stories).map((k) => {
                        const model =
                          storytellingModels.stories[
                            k as keyof typeof storytellingModels.stories
                          ];

                        return (
                          <CommandItem
                            value={[
                              model.title,
                              model.effect,
                              model.useWhen,
                            ].join(" - ")}
                            key={k}
                            className="bg-item"
                            onSelect={async () => {
                              fetcher.submit(
                                {
                                  title: action.title,
                                  description: action.description,
                                  context: `EMPRESA: ${partner.title} - DESCRIÇÃO: ${partner.context}`,
                                  intent: AI_INTENTS.generateStories,
                                  model: k,
                                },
                                {
                                  action: "/handle-openai",
                                  method: "post",
                                },
                              );
                            }}
                            title={model.useWhen}
                          >
                            <p className="py-2">
                              <p className="mb-1 text-base leading-tight font-medium">
                                {model.title}
                              </p>
                              <p className="text-xs leading-none opacity-50">
                                {model.useWhen}
                              </p>
                            </p>
                          </CommandItem>
                        );
                      })}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          ) : (
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  size={"sm"}
                  className={` ${
                    isWorking &&
                    "instagram_caption" === fetcher.formData?.get("intent") &&
                    "animate-colors"
                  }`}
                  variant="ghost"
                >
                  <SparklesIcon className="size-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="bg-content p-0 md:w-90">
                <Command>
                  <CommandInput placeholder="Qual legenda você quer gerar?" />
                  <CommandList>
                    <CommandEmpty>Nenhuma legenda foi encontrada</CommandEmpty>

                    <CommandGroup>
                      {Object.keys(storytellingModels.legenda).map((k) => {
                        const model =
                          storytellingModels.legenda[
                            k as keyof typeof storytellingModels.legenda
                          ];

                        return (
                          <CommandItem
                            value={[
                              model.title,
                              model.description,
                              model.effect,
                              model.useWhen,
                            ].join(" - ")}
                            key={k}
                            className="bg-item"
                            onSelect={async () => {
                              fetcher.submit(
                                {
                                  title: action.title,
                                  description: action.description,
                                  context: `EMPRESA: ${partner.title} - DESCRIÇÃO: ${partner.context}`,
                                  intent: AI_INTENTS.generateCaption,
                                  model: k,
                                  length: length.toString(),
                                },
                                {
                                  action: "/handle-openai",
                                  method: "post",
                                },
                              );
                            }}
                            title={model.description}
                          >
                            <p className="py-2 leading-none">
                              <p className="mb-1">{model.title}</p>
                              <p className="text-xs opacity-50">
                                {model.description}
                              </p>
                            </p>
                          </CommandItem>
                        );
                      })}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          )}
        </div>
      </div>

      <textarea
        placeholder="Escreva sua legenda aqui ou peça à βIA para criar no botão superior direito."
        key={`instagram_caption-${action.id}`}
        name="instagram_caption"
        onChange={(event) =>
          setAction({
            ...action,
            instagram_caption: event.target.value,
          })
        }
        className={`field-sizing-content min-h-screen w-full text-base font-normal outline-hidden transition lg:min-h-auto lg:text-sm ${
          isInstagramFeed(action.category) ? "border-0 focus-within:ring-0" : ""
        }`}
        value={action.instagram_caption ? action.instagram_caption : undefined}
      ></textarea>
    </div>
  ) : null;
}

function LowerBar({
  action,
  setAction,
  isWorking,
  partner,
  topics,
}: {
  action: Action;
  setAction: (action: Action) => void;
  isWorking: boolean;
  partner: Partner;
  topics: Topic[];
}) {
  const matches = useMatches();
  const submit = useSubmit();
  const { toast } = useToast();
  const [runningTime, setRunningTime] = useState(0);

  const { categories, priorities, areas, partners } = matches[1]
    .data as DashboardRootType;
  const actionPartners = getPartners(action.partners, partners);

  const handleActions = (data: HandleActionsDataType) => {
    submit(
      {
        ...data,
        updated_at: format(new Date(), "yyyy-MM-dd HH:mm:ss"),
      },
      {
        action: "/handle-actions",
        method: "post",
        navigate: false,
      },
    );
  };

  useEffect(() => {
    const title = `${action.title} / ʙússoʟa`;
    let timerInterval: NodeJS.Timeout | undefined;
    document.title = formatTimer(runningTime).concat(` / ${title}`);
    if (runningTime > 0) {
      timerInterval = setInterval(() => {
        setRunningTime((rt) => rt - 1);
        document.title = formatTimer(runningTime).concat(` / ${title}`);
      }, 1000);
    } else {
      document.title = title;
      clearInterval(timerInterval);
    }

    return () => {
      if (timerInterval) clearInterval(timerInterval);
    };
  }, [runningTime]);

  const navigate = useNavigate();

  return (
    <div className="shrink-0 items-center justify-between overflow-hidden border-t p-4 md:flex md:px-8 lg:border-none">
      {/* Parceiros Categorias States Prioridade Responsável Cores */}
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 lg:gap-4">
        {/* Partners */}
        <PartnersDropdown
          partners={action.partners}
          onSelect={(partners) => {
            setAction({ ...action, partners });
          }}
        />

        {/* Categoria */}
        <CategoryDropdown
          action={actionToRawAction(action)}
          setAction={(rawAction) => {
            const timeRequired = (TIMES as any)[rawAction.category];

            const adjustments = validateAndAdjustActionDates({
              time: timeRequired,
              currentDate: parseISO(action.date),
              currentInstagramDate: parseISO(action.instagram_date),
              currentTime: action.time,
            });

            setAction({
              ...action,
              category: rawAction.category,
              date: adjustments.date
                ? format(adjustments.date, "yyyy-MM-dd HH:mm:ss")
                : action.date,
              instagram_date: adjustments.instagram_date
                ? format(adjustments.instagram_date, "yyyy-MM-dd HH:mm:ss")
                : action.instagram_date,
              time: adjustments.time || action.time,
            });
          }}
        />

        {/* States */}

        <StateDropdown
          state={action.state}
          onValueChange={(state) => {
            if (state !== action.state) {
              setAction({
                ...action,
                state,
              });
            }
          }}
        />
        {isInstagramFeed(action.category) && (
          <TopicsAction
            partner={action.partners[0]}
            actionTopics={action.topics || []}
            topics={topics}
            onCheckedChange={(topics) => setAction({ ...action, topics })}
            mode="command"
          />
        )}

        {/* Prioridade */}

        <DropdownMenu>
          <DropdownMenuTrigger className="button-trigger button-trigger__squared">
            <Icons id={action.priority} type="priority" />
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-content">
            {priorities.map((priority) => (
              <DropdownMenuItem
                key={priority.slug}
                className="bg-item flex items-center gap-2"
                textValue={priority.title}
                onSelect={async () => {
                  if (priority.slug !== action.priority) {
                    setAction({
                      ...action,
                      priority: priority.slug,
                    });
                  }
                }}
              >
                <Icons id={priority.slug} type="priority" className="h-4 w-4" />
                <span>{priority.title}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Responsáveis */}

        <ResponsibleForAction
          size="md"
          responsibles={action.responsibles}
          onCheckedChange={(responsibles) => {
            setAction({ ...action, responsibles });
          }}
          partner={action.partners[0]}
        />
        {/* Cores */}
        {getInstagramFeed({ actions: [action] }).length > 0 ? (
          <>
            <DropdownMenu>
              <DropdownMenuTrigger className="button-trigger button-trigger__squared">
                <div
                  className="size-6 rounded-[8px] border"
                  style={{
                    backgroundColor: action.color
                      ? action.color
                      : actionPartners[0].colors[0],
                  }}
                ></div>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-content">
                {actionPartners[0].colors.map(
                  (color: string, i: number) =>
                    i !== 1 && (
                      <DropdownMenuItem
                        key={i}
                        onSelect={() => {
                          setAction({
                            ...action,
                            color,
                          });
                        }}
                      >
                        <div
                          className="h-4 w-full rounded-[4px] border"
                          style={{
                            backgroundColor: color,
                          }}
                        ></div>
                      </DropdownMenuItem>
                    ),
                )}
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              variant={"ghost"}
              title="Gerar link de aprovação"
              onClick={() => {
                const url = `https://bussola.cnvt.com.br/report/${partner.slug}?action=${action.id}`;
                try {
                  navigator.clipboard.writeText(url);
                  toast({
                    description:
                      "O endereço da ação foi copiado para o clipboard.",
                    action: (
                      <ToastAction
                        altText="Ver Ação"
                        onClick={() => {
                          location.href = url;
                        }}
                      >
                        Ver Ação
                      </ToastAction>
                    ),
                  });
                } catch (e) {
                  console.log(e);
                }
              }}
              className="button-trigger"
            >
              <Link2Icon className="size-6" />
            </Button>
          </>
        ) : null}

        {/* Tempo */}
        <div className="flex items-center gap-2">
          <Button
            size={"icon"}
            variant={runningTime ? "destructive" : "ghost"}
            onClick={() => {
              if (runningTime) {
                setRunningTime(0);
              } else {
                setRunningTime(action.time * 60);
                // setRunningTime(3);
              }
            }}
          >
            {runningTime ? <TimerOffIcon /> : <TimerIcon />}
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger className="focus:outline-none">
              <ChevronsUpDownIcon className="size-4" />
            </DropdownMenuTrigger>
            <DropdownMenuPortal>
              <DropdownMenuContent className="bg-content">
                <DropdownMenuItem
                  onClick={() => {
                    setRunningTime(action.time * 60);
                  }}
                  className="bg-item"
                >
                  {action.time} minutos
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => {
                    setRunningTime(5 * 60);
                  }}
                  className="bg-item"
                >
                  5 minutos
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    setRunningTime(10 * 60);
                  }}
                  className="bg-item"
                >
                  10 minutos
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    setRunningTime(20 * 60);
                  }}
                  className="bg-item"
                >
                  20 minutos
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    setRunningTime(40 * 60);
                  }}
                  className="bg-item"
                >
                  40 minutos
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenuPortal>
          </DropdownMenu>
          <div className="px-2 text-2xl font-medium tabular-nums">
            {runningTime
              ? formatTimer(runningTime)
              : formatTimer(action.time * 60)}
          </div>
        </div>
      </div>

      {/* Data / Deletar / Atualizar */}
      <div className="mt-4 flex items-center justify-between gap-2 overflow-hidden p-1 md:my-0">
        <DateTimeAndInstagramDate
          action={{
            ...action,
            date: parseISO(action.date),
            instagram_date: parseISO(action.instagram_date),
          }}
          onDataChange={({
            date,
            instagram_date,
            time,
          }: {
            date?: Date;
            instagram_date?: Date;
            time?: number;
          }) => {
            // Usar a função unificada de validação
            const timeRequired =
              (TIMES as any)[action.category] || (TIMES as any)["post"];

            const adjustments = validateAndAdjustActionDates({
              date,
              instagram_date,
              time,
              currentDate: parseISO(action.date),
              currentInstagramDate: parseISO(action.instagram_date),
              currentTime: timeRequired,
            });

            let updates = { ...action };

            // Aplicar os ajustes formatando as datas para string se necessário
            if (adjustments.date) {
              updates.date = format(adjustments.date, "yyyy-MM-dd HH:mm:ss");
            }

            if (adjustments.instagram_date) {
              updates.instagram_date = format(
                adjustments.instagram_date,
                "yyyy-MM-dd HH:mm:ss",
              );
            }

            if (adjustments.time) {
              updates.time = adjustments.time;
            }

            setAction(updates);
          }}
        />

        <div className="flex items-center gap-2">
          <Button
            variant={"ghost"}
            className="button-trigger__squared button-trigger"
            onClick={() => {
              if (
                confirm(
                  "ESSA AÇÃO NÃO PODE SER DESFEITA! Deseja mesmo deletar essa ação?",
                )
              ) {
                handleActions({
                  ...action,
                  intent: INTENTS.deleteAction,
                });

                navigate(-1);
              }
            }}
          >
            <Trash2Icon className="size-4" />
          </Button>
          {/* <Button */}
          <Button
            onClick={() => {
              handleActions({
                ...action,
                responsibles: action.responsibles,
                intent: INTENTS.updateAction,
              });
            }}
            disabled={isWorking}
          >
            {isWorking ? (
              <div className="border-primary-foreground size-4 animate-spin rounded-full border-2 border-b-transparent"></div>
            ) : (
              <>
                <span className="hidden lg:inline">Salvar</span>
                <SaveIcon className="size-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

function getCleanTitle(title: string) {
  return title.indexOf(" | ") >= 0
    ? title.substring(0, title.indexOf(" | "))
    : title;
}

function formatTimer(time: number) {
  const hours = Math.floor(time / 3600);
  const minutes = Math.floor((time % 3600) / 60);
  const seconds = time % 60;

  return (time >= 3600 ? `${String(hours).padStart(2, "0")}:` : "").concat(
    `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`,
  );
}

function PopoverParameters({
  action,
  partner,
}: {
  action: Action;
  partner: Partner;
}) {
  const fetcher = useFetcher({ key: "action-page" });
  const isWorking = fetcher.state !== "idle";
  const [intensity, setIntensity] = useState([1, 1, 1, 1, 1, 1]);
  const [suggestion, setSuggestion] = useState<{
    title: string;
    values: number[];
  }>();
  const [query, setQuery] = useState<string>("");

  useEffect(() => {
    if (suggestion) {
      setIntensity(suggestion.values);
    }
  }, [suggestion]);

  return (
    <Popover>
      <PopoverTrigger className="button-trigger">
        <SlidersIcon />
      </PopoverTrigger>
      <PopoverContent className="bg-content w-[80vw] divide-y overflow-hidden lg:w-3xl">
        <div className="grid grid-cols-2 overflow-hidden">
          {parametersOptimized.map((parametro, index) => (
            <div
              className="col-span-1 flex flex-col items-center justify-between overflow-hidden py-4"
              key={parametro.id}
            >
              <div className="text-xs font-medium">{parametro.title}</div>
              <IntensityRange
                intensity={intensity[index]}
                intensities={parametro.values}
                onChange={(value) => {
                  setIntensity((prev) => {
                    let i = [...prev];
                    i.splice(index, 1, value);
                    return i;
                  });
                }}
              />

              {/* <ParametroDropdown key={parametro.id} parametro={parametro} /> */}
            </div>
          ))}
        </div>

        <div className="flex justify-between pt-4">
          <div>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost">
                  {suggestion?.title || "Sugestão"}
                </Button>
              </PopoverTrigger>
              <PopoverPortal>
                <PopoverContent className="bg-content">
                  <Command className="p-0">
                    <CommandInput value={query} onValueChange={setQuery} />
                    <CommandList className="p-0">
                      <CommandEmpty>Nenhuma sugestão</CommandEmpty>
                      {suggestionsParameters.map((parametro) => (
                        <CommandItem
                          key={parametro.title}
                          value={parametro.values.join("-")}
                          onSelect={(value) => {
                            setSuggestion({
                              title: parametro.title,
                              values: parametro.values,
                            });
                          }}
                        >
                          {parametro.title}
                        </CommandItem>
                      ))}
                    </CommandList>
                  </Command>
                </PopoverContent>
              </PopoverPortal>
            </Popover>
          </div>
          <Button
            disabled={isWorking}
            onClick={async (event) => {
              event.preventDefault();
              await fetcher.submit(
                {
                  intent: AI_INTENTS.generateCarousel,
                  title: action.title,
                  description: action.description,
                  context: partner.context,
                  intensity: intensity.join("-"),
                },
                {
                  method: "post",
                  action: "/handle-openai",
                },
              );
            }}
          >
            {isWorking ? (
              <div className="border-primary-foreground size-4 animate-spin rounded-full border-2 border-b-transparent"></div>
            ) : (
              <>
                Gerar <SparklesIcon />
              </>
            )}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

type Parametro = {
  id: number;
  title: string;
  description: string;
  values: ParametroValue[];
};

type ParametroValue = {
  id: number;
  value: string;
};

function IntensityRange({
  intensity,
  intensities,
  onChange,
}: {
  intensity: number;
  intensities: ParametroValue[];
  onChange: (value: number) => void;
}) {
  const [value, setValue] = useState(
    intensities.find((value) => value.id === intensity) as ParametroValue,
  );

  useEffect(() => {
    onChange(value.id);
  }, [value]);

  useEffect(() => {
    setValue(
      intensities.find((value) => value.id === intensity) as ParametroValue,
    );
  }, [intensity]);

  return (
    <div className="flex w-full flex-col items-center gap-2">
      <div className="w-full overflow-hidden text-center text-ellipsis whitespace-nowrap">
        {value?.value}
      </div>
      <input
        type="range"
        step={1}
        min={1}
        max={5}
        value={value.id}
        onChange={(e) =>
          setValue(
            intensities.find(
              (value) => value.id === e.target.valueAsNumber,
            ) as ParametroValue,
          )
        }
      />
    </div>
  );
}

function ParametroDropdown({ parametro }: { parametro: Parametro }) {
  const [value, setValue] = useState<ParametroValue>();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2">
        {value?.value} <ChevronDownIcon className="size-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="bg-content">
        {parametro.values.map((value: ParametroValue) => (
          <DropdownMenuItem
            key={value.id}
            className="bg-item"
            onSelect={() => setValue(value)}
          >
            {value.value}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
