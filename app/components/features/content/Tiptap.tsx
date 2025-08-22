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

// import Highlight from "@tiptap/extension-highlight";
// import Subscript from "@tiptap/extension-subscript";
// import Superscrit from "@tiptap/extension-superscript";

// import { EditorProvider, useCurrentEditor, type Content } from "@tiptap/react";
// import StarterKit from "@tiptap/starter-kit";
// import {
//   BoldIcon,
//   EraserIcon,
//   Heading1Icon,
//   Heading2Icon,
//   Heading3Icon,
//   HighlighterIcon,
//   ItalicIcon,
//   ListIcon,
//   StrikethroughIcon,
//   SubscriptIcon,
//   SuperscriptIcon,
// } from "lucide-react";
// import { useEffect } from "react";
// import { Button } from "~/components/ui/button";

// export default function Tiptap({
//   content,
//   onChange,
// }: {
//   content: Content;
//   onChange: (text: string) => void;
// }) {
//   const extensions = [
//     StarterKit,
//     Highlight,
//     // BulletList,
//     Superscrit,
//     Subscript,
//     // Blockquote,

//   ];

//   return (
//     <div className="editor-tiptap bg-input overflow-hidden rounded border pt-4 pl-4">
//       <EditorProvider
//         immediatelyRender={false}
//         onChange={({ editor }) => onChange(editor.getHTML())}
//         extensions={extensions}
//         content={content}
//         editorContainerProps={{
//           className: "scrollbars-v pt-4",
//         }}
//         slotBefore={<Menu type={1} />}
//       >
//         <SetContent content={content} />
//         {/* <FloatingMenu
//           editor={null}
//           className="bg-background ml-4 rounded border p-1"
//         >
//           <Menu type={2} />
//         </FloatingMenu> */}
//         {/* <BubbleMenu editor={null} className="bg-content rounded-lg p-1">
// 					<Menu type={3} />
// 				</BubbleMenu> */}
//       </EditorProvider>
//     </div>
//   );
// }

// const SetContent = ({ content }: { content: Content }) => {
//   const { editor } = useCurrentEditor();

//   if (!editor) return null;

//   useEffect(() => {
//     editor?.commands.setContent(content);
//   }, [content]);

//   return <div></div>;
// };

// // 1 - fixo
// // 2 - Floating
// // 3 - Bubble
// export const Menu = ({ type }: { type: 1 | 2 | 3 }) => {
//   const { editor } = useCurrentEditor();

//   return (
//     <div
//       className={`flex gap-6 overflow-x-auto ${
//         type === 1 ? "-mt-2 -ml-4 border-b pb-2 pl-2" : ""
//       }`}
//     >
//       {/* Formating */}
//       {type !== 2 && (
//         <>
//           <div className="flex">
//             <Button
//               title="Negrito"
//               variant={editor?.isActive("bold") ? "secondary" : "ghost"}
//               onClick={() => editor?.chain().focus().toggleBold().run()}
//               className="grid size-8 place-content-center rounded p-0"
//             >
//               <BoldIcon />
//             </Button>
//             <Button
//               title="Itálico"
//               className="grid size-8 place-content-center rounded p-0"
//               variant={editor?.isActive("italic") ? "secondary" : "ghost"}
//               onClick={() => editor?.chain().focus().toggleItalic().run()}
//             >
//               <ItalicIcon />
//             </Button>
//             <Button
//               title="Taxado"
//               className="grid size-8 place-content-center rounded p-0"
//               variant={editor?.isActive("strike") ? "secondary" : "ghost"}
//               onClick={() => editor?.chain().focus().toggleStrike().run()}
//             >
//               <StrikethroughIcon />
//             </Button>
//           </div>

//           {/* Hightlight and Clean */}
//           <div className="flex">
//             <Button
//               title="Destacar texto"
//               className="grid size-8 place-content-center rounded p-0"
//               variant={editor?.isActive("highlight") ? "default" : "ghost"}
//               onClick={() => editor?.chain().focus().toggleHighlight().run()}
//             >
//               <HighlighterIcon />
//             </Button>
//             <Button
//               className="grid size-8 place-content-center rounded p-0"
//               variant={"ghost"}
//               onClick={() => editor?.commands.unsetAllMarks()}
//               title="Limpar Formatação"
//             >
//               <EraserIcon />
//             </Button>
//           </div>
//         </>
//       )}
//       {/* Headings */}
//       {type !== 3 && (
//         <div className="flex">
//           <Button
//             title="Cabeçalho 1"
//             className="grid size-8 place-content-center rounded p-0"
//             variant={
//               editor?.isActive("heading", { level: 1 }) ? "default" : "ghost"
//             }
//             onClick={() =>
//               editor?.chain().focus().toggleHeading({ level: 1 }).run()
//             }
//           >
//             <Heading1Icon />
//           </Button>
//           <Button
//             title="Cabeçalho 2"
//             className="grid size-8 place-content-center rounded p-0"
//             variant={
//               editor?.isActive("heading", { level: 2 }) ? "default" : "ghost"
//             }
//             onClick={() =>
//               editor?.chain().focus().toggleHeading({ level: 2 }).run()
//             }
//           >
//             <Heading2Icon />
//           </Button>
//           <Button
//             title="Cabeçalho 3"
//             className="grid size-8 place-content-center rounded p-0"
//             variant={
//               editor?.isActive("heading", { level: 3 }) ? "default" : "ghost"
//             }
//             onClick={() =>
//               editor?.chain().focus().toggleHeading({ level: 3 }).run()
//             }
//           >
//             <Heading3Icon />
//           </Button>
//         </div>
//       )}
//       {/* Outros */}
//       <div className="flex">
//         {type !== 3 && (
//           <Button
//             title="Lista"
//             className="grid size-8 place-content-center rounded p-0"
//             variant={"ghost"}
//             onClick={() => editor?.commands.toggleBulletList()}
//           >
//             <ListIcon />
//           </Button>
//         )}

//         {type !== 2 && (
//           <>
//             <Button
//               title="Subscrito"
//               className="grid size-8 place-content-center rounded p-0"
//               variant={editor?.isActive("subscript") ? "default" : "ghost"}
//               onClick={() => editor?.chain().focus().toggleSubscript().run()}
//             >
//               <SubscriptIcon />
//             </Button>
//             <Button
//               title="Superscrito"
//               className="grid size-8 place-content-center rounded p-0"
//               variant={editor?.isActive("superscript") ? "default" : "ghost"}
//               onClick={() => editor?.chain().focus().toggleSuperscript().run()}
//             >
//               <SuperscriptIcon />
//             </Button>
//           </>
//         )}
//       </div>
//     </div>
//   );
// };
