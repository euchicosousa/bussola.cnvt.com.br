import React from "react";
import { AlertCircleIcon, ArchiveRestoreIcon, TrashIcon } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "~/components/ui/alert-dialog";

interface DeleteActionDialogProps {
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  onConfirm: () => void;
  actionTitle: string;
  isArchived?: boolean;
  trigger?: React.ReactNode;
  isPermanent?: boolean;
}

export function DeleteActionDialog({
  isOpen,
  onOpenChange,
  onConfirm,
  actionTitle,
  isArchived = false,
  trigger,
  isPermanent = false,
}: DeleteActionDialogProps) {
  const handleConfirm = (event?: React.MouseEvent) => {
    event?.stopPropagation();
    event?.preventDefault();
    onConfirm();
    onOpenChange?.(false);
  };

  const getContent = () => {
    if (isArchived) {
      return {
        icon: <ArchiveRestoreIcon className="size-6 text-blue-500" />,
        title: "Restaurar Ação",
        description: (
          <>
            Tem certeza que deseja restaurar a ação{" "}
            <span className="font-medium">"{actionTitle}"</span>?
            <br />
            <span className="text-sm text-muted-foreground">
              Esta ação voltará a aparecer na sua lista de ações.
            </span>
          </>
        ),
        confirmText: "Restaurar",
        confirmVariant: "default" as const,
      };
    }

    if (isPermanent) {
      return {
        icon: <AlertCircleIcon className="size-6 text-red-500" />,
        title: "Excluir Permanentemente",
        description: (
          <>
            <span className="font-semibold text-red-600 uppercase tracking-wide">
              ⚠️ ESTA AÇÃO NÃO PODE SER DESFEITA!
            </span>
            <br />
            <br />
            Tem certeza que deseja excluir permanentemente a ação{" "}
            <span className="font-medium">"{actionTitle}"</span>?
            <br />
            <br />
            <span className="text-sm text-muted-foreground">
              Todos os dados associados a esta ação serão perdidos para sempre.
            </span>
          </>
        ),
        confirmText: "Excluir Permanentemente",
        confirmVariant: "destructive" as const,
      };
    }

    return {
      icon: <TrashIcon className="size-6 text-orange-500" />,
      title: "Arquivar Ação",
      description: (
        <>
          Tem certeza que deseja arquivar a ação{" "}
          <span className="font-medium">"{actionTitle}"</span>?
          <br />
          <br />
          <span className="text-sm text-muted-foreground">
            A ação será movida para o arquivo e pode ser restaurada a qualquer momento.
          </span>
        </>
      ),
      confirmText: "Arquivar",
      confirmVariant: "destructive" as const,
    };
  };

  const content = getContent();

  const DialogContent = (
    <AlertDialogContent className="bg-content max-w-md">
      <AlertDialogHeader className="space-y-4">
        <div className="flex items-center justify-center">
          {content.icon}
        </div>
        <AlertDialogTitle className="text-center text-xl">
          {content.title}
        </AlertDialogTitle>
        <AlertDialogDescription className="text-center leading-relaxed">
          {content.description}
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter className="gap-3 pt-6">
        <AlertDialogCancel>Cancelar</AlertDialogCancel>
        <AlertDialogAction
          variant={content.confirmVariant}
          onClick={handleConfirm}
        >
          {content.confirmText}
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  );

  if (trigger) {
    return (
      <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
        <AlertDialogTrigger asChild>
          {trigger}
        </AlertDialogTrigger>
        {DialogContent}
      </AlertDialog>
    );
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      {DialogContent}
    </AlertDialog>
  );
}

// Hook para usar o dialog de forma mais conveniente
export function useDeleteActionDialog() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [pendingAction, setPendingAction] = React.useState<{
    title: string;
    onConfirm: () => void;
    isArchived?: boolean;
    isPermanent?: boolean;
  } | null>(null);

  const openDialog = (config: {
    title: string;
    onConfirm: () => void;
    isArchived?: boolean;
    isPermanent?: boolean;
  }) => {
    setPendingAction(config);
    setIsOpen(true);
  };

  const closeDialog = () => {
    setIsOpen(false);
    setPendingAction(null);
  };

  const confirmAction = () => {
    if (pendingAction) {
      pendingAction.onConfirm();
    }
    closeDialog();
  };

  const DialogComponent = pendingAction ? (
    <DeleteActionDialog
      isOpen={isOpen}
      onOpenChange={setIsOpen}
      onConfirm={confirmAction}
      actionTitle={pendingAction.title}
      isArchived={pendingAction.isArchived}
      isPermanent={pendingAction.isPermanent}
    />
  ) : null;

  return {
    openDialog,
    closeDialog,
    DialogComponent,
  };
}

