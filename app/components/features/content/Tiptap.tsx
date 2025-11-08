import { SimpleEditor } from "~/integrations/tiptap/templates/simple/simple-editor";

import React from "react";

export default function Tiptap({
  content,
  onBlur,
  editorRef,
}: {
  content: string | undefined | null;
  onBlur: (text: string | null) => void;
  editorRef?: React.RefObject<any>;
}) {
  return (
    <div className="flex h-full w-full overflow-hidden border">
      <SimpleEditor onBlur={onBlur} content={content} editorRef={editorRef} />
    </div>
  );
}
