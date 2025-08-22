import * as React from "react";

interface TiptapIconProps extends React.SVGProps<SVGSVGElement> {
  name: string;
  className?: string;
}

// Icon paths data - consolidated from individual icon files
const iconPaths: Record<string, string> = {
  "align-center": "M7 3a1 1 0 000 2h10a1 1 0 100-2H7zM4 7a1 1 0 011-1h14a1 1 0 110 2H5a1 1 0 01-1-1zm3 4a1 1 0 100 2h8a1 1 0 100-2H7zm-3 4a1 1 0 011-1h14a1 1 0 110 2H5a1 1 0 01-1-1z",
  "align-justify": "M3 5a1 1 0 011-1h16a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h16a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h16a1 1 0 110 2H4a1 1 0 01-1-1zM3 20a1 1 0 011-1h16a1 1 0 110 2H4a1 1 0 01-1-1z",
  "align-left": "M3 3a1 1 0 000 2h11a1 1 0 100-2H3zM3 7a1 1 0 000 2h7a1 1 0 100-2H3zm0 4a1 1 0 100 2h11a1 1 0 100-2H3zm0 4a1 1 0 100 2h7a1 1 0 100-2H3z",
  "align-right": "M10 3a1 1 0 100 2h11a1 1 0 100-2H10zM14 7a1 1 0 100 2h7a1 1 0 100-2h-7zm-4 4a1 1 0 100 2h11a1 1 0 100-2H10zm4 4a1 1 0 100 2h7a1 1 0 100-2h-7z",
  "arrow-left": "M19 12H6m0 0l7-7m-7 7l7 7",
  "ban": "M18.364 5.636L5.636 18.364m12.728-12.728A9 9 0 105.636 18.364m12.728-12.728zm0 0a9 9 0 11-12.728 12.728",
  "blockquote": "M10 3H3v7h7V3zM21 3h-7v7h7V3zM10 14H3v7h7v-7zM21 14h-7v7h7v-7z",
  "bold": "M6 4h8a4 4 0 014 4 4 4 0 01-4 4H6V4zM6 12h9a4 4 0 014 4 4 4 0 01-4 4H6v-8z",
  "chevron-down": "m6 9 6 6 6-6",
  "close": "M18 6L6 18M6 6l12 12",
  "code-block": "M13.5 3H12H8C6.34315 3 5 4.34315 5 6V18C5 19.6569 6.34315 21 8 21H12H13.5H16C17.6569 21 19 19.6569 19 18V9.5L13.5 3Z",
  "code2": "m18 16 4-4-4-4M6 8l-4 4 4 4m8.5-12L10.5 20",
  "corner-down-left": "m14 15-6-6m0 0V4m0 5h5",
  "external-link": "M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3",
  "heading": "M6 12h12M6 20V4M18 20V4",
  "heading-one": "M6 12h12M6 20V4M18 20V4m-7-8v8",
  "heading-two": "M6 12h12M6 20V4M18 20V4m-5-4h4l-4 8h4",
  "heading-three": "M6 12h12M6 20V4M18 20V4m-3-4h2a2 2 0 012 2v0a2 2 0 01-2 2h-2m2 0h2a2 2 0 012 2v0a2 2 0 01-2 2h-4",
  "heading-four": "M6 12h12M6 20V4M18 20V4m1-8h-4l4-4v8",
  "heading-five": "M6 12h12M6 20V4M18 20V4m1-8h-4v-4h4",
  "heading-six": "M6 12h12M6 20V4M18 20V4m1-4a2 2 0 00-2-2h-2v8h2a2 2 0 002-2v-4z",
  "highlighter": "M9 11H3l3-3 2.5 2.5zM12 2l3 3-7 7-3-3 7-7z",
  "image-plus": "M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h7M16 3h6v6M21 3l-8.5 8.5-2.5-2.5",
  "italic": "M19 4h-9M14 20H5M15 4L9 20",
  "link": "M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71",
  "list": "M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01",
  "list-ordered": "M7 8h13M7 16h13M1 4h2l2 4H3l2 4H3M1 12h4",
  "list-todo": "M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01",
  "moon-star": "M12 3a6 6 0 009 9 9 9 0 11-9-9zM19 3v4M21 5h-4",
  "redo2": "M18 9v-4l4 4-4 4V9M6 9a6 6 0 016-6h6",
  "strike": "M6 16a6 6 0 1012 0M8 6a8 8 0 018 0M6 12h12",
  "subscript": "M4 5h8M9 14h7m-7 4h7M18 21l2-2-2-2",
  "sun": "M12 8a4 4 0 100 8 4 4 0 000-8zM12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41",
  "superscript": "M4 19h8M9 10h7m-7-4h7M18 3l2 2-2 2",
  "trash": "M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6M10 11v6M14 11v6",
  "underline": "M6 3v7a6 6 0 0012 0V3M4 21h16",
  "undo2": "M6 9v-4l-4 4 4 4V9M18 9a6 6 0 00-6-6H6"
};

/**
 * Generic Tiptap icon component that renders SVG based on name
 * Replaces 35+ individual icon files with a single reusable component
 */
export const TiptapIcon = React.memo(({ name, className, ...props }: TiptapIconProps) => {
  const path = iconPaths[name];
  
  if (!path) {
    console.warn(`TiptapIcon: Icon "${name}" not found`);
    return null;
  }

  return (
    <svg
      width="24"
      height="24"
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d={path} />
    </svg>
  );
});

TiptapIcon.displayName = "TiptapIcon";

// Export individual icon components for backward compatibility
export const AlignCenterIcon = (props: React.SVGProps<SVGSVGElement>) => 
  <TiptapIcon name="align-center" {...props} />;
export const AlignJustifyIcon = (props: React.SVGProps<SVGSVGElement>) => 
  <TiptapIcon name="align-justify" {...props} />;
export const AlignLeftIcon = (props: React.SVGProps<SVGSVGElement>) => 
  <TiptapIcon name="align-left" {...props} />;
export const AlignRightIcon = (props: React.SVGProps<SVGSVGElement>) => 
  <TiptapIcon name="align-right" {...props} />;
export const ArrowLeftIcon = (props: React.SVGProps<SVGSVGElement>) => 
  <TiptapIcon name="arrow-left" {...props} />;
export const BanIcon = (props: React.SVGProps<SVGSVGElement>) => 
  <TiptapIcon name="ban" {...props} />;
export const BlockquoteIcon = (props: React.SVGProps<SVGSVGElement>) => 
  <TiptapIcon name="blockquote" {...props} />;
export const BoldIcon = (props: React.SVGProps<SVGSVGElement>) => 
  <TiptapIcon name="bold" {...props} />;
export const ChevronDownIcon = (props: React.SVGProps<SVGSVGElement>) => 
  <TiptapIcon name="chevron-down" {...props} />;
export const CloseIcon = (props: React.SVGProps<SVGSVGElement>) => 
  <TiptapIcon name="close" {...props} />;
export const CodeBlockIcon = (props: React.SVGProps<SVGSVGElement>) => 
  <TiptapIcon name="code-block" {...props} />;
export const Code2Icon = (props: React.SVGProps<SVGSVGElement>) => 
  <TiptapIcon name="code2" {...props} />;
export const CornerDownLeftIcon = (props: React.SVGProps<SVGSVGElement>) => 
  <TiptapIcon name="corner-down-left" {...props} />;
export const ExternalLinkIcon = (props: React.SVGProps<SVGSVGElement>) => 
  <TiptapIcon name="external-link" {...props} />;
export const HeadingIcon = (props: React.SVGProps<SVGSVGElement>) => 
  <TiptapIcon name="heading" {...props} />;
export const HeadingOneIcon = (props: React.SVGProps<SVGSVGElement>) => 
  <TiptapIcon name="heading-one" {...props} />;
export const HeadingTwoIcon = (props: React.SVGProps<SVGSVGElement>) => 
  <TiptapIcon name="heading-two" {...props} />;
export const HeadingThreeIcon = (props: React.SVGProps<SVGSVGElement>) => 
  <TiptapIcon name="heading-three" {...props} />;
export const HeadingFourIcon = (props: React.SVGProps<SVGSVGElement>) => 
  <TiptapIcon name="heading-four" {...props} />;
export const HeadingFiveIcon = (props: React.SVGProps<SVGSVGElement>) => 
  <TiptapIcon name="heading-five" {...props} />;
export const HeadingSixIcon = (props: React.SVGProps<SVGSVGElement>) => 
  <TiptapIcon name="heading-six" {...props} />;
export const HighlighterIcon = (props: React.SVGProps<SVGSVGElement>) => 
  <TiptapIcon name="highlighter" {...props} />;
export const ImagePlusIcon = (props: React.SVGProps<SVGSVGElement>) => 
  <TiptapIcon name="image-plus" {...props} />;
export const ItalicIcon = (props: React.SVGProps<SVGSVGElement>) => 
  <TiptapIcon name="italic" {...props} />;
export const LinkIcon = (props: React.SVGProps<SVGSVGElement>) => 
  <TiptapIcon name="link" {...props} />;
export const ListIcon = (props: React.SVGProps<SVGSVGElement>) => 
  <TiptapIcon name="list" {...props} />;
export const ListOrderedIcon = (props: React.SVGProps<SVGSVGElement>) => 
  <TiptapIcon name="list-ordered" {...props} />;
export const ListTodoIcon = (props: React.SVGProps<SVGSVGElement>) => 
  <TiptapIcon name="list-todo" {...props} />;
export const MoonStarIcon = (props: React.SVGProps<SVGSVGElement>) => 
  <TiptapIcon name="moon-star" {...props} />;
export const Redo2Icon = (props: React.SVGProps<SVGSVGElement>) => 
  <TiptapIcon name="redo2" {...props} />;
export const StrikeIcon = (props: React.SVGProps<SVGSVGElement>) => 
  <TiptapIcon name="strike" {...props} />;
export const SubscriptIcon = (props: React.SVGProps<SVGSVGElement>) => 
  <TiptapIcon name="subscript" {...props} />;
export const SunIcon = (props: React.SVGProps<SVGSVGElement>) => 
  <TiptapIcon name="sun" {...props} />;
export const SuperscriptIcon = (props: React.SVGProps<SVGSVGElement>) => 
  <TiptapIcon name="superscript" {...props} />;
export const TrashIcon = (props: React.SVGProps<SVGSVGElement>) => 
  <TiptapIcon name="trash" {...props} />;
export const UnderlineIcon = (props: React.SVGProps<SVGSVGElement>) => 
  <TiptapIcon name="underline" {...props} />;
export const Undo2Icon = (props: React.SVGProps<SVGSVGElement>) => 
  <TiptapIcon name="undo2" {...props} />;