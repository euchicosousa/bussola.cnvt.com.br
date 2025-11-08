import { format, formatDistanceToNow, isSameMonth, parseISO } from "date-fns";
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
  FilesIcon,
  LightbulbIcon,
  Link2Icon,
  SaveIcon,
  SlidersIcon,
  SparklesIcon,
  Trash2Icon,
  UploadCloudIcon,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import invariant from "tiny-invariant";

import Tiptap from "~/components/features/content/Tiptap";
import {
  CloudinaryUpload,
  type CloudinaryUploadResult,
} from "~/components/ui/cloudinary-upload";

import { PopoverPortal, PopoverTrigger } from "@radix-ui/react-popover";
import {
  CategoryDropdown,
  DateTimeAndInstagramDate,
  PartnersDropdown,
  ResponsibleForAction,
  StateDropdown,
  TopicsAction,
} from "~/components/features/actions/CreateAction";

import { FilesPopover } from "~/components/features/actions";
import { Button } from "~/components/ui/button";
import {
  Command,
  CommandEmpty,
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
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Popover, PopoverContent } from "~/components/ui/popover";
import { Timer } from "~/components/ui/timer";
import { ToastAction } from "~/components/ui/toast";
import { useToast } from "~/components/ui/use-toast";
import { AI_INTENTS, IMAGE_SIZES, INTENTS, TIMES } from "~/lib/constants";
import {
  parametersOptimized,
  suggestionsParameters,
} from "~/lib/constants/parametros";
import { createClient } from "~/lib/database/supabase";
import {
  actionToRawAction,
  Avatar,
  Bia,
  Content,
  getBiaMessage,
  getInstagramFeed,
  getPartners,
  getQueryString,
  Icons,
  isInstagramFeed,
} from "~/lib/helpers";
import { useFieldSaver } from "~/lib/hooks/useFieldSaver";
import { cn } from "~/lib/ui/utils";
import { isVideo } from "~/shared/utils/validation/contentValidation";
import { validateAndAdjustActionDates } from "~/shared/utils/validation/dateValidation";

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
  if (!data?.action?.title) {
    return [{ title: "ʙússoʟa - Domine, Crie e Conquiste." }];
  }

  return [
    {
      title: `${data.action.title} / ʙússoʟa`,
    },
  ];
};

export default function ActionPage() {
  const { action: baseAction, partner } = useLoaderData<typeof loader>();

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

  // Hook para salvar campos individualmente
  const { saveField } = useFieldSaver({
    entity: action,
    entityType: "action",
  });

  // Refs para acessar conteúdo atual dos editors
  const editorRef = useRef<any>(null);

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
        const newDescription =
          index < 0
            ? description.concat(
                getBiaMessage((fetcher.data as { message: string }).message),
              )
            : description
                .substring(0, action.description?.indexOf("<hr>"))
                .concat(
                  getBiaMessage((fetcher.data as { message: string }).message),
                )
                .concat(description.substring(index));

        setAction(() => ({
          ...action,
          description: newDescription,
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
            editorRef={editorRef}
          />
          {/* Upload de arquivos - apenas para Instagram */}
          <FileUploadSection
            action={action}
            setAction={setAction}
            //@ts-ignore
            saveField={saveField}
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
        //@ts-ignore
        saveField={saveField}
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

  const [localTitle, setLocalTitle] = useState(action.title);

  const fetcher = useFetcher({ key: "action-page" });
  const intent = fetcher.formData?.get("intent")?.toString();
  const isWorking =
    navigation.state !== "idle" ||
    fetchers.filter((f) => f.formData).length > 0;

  const titleRef = useRef<HTMLTextAreaElement>(null);

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
        ref={titleRef}
        value={localTitle}
        className={`field-sizing-content w-full resize-none overflow-hidden border-none bg-transparent p-0 py-2 text-3xl leading-[85%] font-bold tracking-tighter outline-hidden ${
          isSideBar
            ? "text-2xl"
            : action.title.length > 30
              ? "md:text-5xl"
              : "md:text-6xl"
        }`}
        rows={1}
        onChange={(event) => {
          setLocalTitle(event.target.value);
        }}
        onBlur={(event) =>
          setAction({
            ...action,
            title: event.target.value,
          })
        }
      />

      <div className="pr-1">
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
      </div>
    </div>
  );
}

export function Description({
  action,
  setAction,
  isWorking,
  partner,
  editorRef,
}: {
  action: Action;
  setAction: (action: Action) => void;
  isWorking: boolean;
  partner: Partner;
  editorRef: React.RefObject<any>;
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
                <div
                  className="bg-input debug-1 relative rounded-sm border p-2 pb-10"
                  onClick={() => {
                    promptRef.current?.focus();
                  }}
                >
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
              disabled={isWorking}
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
        </div>
      </div>

      <Tiptap
        content={action.description}
        editorRef={editorRef}
        onBlur={(text: string | null) => {
          setAction({
            ...action,
            description: text,
            updated_at: format(new Date(), "yyyy-MM-dd HH:mm:ss"),
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
  const instagramCaptionRef = useRef<HTMLTextAreaElement>(null);
  const [instagramCaption, setInstagramCaption] = useState("");

  useEffect(() => {
    setInstagramCaption(action.instagram_caption || "");
  }, [action.instagram_caption]);

  const [length, setLength] = useState(60);

  const fetcher = useFetcher({ key: "action-page" });

  return isInstagramFeed(action.category, true) ? (
    <div className="relative mt-8 w-full lg:mt-0 lg:w-1/4 lg:overflow-hidden lg:overflow-y-auto">
      <div className="relative mb-2">
        <Content
          action={action}
          aspect="feed"
          partner={partner}
          className="rounded-2xl"
          imageSize={IMAGE_SIZES.PREVIEW}
        />
      </div>

      {/* Legenda */}
      <div className="flex items-center justify-between gap-2">
        <div className="text-xs font-bold tracking-wider uppercase">
          {action.category === "stories" ? "Sequência de Stories" : "Legenda"}
        </div>
        <div className="flex items-center gap-2 overflow-x-hidden p-1">
          <input
            type="range"
            min={20}
            max={200}
            step={20}
            value={length}
            onChange={(e) => setLength(e.target.valueAsNumber)}
            className="bg-accent h-2 w-20 cursor-pointer appearance-none rounded-full"
          />

          <span className="block w-8 text-center text-xs">{length}</span>

          <Button
            size={"sm"}
            className={` ${
              isWorking &&
              "instagram_caption" === fetcher.formData?.get("intent") &&
              "animate-colors"
            }`}
            variant="ghost"
            onClick={async () => {
              fetcher.submit(
                {
                  title: action.title,
                  description: action.description,
                  context: `EMPRESA: ${partner.title} - DESCRIÇÃO: ${partner.context}`,
                  instagram_caption_tail: partner.instagram_caption_tail || "",
                  intent: AI_INTENTS.generateCaption,
                  length: length.toString(),
                },
                {
                  action: "/handle-openai",
                  method: "post",
                },
              );
            }}
          >
            <SparklesIcon className="size-4" />
          </Button>
        </div>
      </div>

      <textarea
        ref={instagramCaptionRef}
        placeholder="Escreva sua legenda aqui ou peça à βIA para criar no botão superior direito."
        key={`instagram_caption-${action.id}`}
        name="instagram_caption"
        onChange={(event) => {
          setInstagramCaption(event.target.value);
        }}
        onBlur={(event) => {
          setAction({
            ...action,
            instagram_caption: event.target.value,
          });
        }}
        className={`field-sizing-content min-h-screen w-full text-base font-normal outline-hidden transition lg:min-h-auto lg:text-sm ${
          isInstagramFeed(action.category) ? "border-0 focus-within:ring-0" : ""
        }`}
        value={instagramCaption}
      ></textarea>
    </div>
  ) : null;
}

export function LowerBar({
  action,
  setAction,
  isWorking,
  partner,
  saveField,
}: {
  action: Action;
  setAction: (action: Action) => void;
  isWorking: boolean;
  partner: Partner;
  saveField: (field: string, value: any) => void;
}) {
  const matches = useMatches();
  const submit = useSubmit();
  const { toast } = useToast();

  const { priorities, partners } = matches[1].data as DashboardRootType;
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
            saveField("partners", partners);
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
              saveField("state", state);
            }
          }}
        />
        {isInstagramFeed(action.category) && (
          <TopicsAction
            partner={action.partners[0]}
            actionTopics={action.topics || []}
            onCheckedChange={(topics) => {
              setAction({ ...action, topics });
              // Salvar imediatamente
              saveField("topics", topics);
            }}
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
                    saveField("priority", priority.slug);
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
            // Verificar se está tentando remover o último responsável
            if (responsibles.length === 0) {
              // showWarning(
              //   "É necessário ter pelo menos um responsável pela ação",
              // );
              return; // Não permitir a remoção
            }

            setAction({ ...action, responsibles });
            saveField("responsibles", responsibles);
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
                          saveField("color", color);
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

        {/* Timer */}
        <Timer
          defaultTime={action.time}
          presetTimes={[
            1,
            ...Array.from(new Set(Object.values(TIMES))).sort((a, b) => a - b),
          ]}
          titlePrefix={action.title}
          size="md"
          onComplete={() => {
            toast({
              title: "Timer finalizado!",
              description: `Tempo da ação "${action.title}" concluído.`,
            });
          }}
        />
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

function FileUploadSection({
  action,
  setAction,
  saveField,
  partner,
}: {
  action: Action;
  setAction: (action: Action) => void;
  saveField: (field: string, value: any) => void;
  partner: Partner;
}) {
  const handleContentUpload = (results: CloudinaryUploadResult[]) => {
    const newFiles = results
      .map((result) => result.uploadInfo?.secure_url || result.secure_url)
      .filter(Boolean);

    const category = action.category;
    const currentFiles = action.content_files || [];
    let updatedContentFiles: string[] = [];

    switch (category) {
      case "post":
        updatedContentFiles = newFiles.slice(0, 1);
        break;
      case "reels":
        // Para reels: index 0 = vídeo, index 1 = capa/imagem
        const currentVideo = currentFiles[0] || "";
        const currentCover = currentFiles[1] || "";

        const newVideos = newFiles.filter(isVideo);
        const newImages = newFiles.filter((file) => !isVideo(file));

        let finalVideo = currentVideo;
        let finalCover = currentCover;

        // Se enviou vídeo, substitui apenas o index 0
        if (newVideos.length > 0) {
          finalVideo = newVideos[0];
        }

        // Se enviou imagem, substitui apenas o index 1
        if (newImages.length > 0) {
          finalCover = newImages[0];
        }

        updatedContentFiles = [finalVideo, finalCover];
        break;
      case "carousel":
        updatedContentFiles = [...currentFiles, ...newFiles].slice(0, 20);
        break;
      case "stories":
        updatedContentFiles = [...currentFiles, ...newFiles].slice(0, 10);
        break;
      default:
        updatedContentFiles = newFiles;
    }

    setAction({
      ...action,
      content_files:
        updatedContentFiles.length > 0 ? updatedContentFiles : null,
      updated_at: format(new Date(), "yyyy-MM-dd HH:mm:ss"),
    });
    saveField(
      "content_files",
      updatedContentFiles.length > 0 ? updatedContentFiles : null,
    );
  };

  const handleWorkUpload = (results: CloudinaryUploadResult[]) => {
    const newFiles = results
      .map((result) => result.uploadInfo?.secure_url || result.secure_url)
      .filter(Boolean);

    const currentFiles = action.work_files || [];
    const updatedWorkFiles = [...currentFiles, ...newFiles].slice(0, 5);

    setAction({
      ...action,
      work_files: updatedWorkFiles.length > 0 ? updatedWorkFiles : null,
      updated_at: format(new Date(), "yyyy-MM-dd HH:mm:ss"),
    });
    saveField(
      "work_files",
      updatedWorkFiles.length > 0 ? updatedWorkFiles : null,
    );
  };

  const maxContentFiles =
    action.category === "post"
      ? 1
      : action.category === "reels"
        ? 2
        : action.category === "carousel"
          ? 20
          : action.category === "stories"
            ? 10
            : 5;

  const currentContentCount = action.content_files?.length || 0;
  const currentWorkCount = action.work_files?.length || 0;

  return (
    <div className="mt-2 space-y-4">
      <div className="flex shrink-0 items-center justify-between gap-8 overflow-hidden">
        <div className="text-muted-foreground overflow-hidden text-sm text-ellipsis whitespace-nowrap">
          Faça o upload dos arquivos aqui
        </div>

        <div className="flex gap-2">
          {isInstagramFeed(action.category, true) && (
            <div className="flex gap-[1px] overflow-hidden">
              <CloudinaryUpload
                onUploadSuccess={handleContentUpload}
                maxFiles={Math.max(0, maxContentFiles - currentContentCount)}
                allowedTypes={["image", "video"]}
                partnerSlug={partner.slug}
              >
                <Button
                  variant="secondary"
                  size="sm"
                  className={cn(
                    "overflow-hidden",
                    currentContentCount > 0 && "rounded-r-none",
                  )}
                >
                  <UploadCloudIcon />
                  <div className="overflow-hidden text-ellipsis whitespace-nowrap">
                    Conteúdo ({currentContentCount}/{maxContentFiles})
                  </div>
                </Button>
              </CloudinaryUpload>
              {currentContentCount > 0 && (
                <FilesPopover
                  setAction={setAction}
                  action={action}
                  files={action.content_files}
                  saveField={saveField}
                >
                  <Button
                    variant="secondary"
                    size="sm"
                    className="rounded-l-none"
                  >
                    <FilesIcon />
                  </Button>
                </FilesPopover>
              )}
            </div>
          )}
          <div className="flex gap-[1px] overflow-hidden">
            <CloudinaryUpload
              onUploadSuccess={handleWorkUpload}
              maxFiles={5}
              allowedTypes={[
                "image",
                "video",
                "pdf",
                "doc",
                "docx",
                "xls",
                "xlsx",
                "ppt",
                "pptx",
              ]}
              partnerSlug={partner.slug}
            >
              <Button
                variant="secondary"
                size="sm"
                className={cn(
                  "overflow-hidden",
                  currentWorkCount > 0 && "rounded-r-none",
                )}
              >
                <UploadCloudIcon />
                <div className="overflow-hidden text-ellipsis whitespace-nowrap">
                  Trabalho ({currentWorkCount})
                </div>
              </Button>
            </CloudinaryUpload>
            {currentWorkCount > 0 && (
              <FilesPopover
                action={action}
                files={action.work_files}
                setAction={setAction}
                saveField={saveField}
                isWorkFiles
              >
                <Button
                  variant="secondary"
                  size="sm"
                  className="rounded-l-none"
                >
                  <FilesIcon />
                </Button>
              </FilesPopover>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
