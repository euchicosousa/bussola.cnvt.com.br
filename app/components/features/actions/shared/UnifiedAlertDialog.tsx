import React, { createContext, useContext, useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog";

interface AlertContent {
  title: string;
  description: string;
  confirmText: string;
  cancelText?: string;
  variant: "default" | "destructive";
  onConfirm: () => void;
}

interface AlertContextType {
  showAlert: (content: AlertContent) => void;
  showWarning: (message: string) => void;
  confirmDelete: (onConfirm: () => void) => void;
}

const AlertContext = createContext<AlertContextType | null>(null);

export const useAlert = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error("useAlert must be used within AlertProvider");
  }
  return context;
};

export function AlertProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [alertContent, setAlertContent] = useState<AlertContent | null>(null);

  const showAlert = (content: AlertContent) => {
    setAlertContent(content);
    setIsOpen(true);
  };

  const showWarning = (message: string) => {
    showAlert({
      title: "Atenção",
      description: message,
      confirmText: "OK",
      variant: "default",
      onConfirm: () => setIsOpen(false),
    });
  };

  const confirmDelete = (onConfirm: () => void) => {
    showAlert({
      title: "Excluir ação",
      description: "Deseja mesmo excluir essa ação?",
      confirmText: "Arquivar",
      cancelText: "Cancelar",
      variant: "destructive",
      onConfirm,
    });
  };

  const handleConfirm = () => {
    if (alertContent) {
      alertContent.onConfirm();
      setIsOpen(false);
    }
  };

  return (
    <AlertContext.Provider value={{ showAlert, showWarning, confirmDelete }}>
      {children}
      
      <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{alertContent?.title}</AlertDialogTitle>
            <AlertDialogDescription>{alertContent?.description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{alertContent?.cancelText || "Cancelar"}</AlertDialogCancel>
            <AlertDialogAction
              variant={alertContent?.variant}
              onClick={handleConfirm}
            >
              {alertContent?.confirmText}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AlertContext.Provider>
  );
}