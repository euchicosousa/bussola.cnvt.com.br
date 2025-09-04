import { SimpleEditor } from "~/integrations/tiptap/templates/simple/simple-editor";

export default function Tiptap({
  content,
  onBlur,
}: {
  content: string | undefined | null;
  onBlur: (text: string | null) => void;
}) {
  return (
    <div className="flex h-full w-full overflow-hidden border">
      <SimpleEditor onBlur={onBlur} content={content} />
    </div>
  );
}
