import { useRef } from "react";
import { flushSync } from "react-dom";
import { cn } from "~/lib/ui";

interface EditableTitleProps {
  title: string;
  isEditing: boolean;
  setIsEditing: (editing: boolean) => void;
  onSave: (newTitle: string) => void;
  className?: string;
  isDragging?: boolean;
}

export function EditableTitle({
  title,
  isEditing,
  setIsEditing,
  onSave,
  className = "",
  isDragging,
}: EditableTitleProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleSave = () => {
    if (
      inputRef.current?.value !== undefined &&
      inputRef.current?.value !== title
    ) {
      onSave(inputRef.current.value);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") {
      flushSync(() => {
        setIsEditing(false);
      });
      buttonRef.current?.focus();
    } else if (event.key === "Enter") {
      event.preventDefault();
      if (inputRef.current?.value !== title) {
        flushSync(() => {
          onSave(String(inputRef.current?.value));
        });
        buttonRef.current?.focus();
      }
      setIsEditing(false);
    }
  };

  const handleBlur = (event: React.FormEvent) => {
    event.preventDefault();

    handleSave();
  };

  const handleButtonClick = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (!isEditing) {
      flushSync(() => {
        setIsEditing(true);
      });

      inputRef.current?.select();
    }
  };

  return (
    <div className={className}>
      {isEditing && !isDragging ? (
        <input
          ref={inputRef}
          type="text"
          name="title"
          defaultValue={title}
          className="w-full overflow-hidden bg-transparent outline-hidden"
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
        />
      ) : (
        <button
          ref={buttonRef}
          className={cn(
            "relative w-full items-center overflow-hidden text-left text-ellipsis whitespace-nowrap outline-hidden select-none",
            !isDragging && "cursor-text",
          )}
          onClick={handleButtonClick}
        >
          <span suppressHydrationWarning>{title}</span>
        </button>
      )}
    </div>
  );
}
