import {
  addHours,
  format,
  formatDistanceToNow,
  isAfter,
  isSameMonth,
  parseISO,
  subHours,
} from "date-fns";
import {
  type ActionFunctionArgs,
  Form,
  Link,
  type LoaderFunctionArgs,
  type MetaFunction,
  useActionData,
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
  ChevronsUpDownIcon,
  ImageIcon,
  LightbulbIcon,
  Link2Icon,
  SaveIcon,
  SparklesIcon,
  TimerIcon,
  TimerOffIcon,
  Trash,
  Trash2Icon,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useDropzone } from "react-dropzone-esm";
import invariant from "tiny-invariant";

import Tiptap from "~/components/Tiptap";

import { PopoverTrigger } from "@radix-ui/react-popover";
import {
  DateTimeAndInstagramDate,
  PartnersDropdown,
  ResponsibleForAction,
  StateSelect,
} from "~/components/CreateAction";
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
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Label } from "~/components/ui/label";
import { Popover, PopoverContent } from "~/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import { Slider } from "~/components/ui/slider";
import { ToastAction } from "~/components/ui/toast";
import { useToast } from "~/components/ui/use-toast";
import { FRAMEWORKS, INTENTS, TRIGGERS } from "~/lib/constants";
import {
  Avatar,
  Bia,
  Content,
  getBiaMessage,
  getInstagramFeed,
  getPartners,
  getQueryString,
  getTypeOfTheContent,
  Icons,
  isInstagramFeed,
  LikeFooter,
} from "~/lib/helpers";
import { createClient } from "~/lib/supabase";
import { cn } from "~/lib/utils";
import { storytellingModels } from "./handle-openai";

export const config = { runtime: "edge" };
const ACCESS_KEY = process.env.BUNNY_ACCESS_KEY;

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const { supabase } = createClient(request);
  const { id } = params;

  if (!id) throw new Error("$id não foi definido");

  const { data: action } = await supabase
    .from("actions")
    .select("*")
    .is("archived", false)
    .match({ id })
    .returns<Action[]>()
    .single();

  invariant(action);

  return { action };
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const files = formData.getAll("files") as File[];
  const filenames = String(formData.get("filenames")).split(",");
  const partner = formData.get("partner") as string;
  try {
    const urls = await Promise.all(
      files.map(async (file, i) => {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const fileUrl = `${partner}/${new Date().getFullYear()}/${
          new Date().getMonth() + 1
        }/${format(new Date(), "yyyy-MM-dd_hh-mm-ss")}_${i}${filenames[
          i
        ].substring(filenames[i].lastIndexOf("."))}`;
        const url = `https://br.storage.bunnycdn.com/agencia-cnvt/${fileUrl}`;
        const downloadUrl = `https://agenciacnvt.b-cdn.net/${fileUrl}`;

        const response = await fetch(url, {
          method: "PUT",
          headers: {
            AccessKey: ACCESS_KEY!,
            "Content-Type": "application/octet-stream",
          },
          body: buffer,
        });

        return { downloadUrl, status: response.statusText };
      }),
    );

    return { urls: urls.map((url) => url.downloadUrl) };
  } catch (error) {
    console.log(error);
  }

  return {};
};

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return [
    {
      title: `${data?.action?.title} / ʙússoʟa`,
    },
  ];
};

export default function ActionPage() {
  const { action: baseAction } = useLoaderData<typeof loader>();
  const data = useActionData<{ urls: string[] }>();

  const [action, setAction] = useState(baseAction);
  const [trigger, setTrigger] = useState("Autoridade");

  const matches = useMatches();

  const { partners, people } = matches[1].data as DashboardRootType;

  const responsibles: Person[] = [];
  action.responsibles?.filter((user_id) =>
    responsibles.push(
      people.find((person) => person.user_id === user_id) as Person,
    ),
  );

  const navigation = useNavigation();
  const fetchers = useFetchers();
  const partner = partners.find(
    (partner) => partner.slug === action.partners[0],
  ) as Partner;

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
        ["caption", "stories", "shrink", "expand"].findIndex(
          (item) => item === intent,
        ) >= 0
      ) {
        setAction({
          ...action,
          caption: (fetcher.data as { message: string }).message,
        });
      }
    }
  }, [fetcher.data]);

  // insere as urls
  useEffect(() => {
    if (data) {
      setAction({ ...action, files: data.urls });
    }
  }, [data]);

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
          <Title
            action={action}
            setAction={setAction}
            isWorking={isWorking}
            partner={partner}
          />
          {/* Descrição */}
          <Description
            action={action}
            setAction={setAction}
            isWorking={isWorking}
            trigger={trigger}
            setTrigger={setTrigger}
            partner={partner}
          />

          {/* Arquivos e Legenda */}
        </div>
        <RightSide
          action={action}
          setAction={setAction}
          isWorking={isWorking}
          trigger={trigger}
          setTrigger={setTrigger}
          partner={partner}
        />
      </div>
      {/* Lower bar */}
      <LowerBar
        action={action}
        setAction={setAction}
        isWorking={isWorking}
        partner={partner}
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

function Header({ action, partner }: { action: Action; partner: Partner }) {
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

function Title({
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

  return (
    <div className="flex items-start gap-4 pt-2">
      <textarea
        value={action.title}
        className={`field-sizing-content w-full resize-none overflow-hidden border-none bg-transparent p-0 py-2 text-3xl leading-[85%] font-bold tracking-tighter outline-hidden ${
          action.title.length > 30 ? "md:text-5xl" : "md:text-6xl"
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

          <DropdownMenuContent>
            {Object.keys(storytellingModels.titulos).map((k, i) => {
              const model =
                storytellingModels.titulos[
                  k as keyof typeof storytellingModels.titulos
                ];

              return (
                <DropdownMenuItem
                  key={i}
                  className="bg-item"
                  onSelect={async () => {
                    fetcher.submit(
                      {
                        title: action.title,
                        description: action.description,
                        context: `EMPRESA: ${partner.title} - DESCRIÇÃO: ${partner.context}`,
                        intent: "title",
                        model: k,
                      },
                      {
                        action: "/handle-openai",
                        method: "post",
                      },
                    );
                  }}
                >
                  {model.title}
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

function Description({
  action,
  setAction,
  isWorking,
  setTrigger,
  trigger,
  partner,
}: {
  action: Action;
  setAction: (action: Action) => void;
  isWorking: boolean;
  setTrigger: (trigger: string) => void;
  trigger: string;
  partner: Partner;
}) {
  const fetcher = useFetcher({ key: "action-page" });
  const promptRef = useRef<HTMLTextAreaElement>(null);

  async function askBia(prompt?: string) {
    if (prompt) {
      fetcher.submit(
        {
          prompt,
          intent: "prompt",
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
          <Popover>
            <PopoverTrigger className="button-trigger">
              <Bia size="xs" />
            </PopoverTrigger>
            <PopoverContent className="bg-content w-[90dvw] lg:max-w-[500px]">
              <fieldset disabled={fetcher.formData?.get("intent") === "prompt"}>
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
                    intent: "ideas",
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

          {action.category === "carousel" ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  size={"sm"}
                  className={` ${
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
                {Object.keys(storytellingModels.carrossel).map((k) => {
                  const model =
                    storytellingModels.carrossel[
                      k as keyof typeof storytellingModels.carrossel
                    ];

                  return (
                    <DropdownMenuItem
                      className="bg-item"
                      onSelect={async () => {
                        fetcher.submit(
                          {
                            title: action.title,
                            description: action.description,
                            context: `EMPRESA: ${partner.title} - DESCRIÇÃO: ${partner.context}`,
                            intent: "carousel",
                            model: k,
                          },
                          {
                            action: "/handle-openai",
                            method: "post",
                          },
                        );
                      }}
                    >
                      <p>
                        {model.title} <br />
                        <span className="text-xs opacity-50">
                          {model.effect}
                        </span>
                      </p>
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : action.category === "reels" ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  size={"sm"}
                  className={` ${
                    isWorking &&
                    "reels" === fetcher.formData?.get("intent") &&
                    "animate-colors"
                  }`}
                  variant="ghost"
                >
                  <SparklesIcon className="size-4" />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent className="bg-content">
                {Object.keys(storytellingModels.reel).map((k) => {
                  const model =
                    storytellingModels.reel[
                      k as keyof typeof storytellingModels.reel
                    ];

                  return (
                    <DropdownMenuItem
                      className="bg-item"
                      onSelect={async () => {
                        fetcher.submit(
                          {
                            title: action.title,
                            description: action.description,
                            context: `EMPRESA: ${partner.title} - DESCRIÇÃO: ${partner.context}`,
                            intent: "carousel",
                            model: k,
                            trigger,
                          },
                          {
                            action: "/handle-openai",
                            method: "post",
                          },
                        );
                      }}
                    >
                      <p>
                        {model.title} <br />
                        <span className="text-xs opacity-50">
                          {model.effect}
                        </span>
                      </p>
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : action.category === "post" ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  size={"sm"}
                  className={` ${
                    isWorking &&
                    fetcher.formData?.get("intent") === "carousel" &&
                    "animate-colors"
                  }`}
                  variant="ghost"
                >
                  <SparklesIcon /> Modelos
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent className="bg-content">
                {Object.keys(storytellingModels.carrossel).map((k) => {
                  const model =
                    storytellingModels.carrossel[
                      k as keyof typeof storytellingModels.carrossel
                    ];

                  return (
                    <DropdownMenuItem
                      className="bg-item"
                      onSelect={async () => {
                        fetcher.submit(
                          {
                            title: action.title,
                            description: action.description,
                            context: `EMPRESA: ${partner.title} - DESCRIÇÃO: ${partner.context}`,
                            intent: "carousel",
                            model: k,
                          },
                          {
                            action: "/handle-openai",
                            method: "post",
                          },
                        );
                      }}
                    >
                      <p>
                        {model.title} <br />
                        <span className="text-xs opacity-50">
                          {model.effect}
                        </span>
                      </p>
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : null}
        </div>
      </div>

      <Tiptap
        content={action.description}
        onBlur={(text) => {
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
  trigger,
  setTrigger,
  isWorking,
  partner,
}: {
  action: Action;
  setAction: (action: Action) => void;
  isWorking: boolean;
  setTrigger: (trigger: string) => void;
  trigger: string;
  partner: Partner;
}) {
  const [files, setFiles] = useState<{
    previews: { type: string; preview: string }[];
    files: string[];
  } | null>(null);

  const [length, setLength] = useState([60]);

  const fetcher = useFetcher({ key: "action-page" });
  const { getInputProps, getRootProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      setFiles({
        previews: acceptedFiles.map((f) => ({
          preview: URL.createObjectURL(f),
          type: getTypeOfTheContent(f.name),
        })),
        files: acceptedFiles.map((f) => f.name),
      });
    },
  });

  return isInstagramFeed(action.category, true) ? (
    <div className="relative mt-8 w-full lg:mt-0 lg:w-1/4 lg:overflow-hidden lg:overflow-y-auto">
      {/* Arquivo */}
      {action.category !== "stories" && (
        <>
          <Form method="post" encType="multipart/form-data">
            <div className="relative min-h-[50px] overflow-hidden rounded">
              <Content
                action={{
                  ...action,
                  previews: files ? files.previews : null,
                }}
                aspect="full"
                partner={partner}
              />

              <div
                {...getRootProps()}
                className="absolute top-0 h-[calc(100%-60px)] w-full"
              >
                <input name="partner" hidden defaultValue={partner.slug} />
                <input name="filenames" hidden defaultValue={files?.files} />
                <input
                  name="title"
                  hidden
                  defaultValue={action.title
                    .toLocaleLowerCase()
                    .replace(/\s/g, "-")
                    .replace(/[^0-9a-z-]/g, "")}
                />
                <input {...getInputProps()} name="files" multiple />

                {isDragActive ? (
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
                    Arraste seus arquivos para cá.
                    {(action.files || files) && (
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
                          }}
                          className="grid h-6 w-6 cursor-pointer place-content-center rounded-sm p-1 text-white text-shadow-black hover:bg-black/10"
                          // className="bg-foreground/25 hover:bg-foreground/50 text-background grid h-6 w-6 cursor-pointer place-content-center rounded-sm p-1"
                        >
                          <Trash className="size-4" />
                        </button>
                        <button
                          type="submit"
                          onClick={(event) => {
                            event.stopPropagation();
                          }}
                          className="grid h-6 w-6 cursor-pointer place-content-center rounded-sm p-1 text-white text-shadow-black hover:bg-black/10"
                        >
                          <SaveIcon className="size-4" />
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </Form>
          <LikeFooter liked={action.state === "finished"} />
        </>
      )}
      {/* Legenda */}
      <div className="flex items-center justify-between gap-2">
        <div className="text-xs font-bold tracking-wider uppercase">
          {action.category === "stories" ? "Sequência de Stories" : "Legenda"}
        </div>
        <div className="flex items-center gap-2 overflow-x-hidden p-1">
          {
            <Slider
              defaultValue={[150]}
              max={600}
              min={30}
              step={30}
              className="w-20"
              value={length}
              onValueChange={(value) => {
                setLength(value);
              }}
            />
          }

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
                                  intent: "stories",
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
                    "caption" === fetcher.formData?.get("intent") &&
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
                                  intent: "caption",
                                  model: k,
                                  length: length[0].toString(),
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
        key={`caption-${action.id}`}
        name="caption"
        onChange={(event) =>
          setAction({
            ...action,
            caption: event.target.value,
          })
        }
        className={`field-sizing-content min-h-screen w-full text-base font-normal outline-hidden transition lg:min-h-auto lg:text-sm ${
          isInstagramFeed(action.category) ? "border-0 focus-within:ring-0" : ""
        }`}
        value={action.caption ? action.caption : undefined}
      ></textarea>
    </div>
  ) : null;
}

function LowerBar({
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
  const matches = useMatches();
  const submit = useSubmit();
  const { toast } = useToast();
  const [runningTime, setRunningTime] = useState(0);

  const { categories, priorities, areas, partners } = matches[1]
    .data as DashboardRootType;
  const actionPartners = getPartners(action.partners, partners);

  const handleActions = (data: {
    [key: string]: string | number | string[] | null | boolean;
  }) => {
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

        <DropdownMenu>
          <DropdownMenuTrigger className="button-trigger button-trigger__squared">
            <Icons id={action.category} />
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-content">
            {areas.map((area, i) => (
              <DropdownMenuGroup key={area.id}>
                {i > 0 && <DropdownMenuSeparator />}
                <h4 className="px-3 py-1 text-[10px] font-bold tracking-wider uppercase opacity-50">
                  {area.title}
                </h4>
                {categories.map((category) =>
                  category.area === area.slug ? (
                    <DropdownMenuItem
                      key={category.slug}
                      className="bg-item flex items-center gap-2"
                      onSelect={async () => {
                        if (category.slug !== action.category) {
                          setAction({
                            ...action,
                            category: category.slug,
                          });
                        }
                      }}
                    >
                      <Icons
                        id={category.slug}
                        className={`size-4 opacity-50`}
                      />
                      <span>{category.title}</span>
                    </DropdownMenuItem>
                  ) : null,
                )}
              </DropdownMenuGroup>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* States */}

        <StateSelect
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
                  (color, i) =>
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
          onChange={({ date, instagram_date, time }) => {
            if (date)
              setAction({
                ...action,
                date: format(date, "yyyy-MM-dd HH:mm:ss"),
                instagram_date: isAfter(date, action.instagram_date)
                  ? format(addHours(date, 1), "yyyy-MM-dd HH:mm:ss")
                  : action.instagram_date,
              });
            if (instagram_date)
              setAction({
                ...action,
                instagram_date: format(instagram_date, "yyyy-MM-dd HH:mm:ss"),
                date: isAfter(action.date, instagram_date)
                  ? format(subHours(instagram_date, 1), "yyyy-MM-dd HH:mm:ss")
                  : action.date,
              });

            if (time) setAction({ ...action, time });
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
                <SaveIcon className="size-4" />
                <span className="hidden lg:inline">Atualizar</span>
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

// function PopoverTFM({
//   title,
//   models,
//   className,
//   onGenerate,
// }: {
//   title: string;
//   models: { title: string; value: string }[];
//   className?: string;
//   onGenerate?: ({
//     trigger,
//     framework,
//     model,
//   }: {
//     trigger: string;
//     framework: string;
//     model: string;
//   }) => void;
// }) {
//   const [trigger, setTrigger] = useState("Autoridade");
//   const [framework, setFramework] = useState("pas");
//   const [model, setModel] = useState(models[0]);

//   return (
//     <Popover>
//       <PopoverTrigger className="button-trigger flex gap-2">
//         <Bia size="xs" /> <SparklesIcon className="size-4" />
//       </PopoverTrigger>
//       <PopoverContent
//         className={cn(
//           `bg-content mr-[5vw] flex max-h-[50vh] w-[90vw] flex-col overflow-hidden text-center md:mr-4 md:max-h-[80vh] md:w-lg`,
//           className,
//         )}
//       >
//         <div className="text-xl font-medium tracking-tighter">{title}</div>

//         <hr className="-mx-4 mt-4" />
//         <div className="scrollbars-v h-full py-4">
//           {/* Gatilhos */}
//           <div>
//             <h5 className="font-medium">Gatilho mental</h5>

//             <RadioGroup
//               defaultValue={trigger}
//               onValueChange={(value) => setTrigger(value)}
//               className="mt-2 mb-8 grid grid-cols-2 justify-center gap-1 md:grid-cols-3"
//             >
//               {TRIGGERS.map((trigger, i) => (
//                 <div key={i}>
//                   <RadioGroupItem
//                     value={trigger.value}
//                     id={`trigger_${trigger.value}`}
//                     className="hidden"
//                   />

//                   <Label
//                     htmlFor={`trigger_${trigger.value}`}
//                     className="peer-data-[state=checked]:bg-secondary peer-data-[state=checked]:text-secondary-foreground text-muted-foreground inline-block rounded px-3 py-2 text-center font-normal transition-colors"
//                   >
//                     {trigger.value}
//                   </Label>
//                 </div>
//               ))}
//             </RadioGroup>
//           </div>

//           {/* Frameworks */}
//           <div>
//             <h5 className="font-medium">Framework</h5>
//             <RadioGroup
//               defaultValue={framework}
//               className="mt-2 mb-8 grid grid-cols-3 justify-center gap-1 md:grid-cols-4"
//               onValueChange={(value) => {
//                 setFramework(value);
//               }}
//             >
//               {Object.entries(FRAMEWORKS).map(([key, value], i) => (
//                 <div key={i}>
//                   <RadioGroupItem
//                     value={value.title}
//                     id={`framework_${i}`}
//                     className="hidden"
//                   />

//                   <Label
//                     htmlFor={`framework_${i}`}
//                     className="peer-data-[state=checked]:bg-secondary peer-data-[state=checked]:text-secondary-foreground text-muted-foreground inline-block rounded px-3 py-2 text-center font-normal uppercase transition-colors"
//                   >
//                     {value.title}
//                   </Label>
//                 </div>
//               ))}
//             </RadioGroup>
//           </div>
//           {/* Modelos */}
//           {models && (
//             <div>
//               <h5 className="font-medium">Modelo</h5>
//               <RadioGroup
//                 defaultValue={model.value}
//                 onValueChange={(value) =>
//                   setModel(models.filter((model) => model.value === value)[0])
//                 }
//                 className="mt-2 mb-4 flex justify-center gap-1"
//               >
//                 {models.map((model, i) => (
//                   <div key={i} className="">
//                     <RadioGroupItem
//                       value={model.value}
//                       id={`model_${i}`}
//                       className="hidden"
//                     />

//                     <Label
//                       htmlFor={`model_${i}`}
//                       className="peer-data-[state=checked]:bg-secondary peer-data-[state=checked]:text-secondary-foreground text-muted-foreground inline-block rounded px-3 py-2 text-center font-normal transition-colors"
//                     >
//                       {model.title}
//                     </Label>
//                   </div>
//                 ))}
//               </RadioGroup>
//             </div>
//           )}
//         </div>
//         <hr className="-mx-4 mb-4" />
//         <div className="flex items-center justify-between">
//           <div className="pl-4 text-xs font-medium tracking-wider uppercase">{`${trigger} • ${framework} • ${model.title}`}</div>
//           <Button
//             onClick={() => {
//               if (onGenerate) {
//                 onGenerate({ trigger, framework, model: model.value });
//               }
//             }}
//           >
//             Gerar <SparklesIcon />
//           </Button>
//         </div>
//       </PopoverContent>
//     </Popover>
//   );
// }
