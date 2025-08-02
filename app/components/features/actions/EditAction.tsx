import { EditIcon, SaveIcon, XIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Description, Header, Title } from "~/routes/dashboard.action.id.slug";
import { Button } from "~/components/ui/button";
import { useNavigate, useSubmit } from "react-router";
import { format } from "date-fns";
import { INTENTS } from "~/lib/constants";

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
    <div className="flex h-full flex-col overflow-hidden border-l">
      {/* header */}
      <div className="flex items-center justify-between">
        <h3 className="w-full px-4 py-3.5 text-xl font-medium tracking-tighter">
          Editar Ação
        </h3>
        <div className="pr-4">
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
        {/* <div className="flex">
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
        </div> */}
      </div>

      <div className="flex h-full flex-col overflow-hidden pb-4">
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
            />
          </div>
        ) : (
          <div className="scrollbars-v h-full px-4">
            Lorem ipsum, dolor sit amet consectetur adipisicing elit. Earum
            ducimus quibusdam id facilis ratione magni, quaerat nesciunt
            architecto, officia rerum voluptate saepe tempore inventore! Fugit
            itaque voluptas ducimus quam beatae.
          </div>
        )}

        <div className="mt-4 flex justify-between px-4">
          <div></div>
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
