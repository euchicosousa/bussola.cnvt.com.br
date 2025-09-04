import { EditorContent, EditorContext, useEditor } from "@tiptap/react";
import * as React from "react";

// --- Tiptap Core Extensions ---
import { Highlight } from "@tiptap/extension-highlight";
import { Image } from "@tiptap/extension-image";
import { TaskItem, TaskList } from "@tiptap/extension-list";
import { Subscript } from "@tiptap/extension-subscript";
import { Superscript } from "@tiptap/extension-superscript";
import { TextAlign } from "@tiptap/extension-text-align";
import { Typography } from "@tiptap/extension-typography";
import { Selection } from "@tiptap/extensions";
import { StarterKit } from "@tiptap/starter-kit";

// --- UI Primitives ---
import { Button } from "~/integrations/tiptap/primitives/button";
import { Spacer } from "~/integrations/tiptap/primitives/spacer";
import {
  Toolbar,
  ToolbarGroup,
  ToolbarSeparator,
} from "~/integrations/tiptap/primitives/toolbar";

// --- Tiptap Node ---
import "~/integrations/tiptap/nodes/tiptap-node/blockquote-node/blockquote-node.scss";
import "~/integrations/tiptap/nodes/tiptap-node/code-block-node/code-block-node.scss";
import "~/integrations/tiptap/nodes/tiptap-node/heading-node/heading-node.scss";
import { HorizontalRule } from "~/integrations/tiptap/nodes/tiptap-node/horizontal-rule-node/horizontal-rule-node-extension";
import "~/integrations/tiptap/nodes/tiptap-node/horizontal-rule-node/horizontal-rule-node.scss";
import "~/integrations/tiptap/nodes/tiptap-node/image-node/image-node.scss";
import { ImageUploadNode } from "~/integrations/tiptap/nodes/tiptap-node/image-upload-node/image-upload-node-extension";
import "~/integrations/tiptap/nodes/tiptap-node/list-node/list-node.scss";
import "~/integrations/tiptap/nodes/tiptap-node/paragraph-node/paragraph-node.scss";

// --- Tiptap UI ---
import { BlockquoteButton } from "~/integrations/tiptap/ui/blockquote-button";
import { CodeBlockButton } from "~/integrations/tiptap/ui/code-block-button";
import {
  ColorHighlightPopover,
  ColorHighlightPopoverButton,
  ColorHighlightPopoverContent,
} from "~/integrations/tiptap/ui/color-highlight-popover";
import { HeadingDropdownMenu } from "~/integrations/tiptap/ui/heading-dropdown-menu";
import { ImageUploadButton } from "~/integrations/tiptap/ui/image-upload-button";
import {
  LinkButton,
  LinkContent,
  LinkPopover,
} from "~/integrations/tiptap/ui/link-popover";
import { ListDropdownMenu } from "~/integrations/tiptap/ui/list-dropdown-menu";
import { MarkButton } from "~/integrations/tiptap/ui/mark-button";
import { TextAlignButton } from "~/integrations/tiptap/ui/text-align-button";
import { UndoRedoButton } from "~/integrations/tiptap/ui/undo-redo-button";

// --- Icons ---
import { ArrowLeftIcon } from "~/integrations/tiptap/icons/arrow-left-icon";
import { HighlighterIcon } from "~/integrations/tiptap/icons/highlighter-icon";
import { LinkIcon } from "~/integrations/tiptap/icons/link-icon";

// --- Hooks ---
import { useCursorVisibility } from "~/hooks/use-cursor-visibility";
import { useMobile } from "~/shared/hooks/ui/useMobile";
import { useScrolling } from "~/hooks/use-scrolling";
import { useWindowSize } from "~/hooks/use-window-size";

// --- Components ---
import { ThemeToggle } from "~/integrations/tiptap/templates/simple/theme-toggle";

// --- Lib ---
import { handleImageUpload, MAX_FILE_SIZE } from "~/lib/tiptap-utils";

// --- Styles ---
import "~/integrations/tiptap/templates/simple/simple-editor.scss";
import { useEffect } from "react";

// import content from "~/integrations/tiptap/templates/simple/data/content.json";

const MainToolbarContent = ({
  onHighlighterClick,
  onLinkClick,
  isMobile,
}: {
  onHighlighterClick: () => void;
  onLinkClick: () => void;
  isMobile: boolean;
}) => {
  return (
    <>
      {/* <Spacer /> */}

      <ToolbarGroup>
        <UndoRedoButton action="undo" />
        <UndoRedoButton action="redo" />
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <HeadingDropdownMenu levels={[1, 2, 3, 4]} portal={isMobile} />
        <ListDropdownMenu
          types={["bulletList", "orderedList", "taskList"]}
          portal={isMobile}
        />
        <BlockquoteButton />
        <CodeBlockButton />
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <MarkButton type="bold" />
        <MarkButton type="italic" />
        <MarkButton type="strike" />
        <MarkButton type="code" />
        <MarkButton type="underline" />
        {!isMobile ? (
          <ColorHighlightPopover />
        ) : (
          <ColorHighlightPopoverButton onClick={onHighlighterClick} />
        )}
        {!isMobile ? <LinkPopover /> : <LinkButton onClick={onLinkClick} />}
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <MarkButton type="superscript" />
        <MarkButton type="subscript" />
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <TextAlignButton align="left" />
        <TextAlignButton align="center" />
        <TextAlignButton align="right" />
        <TextAlignButton align="justify" />
      </ToolbarGroup>

      <ToolbarSeparator />

      {/* <ToolbarGroup>
        <ImageUploadButton text="Add" />
      </ToolbarGroup> */}

      {/* <Spacer /> */}

      {isMobile && <ToolbarSeparator />}

      {/* <ToolbarGroup>
        <ThemeToggle />
      </ToolbarGroup> */}
    </>
  );
};

const MobileToolbarContent = ({
  type,
  onBack,
}: {
  type: "highlighter" | "link";
  onBack: () => void;
}) => (
  <>
    <ToolbarGroup>
      <Button data-style="ghost" onClick={onBack}>
        <ArrowLeftIcon className="tiptap-button-icon" />
        {type === "highlighter" ? (
          <HighlighterIcon className="tiptap-button-icon" />
        ) : (
          <LinkIcon className="tiptap-button-icon" />
        )}
      </Button>
    </ToolbarGroup>

    <ToolbarSeparator />

    {type === "highlighter" ? (
      <ColorHighlightPopoverContent />
    ) : (
      <LinkContent />
    )}
  </>
);

export function SimpleEditor({
  content,
  onBlur,
}: {
  content: string | undefined | null;
  onBlur: (text: string) => void;
}) {
  const isMobile = useMobile();
  const windowSize = useWindowSize();
  const [mobileView, setMobileView] = React.useState<
    "main" | "highlighter" | "link"
  >("main");
  const toolbarRef = React.useRef<HTMLDivElement>(null);

  const editor = useEditor({
    immediatelyRender: false,
    shouldRerenderOnTransaction: false,
    editorProps: {
      attributes: {
        autocomplete: "off",
        autocorrect: "off",
        autocapitalize: "off",
        "aria-label": "Main content area, start typing to enter text.",
        class: "simple-editor",
      },
    },
    extensions: [
      StarterKit.configure({
        horizontalRule: false,
        link: {
          openOnClick: false,
          enableClickSelection: true,
        },
      }),
      HorizontalRule,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Highlight.configure({ multicolor: true }),
      Image,
      Typography,
      Superscript,
      Subscript,
      Selection,
      // ImageUploadNode.configure({
      //   accept: "image/*",
      //   maxSize: MAX_FILE_SIZE,
      //   limit: 3,
      //   upload: handleImageUpload,
      //   onError: (error) => console.error("Upload failed:", error),
      // }),
    ],
    content,
    onBlur: ({ editor }) => {
      onBlur(editor.getHTML());
    },
  });

  useEffect(() => {
    if (editor) editor.commands.setContent(content ?? "");
  }, [content]);

  const isScrolling = useScrolling();
  const rect = useCursorVisibility({
    editor,
    overlayHeight: toolbarRef.current?.getBoundingClientRect().height ?? 0,
  });

  React.useEffect(() => {
    if (!isMobile && mobileView !== "main") {
      setMobileView("main");
    }
  }, [isMobile, mobileView]);

  // const editorState = useEditorState({
  //   editor,
  //   selector: ({ editor }) => {
  //     if (!editor) return null;
  //     onBlur(editor.getHTML());
  //   },
  // });

  return (
    <div className="simple-editor-wrapper w-full overflow-hidden">
      <EditorContext.Provider value={{ editor }}>
        <Toolbar
          ref={toolbarRef}
          style={{
            ...(isScrolling && isMobile
              ? { opacity: 0, transition: "opacity 0.1s ease-in-out" }
              : {}),
            ...(isMobile
              ? {
                  bottom: `calc(100% - ${windowSize.height - rect.y}px)`,
                }
              : {}),
          }}
          className="w-full"
        >
          {mobileView === "main" ? (
            <MainToolbarContent
              onHighlighterClick={() => setMobileView("highlighter")}
              onLinkClick={() => setMobileView("link")}
              isMobile={isMobile}
            />
          ) : (
            <MobileToolbarContent
              type={mobileView === "highlighter" ? "highlighter" : "link"}
              onBack={() => setMobileView("main")}
            />
          )}
        </Toolbar>

        <EditorContent
          editor={editor}
          role="presentation"
          className="simple-editor-content overflow-auto"
        />
      </EditorContext.Provider>
    </div>
  );
}
