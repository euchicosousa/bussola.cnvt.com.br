import {
  closestCenter,
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
  type UniqueIdentifier,
} from "@dnd-kit/core";
import {
  arrayMove,
  rectSortingStrategy,
  SortableContext,
} from "@dnd-kit/sortable";
import { DownloadCloudIcon, Trash2Icon } from "lucide-react";
import { useId, useState } from "react";
import { createPortal } from "react-dom";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { IMAGE_SIZES } from "~/lib/constants";
import { optimizeCloudinaryUrl } from "~/lib/helpers";
import { cn } from "~/lib/ui";
import {
  getFileExtension,
  getFileName,
  isDocument,
  isImage,
  isVideo,
} from "~/shared";
import { SortableItem } from "./DraggableItem";

export function FilesPopover({
  action,
  files,
  children,
  setAction,
  saveField,
  isWorkFiles,
}: {
  action: Action;
  files: string[] | null;
  children: React.ReactNode;
  setAction: (action: Action) => void;
  saveField: (field: string, value: any) => void;
  isWorkFiles?: boolean;
}) {
  let renderContent: React.ReactNode;
  let type = isWorkFiles ? "work_files" : action.category;

  let [currentFiles, setCurrentFiles] = useState(
    files?.map((file) => ({ id: useId(), file })) || [],
  );

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
  );

  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    const { over, active } = event;

    if (!over) return;

    if (over.id !== active.id) {
      const oldIndex = currentFiles.findIndex((item) => item.id === active.id);
      const newIndex = currentFiles.findIndex((item) => item.id === over.id);
      const sortedFiles = arrayMove(currentFiles, oldIndex, newIndex);
      const sortedFilesUrls = sortedFiles.map((file) => file.file);

      setCurrentFiles(sortedFiles);
      if (isWorkFiles) {
        setAction({
          ...action,
          work_files: sortedFilesUrls,
        });
        saveField("work_files", sortedFilesUrls);
      } else {
        setAction({
          ...action,
          content_files: sortedFilesUrls,
        });
        saveField("content_files", sortedFilesUrls);
      }
    }
  };

  const handleDragCancel = () => {
    setActiveId(null);
  };

  switch (type) {
    case "post":
      renderContent = (
        <FilePopoverItem
          file={files![0]}
          onDelete={() => {
            setAction({
              ...action,
              content_files: null,
            });
            saveField("content_files", null);
          }}
        />
      );

      break;
    case "reels":
      renderContent = (
        <div className="grid grid-cols-2 gap-4">
          {files && files[0] ? (
            <FilePopoverItem
              title="Vídeo"
              file={files[0]}
              onDelete={() => {
                const updatedFiles = ["", files[1]];
                setAction({
                  ...action,
                  content_files: updatedFiles,
                });
                saveField("content_files", updatedFiles);
              }}
            />
          ) : (
            <div className="bg-accent grid h-full min-h-[180px] w-full place-content-center rounded-[10px] border border-dashed p-4 text-lg font-bold">
              Vídeo
            </div>
          )}
          {files && files[1] ? (
            <FilePopoverItem
              title="Capa"
              file={files[1]}
              onDelete={() => {
                const updatedFiles = [files[0], ""];
                setAction({
                  ...action,
                  content_files: updatedFiles,
                });
                saveField("content_files", updatedFiles);
              }}
            />
          ) : (
            <div className="bg-accent grid h-full min-h-[180px] w-full place-content-center rounded-[10px] border border-dashed p-4 text-lg font-bold">
              Capa
            </div>
          )}
        </div>
      );
      break;
    case "carousel":
    case "stories":
    default:
      renderContent = (
        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragCancel={handleDragCancel}
          collisionDetection={closestCenter}
        >
          <SortableContext
            items={currentFiles.map((file) => file.id)}
            strategy={rectSortingStrategy}
          >
            <div
              className={cn(
                "grid gap-y-4",
                type === "carousel" ? "gap-x-[1px]" : "gap-2",
                currentFiles && currentFiles.length > 8
                  ? "grid-cols-5"
                  : "grid-cols-4",
              )}
            >
              {currentFiles?.map((file, i) => (
                <SortableItem id={file.id} key={file.id}>
                  <FilePopoverItem
                    type={type}
                    file={file.file}
                    onDelete={() => {
                      const updatedFiles = currentFiles
                        .filter((_, index) => index !== i)
                        .map((file) => file.file);
                      if (isWorkFiles) {
                        setAction({
                          ...action,
                          work_files: updatedFiles,
                        });
                        saveField("work_files", updatedFiles);
                      } else {
                        setAction({
                          ...action,
                          content_files: updatedFiles,
                        });
                        saveField("content_files", updatedFiles);
                      }
                    }}
                  />
                </SortableItem>
              ))}
            </div>
          </SortableContext>
          {createPortal(
            <DragOverlay
              adjustScale
              dropAnimation={{ duration: 150, easing: "ease-in-out" }}
            >
              {activeId && currentFiles ? (
                <FilePopoverItem
                  type={type}
                  file={currentFiles.find((file) => file.id === activeId)!.file}
                  onDelete={() => {}}
                />
              ) : null}
            </DragOverlay>,
            document.body,
          )}
        </DndContext>
      );
      break;
  }

  return (
    <Popover>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent
        className={cn(
          "bg-content mx-4 flex max-h-[70vh] max-w-[70vw] flex-col overflow-hidden",
          type === "post"
            ? "lg:w-xs"
            : type === "reels"
              ? "lg:w-sm"
              : "lg:w-2xl",
        )}
      >
        <div className="shrink-0 pb-2 text-2xl font-medium">Arquivos</div>
        <div className="scrollbars-v h-full w-full grow">{renderContent}</div>
      </PopoverContent>
    </Popover>
  );
}

export function FilePopoverItem({
  title,
  file,
  type,
  onDelete,
}: {
  title?: string;
  file: string;
  type?: string;
  onDelete: () => void;
}) {
  const filename = getFileName(file, true);

  return (
    <div className="group/file flex w-full flex-col items-center gap-2 overflow-hidden">
      {title ? (
        <div className="text-xl font-medium">{title}</div>
      ) : (
        <div className="flex w-full overflow-hidden px-1 text-xs">
          <div className="overflow-hidden text-ellipsis whitespace-nowrap">
            {filename}
          </div>
          <div>{getFileExtension(file)}</div>
        </div>
      )}
      <div className="relative w-full transition-opacity group-hover/file:opacity-75">
        <div
          className={cn(
            "overflow-hidden",
            type !== "carousel" ? "rounded-[10px]" : "",
          )}
        >
          {isImage(file) && (
            <img
              src={optimizeCloudinaryUrl(file, IMAGE_SIZES.PREVIEW)}
              alt={title}
            />
          )}
          {isVideo(file) && <video src={file} controls />}
          {isDocument(file) && (
            <div className="bg-accent col-span-1 grid min-h-[180px] w-full place-content-center rounded-[10px] border p-4 text-2xl font-bold uppercase">
              {getFileExtension(file)}
            </div>
          )}
        </div>
        <div className="absolute top-1 right-1">
          <button
            className="rounded-sm p-2 text-white hover:bg-black/25"
            onClick={() =>
              window.open(
                optimizeCloudinaryUrl(file, IMAGE_SIZES.FULL),
                "_blank",
              )
            }
          >
            <DownloadCloudIcon className="size-4 drop-shadow-sm drop-shadow-black/50" />
          </button>
          <button
            className="rounded-sm p-2 text-white hover:bg-black/25"
            onClick={onDelete}
          >
            <Trash2Icon className="size-4 drop-shadow-sm drop-shadow-black/50" />
          </button>
        </div>
      </div>
    </div>
  );
}
