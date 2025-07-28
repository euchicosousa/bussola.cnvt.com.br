import {
  eachMonthOfInterval,
  endOfYear,
  format,
  isSameMonth,
  parseISO,
  startOfYear,
} from "date-fns";
import { ptBR } from "date-fns/locale/pt-BR";
import { CalendarIcon, Trash2Icon } from "lucide-react";
import { useState } from "react";
import {
  Form,
  useLoaderData,
  useSubmit,
  type ActionFunctionArgs,
  type MetaFunction,
} from "react-router";
import { Heading } from "~/components/Headings";
import { Button } from "~/components/ui/button";
import { Calendar } from "~/components/ui/calendar";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { createClient } from "~/lib/supabase";

export const config = { runtime: "edge" };

export const meta: MetaFunction = () => {
  return [
    { tile: "NOVA DATA COMEMORATIVA - ʙússoʟa" },
    {
      name: "description",
      content:
        "Aplicativo de Gestão de Projetos Criado e Mantido pela Agência CNVT®. ",
    },
  ];
};

export const loader = async ({ request }: ActionFunctionArgs) => {
  const { supabase } = createClient(request);

  const { data: celebrations } = await supabase
    .from("celebrations")
    .select()
    .returns<Celebration[]>();

  return { celebrations };
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { supabase } = createClient(request);

  const formData = await request.formData();

  if (formData.get("id")) {
    await supabase
      .from("celebrations")
      .delete()
      .match({ id: formData.get("id") });
    return { ok: true };
  }

  const data = {
    title: String(formData.get("title")),
    date: String(formData.get("date")),
  };

  const { data: celebration, error } = await supabase
    .from("celebrations")
    //@ts-ignore
    .insert(data)
    .select()
    .order("date", { ascending: true })
    .returns<Celebration[]>();

  if (error) {
    console.log({ error });
  }

  return { celebration };
};

export default function NewPartners() {
  const { celebrations } = useLoaderData<typeof loader>();

  const [open, setOpen] = useState(false);
  const [date, setDate] = useState<Date>(new Date());
  const [value, setValue] = useState(date);

  const months = eachMonthOfInterval({
    start: startOfYear(new Date()),
    end: endOfYear(new Date()),
  });

  let dates = months.map((month) => ({
    month,
    celebrations: celebrations?.filter((celebration) => {
      return isSameMonth(parseISO(celebration.date), month);
    }),
  }));

  dates = dates.map((date) => ({
    month: date.month,
    celebrations:
      date.celebrations?.sort((a, b) => {
        return parseISO(a.date).getTime() - parseISO(b.date).getTime();
      }) || [],
  }));

  const submit = useSubmit();

  const deleteCelebration = async (id: string) => {
    submit({ id }, { method: "post", navigate: false });
  };

  return (
    <div className="mx-auto flex h-full max-w-3xl flex-col overflow-hidden px-2 py-4 md:px-8 lg:py-8">
      <Heading>Data Comemorativa</Heading>

      <div className="grid h-full gap-4 overflow-hidden md:grid-cols-2">
        <div className="scrollbars-v h-full pr-4">
          {dates?.map((date) =>
            date.celebrations?.length ? (
              <div key={date.month.toString()} className="mb-4">
                <div className="mb-2 text-xl font-medium tracking-tighter capitalize">
                  {format(date.month, "MMMM", { locale: ptBR })}
                </div>
                <div className="divide-y text-sm">
                  {date.celebrations?.map((celebration) => (
                    <div className="group flex gap-2 py-2" key={celebration.id}>
                      <div
                        className="w-8 font-medium"
                        title={celebration.title}
                      >
                        {format(parseISO(celebration.date), "dd")}
                      </div>

                      <div className="w-full overflow-hidden text-ellipsis whitespace-nowrap">
                        {celebration.title}
                      </div>
                      <div
                        onClick={() => {
                          deleteCelebration(celebration.id);
                        }}
                        className="cursor-pointer opacity-0 transition-opacity group-hover:opacity-100"
                      >
                        <Trash2Icon className="size-3" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null,
          )}
        </div>
        <div className="pr-1">
          <Form className="mx-auto max-w-md" method="post">
            <div className="mb-4">
              <Label className="mb-2 block">Título</Label>
              <Input name="title" type="text" tabIndex={0} autoFocus />
            </div>
            <div className="mb-4 flex w-full gap-4">
              <div className="w-full">
                <Label className="mb-2 block">Data</Label>
                <div className="relative">
                  <input
                    type="hidden"
                    name="date"
                    value={format(value, "yyyy-MM-dd")}
                  />
                  <Input
                    value={format(value, "dd 'de' MMMM 'de' yyyy", {
                      locale: ptBR,
                    })}
                    onClick={() => {
                      setOpen(true);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "ArrowDown") {
                        setOpen(true);
                      }
                    }}
                  />
                  <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"ghost"}
                        className="absolute top-0 right-0"
                      >
                        <CalendarIcon />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent>
                      <Calendar
                        locale={ptBR}
                        mode="single"
                        selected={date}
                        captionLayout="dropdown"
                        onSelect={(date) => {
                          if (date) {
                            setDate(date);
                            setValue(date);
                          }
                          setOpen(false);
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>

            <div className="mb-4 text-right">
              <Button type="submit" onClick={() => {}}>
                Adicionar
              </Button>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
}
