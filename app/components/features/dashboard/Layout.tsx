import { useEffect, useState, type ReactNode } from "react";
import { useNavigate, useOutletContext } from "react-router";
import Header from "~/components/features/dashboard/Header";
import Loader from "~/components/common/feedback/Loader";
import Search from "~/components/features/content/Search";
import { Toaster } from "~/components/ui/toaster";

export default function Layout({ children }: { children: ReactNode }) {
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);

  const { isTransitioning, setTransitioning } =
    useOutletContext() as ContextType;

  useEffect(() => {
    const keyDown = (event: KeyboardEvent) => {
      if (event.shiftKey && event.code === "KeyH" && event.metaKey) {
        event.preventDefault();
        event.stopPropagation();
        setTransitioning(true);
        navigate("/dashboard");
      }
    };

    document.addEventListener("keydown", keyDown);

    return () => {
      document.removeEventListener("keydown", keyDown);
    };
  }, []);

  return (
    <div
      id="layout"
      className={`bg-background swiss relative mx-auto flex h-[100dvh] flex-col`}
    >
      <Header setOpen={setOpen} />

      {children}

      {/* </div> */}
      <div
        className={`${
          isTransitioning ? "opacity-100" : "pointer-events-none opacity-0"
        } bg-background/25 absolute inset-0 z-9999 grid place-content-center backdrop-blur-lg transition`}
      >
        <Loader />
      </div>

      <Search search={{ open, setOpen }} />
      <Toaster />
    </div>
  );
}
