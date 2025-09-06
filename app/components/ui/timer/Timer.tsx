import { TimerIcon, TimerOffIcon, ChevronsUpDownIcon, PlayIcon, PauseIcon } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { useTimer, type UseTimerProps } from "./useTimer";
import { cn } from "~/lib/ui";

interface TimerProps extends Omit<UseTimerProps, 'initialTime'> {
  defaultTime: number; // em minutos
  presetTimes?: number[]; // em minutos
  className?: string;
  showPresets?: boolean;
  showPauseResume?: boolean;
  size?: "sm" | "md" | "lg";
  enableSounds?: boolean;
}

export function Timer({
  defaultTime,
  presetTimes = [5, 10, 20, 40],
  className,
  showPresets = true,
  showPauseResume = true,
  size = "md",
  enableSounds = true,
  onComplete,
  onTick,
  onStart,
  updateDocumentTitle = true,
  titlePrefix,
}: TimerProps) {
  const timer = useTimer({
    initialTime: defaultTime * 60,
    onComplete,
    onTick,
    onStart,
    updateDocumentTitle,
    titlePrefix,
    enableSounds,
  });

  const formatTimer = (time: number) => {
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = time % 60;

    return (time >= 3600 ? `${String(hours).padStart(2, "0")}:` : "").concat(
      `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`,
    );
  };

  const sizeClasses = {
    sm: {
      button: "size-8",
      icon: "size-4",
      text: "text-lg",
      gap: "gap-1",
      px: "px-1",
    },
    md: {
      button: "size-10",
      icon: "size-5",
      text: "text-2xl",
      gap: "gap-2",
      px: "px-2",
    },
    lg: {
      button: "size-12",
      icon: "size-6",
      text: "text-3xl",
      gap: "gap-3",
      px: "px-3",
    },
  }[size];

  const handleMainButtonClick = () => {
    if (timer.isRunning || timer.isPaused) {
      // Se está rodando ou pausado, para/cancela completamente
      timer.stop();
    } else {
      // Se está parado, inicia
      timer.start();
    }
  };

  const getMainButtonVariant = () => {
    if (timer.isRunning || timer.isPaused) return "destructive";
    return "ghost";
  };

  const getMainButtonIcon = () => {
    if (timer.isRunning || timer.isPaused) return <TimerOffIcon className={sizeClasses.icon} />;
    return <TimerIcon className={sizeClasses.icon} />;
  };

  return (
    <div className={cn("flex items-center", sizeClasses.gap, className)}>
      {/* Botão principal */}
      <Button
        size="icon"
        variant={getMainButtonVariant()}
        onClick={handleMainButtonClick}
        className={sizeClasses.button}
        title={
          timer.isRunning || timer.isPaused 
            ? "Parar/Cancelar timer" 
            : "Iniciar timer"
        }
      >
        {getMainButtonIcon()}
      </Button>

      {/* Botão de pausa/resume separado (opcional) */}
      {showPauseResume && (timer.isRunning || timer.isPaused) && (
        <Button
          size="icon"
          variant={timer.isPaused ? "secondary" : "ghost"}
          onClick={timer.isRunning ? timer.pause : timer.resume}
          className={sizeClasses.button}
          title={timer.isRunning ? "Pausar timer" : "Continuar timer"}
        >
          {timer.isRunning ? (
            <PauseIcon className={sizeClasses.icon} />
          ) : (
            <PlayIcon className={sizeClasses.icon} />
          )}
        </Button>
      )}

      {/* Dropdown com presets */}
      {showPresets && (
        <DropdownMenu>
          <DropdownMenuTrigger className="focus:outline-none">
            <ChevronsUpDownIcon className={sizeClasses.icon} />
          </DropdownMenuTrigger>
          <DropdownMenuPortal>
            <DropdownMenuContent className="bg-content">
              <DropdownMenuItem
                onClick={() => timer.start(defaultTime * 60)}
                className="bg-item"
              >
                {defaultTime} minutos (padrão)
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {presetTimes.map((time) => (
                <DropdownMenuItem
                  key={time}
                  onClick={() => timer.start(time * 60)}
                  className="bg-item"
                >
                  {time} minutos
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenuPortal>
        </DropdownMenu>
      )}

      {/* Display do tempo */}
      <div 
        className={cn(
          "font-medium tabular-nums", 
          sizeClasses.text, 
          sizeClasses.px,
          timer.remainingTime <= 60 && timer.isRunning && "text-destructive animate-pulse"
        )}
      >
        {formatTimer(
          timer.remainingTime > 0 ? timer.remainingTime : defaultTime * 60
        )}
      </div>

      {/* Indicador visual quando pausado */}
      {timer.isPaused && (
        <div className="animate-pulse text-yellow-500 text-xs font-bold">
          PAUSADO
        </div>
      )}
    </div>
  );
}

export { useTimer } from "./useTimer";
export type { UseTimerProps, UseTimerReturn } from "./useTimer";