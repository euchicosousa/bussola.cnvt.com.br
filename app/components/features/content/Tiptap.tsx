import { SimpleEditor } from "~/integrations/tiptap/templates/simple/simple-editor";

import React from "react";

export default function Tiptap({
  content,
  onBlur,
  onChange,
  editorRef,
}: {
  content: string | undefined | null;
  onBlur: (text: string | null) => void;
  onChange?: (text: string | null) => void;
  editorRef?: React.MutableRefObject<any>;
}) {
  return (
    <div className="flex h-full w-full overflow-hidden border">
      <SimpleEditor onBlur={onBlur} onChange={onChange} content={content} editorRef={editorRef} />
    </div>
  );
}
