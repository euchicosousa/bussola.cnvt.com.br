import { format, parseISO } from "date-fns";
import { EditIcon, Grid3x3Icon, SaveIcon, TextIcon, XIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useSubmit } from "react-router";
import { Button } from "~/components/ui/button";
import { INTENTS, TIMES } from "~/lib/constants";
import { actionToRawAction, isInstagramFeed, Post } from "~/lib/helpers";
import { Description, Header, Title } from "~/routes/dashboard.action.id.slug";
import { validateAndAdjustActionDates } from "~/shared/utils/validation/dateValidation";
import { CategoryDropdown, DateTimeAndInstagramDate } from "./CreateAction";

export default function EditAction({
  action,
  partner,
  setClose,
}: {
  action: Action;
  partner: Partner;
  setClose: () => void;
}) {
  const [mode, setMode] = useState<"context" | "instagram">("context");
  const [editingAction, setEditingAction] = useState(action);
  const submit = useSubmit();
  const navigate = useNavigate();
  const editorRef = useRef<any>(null);

  async function handleSave(editingAction: Action) {
    const data = { ...editingAction };

    await submit(
      {
        ...data,
        intent: INTENTS.updateAction,
        updated_at: format(new Date(), "yyyy-MM-dd HH:mm:ss"),
      },
      {
        action: "/handle-actions",
        method: "post",
        navigate: false,
      },
    );
  }

  useEffect(() => {
    if (action.id !== editingAction.id) setEditingAction(action);
  }, [action]);

  return (
    <div
      className={`relative flex w-full flex-col overflow-hidden border-l ${mode === "instagram" ? "max-w-96" : "3xl:max-w-[720px] min-w-96 xl:max-w-[480px]"}`}
      id="edit-action"
    >
      {/* header */}
      <div className="flex items-center justify-between">
        <h3 className="w-full border-b px-4 py-3.5 text-xl font-medium tracking-tighter">
          Editar Ação
        </h3>

        <div className="flex items-center">
          {isInstagramFeed(action.category) && (
            <>
              <div
                className={`${
                  mode === "context"
                    ? "bg-card text-foreground border-l border-b-transparent"
                    : "hover:text-foreground text-muted"
                } grid place-content-center border-b px-8 py-5 transition-colors`}
                onClick={() => setMode("context")}
              >
                <TextIcon className="size-4" />
              </div>
              <div
                className={`${
                  mode === "instagram"
                    ? "bg-card border-b-transparent"
                    : "hover:text-foreground text-muted"
                } border-b border-l px-8 py-5 transition-colors duration-200 ease-in-out`}
                onClick={() => setMode("instagram")}
              >
                <Grid3x3Icon className="size-4" />
              </div>
            </>
          )}
          <div className="grid h-14 place-content-center border-b pr-4">
            <Button
              size={"icon"}
              variant={"ghost"}
              onClick={() => {
                setClose();
              }}
            >
              <XIcon />
            </Button>
          </div>
        </div>
      </div>

      <div className="bg-card flex h-full flex-col overflow-hidden py-4">
        {mode === "context" ? (
          <div className="flex h-full flex-col overflow-hidden px-4">
            <Header action={editingAction} partner={partner} />
            <Title
              action={editingAction}
              setAction={setEditingAction}
              partner={partner}
              isSideBar
            />

            <Description
              action={editingAction}
              setAction={setEditingAction}
              partner={partner}
              isWorking={false}
              editorRef={editorRef}
            />
          </div>
        ) : (
          <div className="scrollbars-v h-full px-4">
            <Post action={editingAction} colors={partner.colors} />
            <textarea
              placeholder="Escreva sua legenda aqui ou peça à βIA para criar no botão superior direito."
              name="instagram_caption"
              onChange={(event) =>
                setEditingAction({
                  ...editingAction,
                  instagram_caption: event.target.value,
                })
              }
              className={`mt-4 field-sizing-content min-h-screen w-full text-base font-normal outline-hidden transition lg:min-h-auto lg:text-sm ${
                isInstagramFeed(action.category)
                  ? "border-0 focus-within:ring-0"
                  : ""
              }`}
              value={
                editingAction.instagram_caption
                  ? editingAction.instagram_caption
                  : undefined
              }
            ></textarea>
          </div>
        )}

        <div className="mt-4 flex justify-between px-4">
          <div className="flex items-center gap-2">
            <CategoryDropdown
              action={actionToRawAction(editingAction)}
              setAction={(action) => {
                const timeRequired = (TIMES as any)[action.category];

                const adjustments = validateAndAdjustActionDates({
                  time: timeRequired,
                  currentDate: new Date(editingAction.date),
                  currentInstagramDate: new Date(editingAction.instagram_date),
                  currentTime: editingAction.time,
                });

                setEditingAction({
                  ...editingAction,
                  category: action.category,
                  date: adjustments.date
                    ? format(adjustments.date, "yyyy-MM-dd HH:mm:ss")
                    : editingAction.date,
                  instagram_date: adjustments.instagram_date
                    ? format(adjustments.instagram_date, "yyyy-MM-dd HH:mm:ss")
                    : editingAction.instagram_date,
                  time: adjustments.time || editingAction.time,
                });
              }}
            />
            {/*

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
                  (TIMES as any)[editingAction.category] ||
                  (TIMES as any)["post"];

                const adjustments = validateAndAdjustActionDates({
                  date,
                  instagram_date,
                  time,
                  currentDate: parseISO(editingAction.date),
                  currentInstagramDate: parseISO(editingAction.instagram_date),
                  currentTime: timeRequired,
                });

                let updates = { ...editingAction };

                // Aplicar os ajustes formatando as datas para string se necessário
                if (adjustments.date) {
                  updates.date = format(
                    adjustments.date,
                    "yyyy-MM-dd HH:mm:ss",
                  );
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

                setEditingAction(updates);
              }}
            /> */}
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant={"ghost"}
              onClick={async (e) => {
                e.preventDefault();
                e.stopPropagation();
                await handleSave(editingAction);

                navigate(
                  `/dashboard/action/${editingAction.id}/${partner.slug}`,
                );
              }}
            >
              <span>Editar</span>
              <EditIcon />
            </Button>
            <Button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();

                handleSave(editingAction);
              }}
            >
              <span>Salvar</span>
              <SaveIcon />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
