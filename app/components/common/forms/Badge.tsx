import { cn } from "~/lib/ui/utils";

export default function Badge({
  value,
  average = 2,
  isDynamic,
  className,
  title,
  size = "md", // sm md lg
}: {
  value: number;
  average?: number;
  isDynamic?: boolean;
  className?: string;
  title?: string;
  size?: string;
}) {
  const sizes = new Map([
    ["sm", "h-5 text-xs px-1.5"],
    ["md", "h-6 text-sm px-2"],
    ["lg", "h-8 text-base px-3"],
  ]);

  return value > 0 ? (
    <div
      title={
        title ||
        value
          .toString()
          .concat(` ${value === 1 ? "ação atrasada" : "ações atrasadas"}`)
      }
      className={cn(
        `grid place-content-center items-start rounded-full text-center font-medium ${
          isDynamic
            ? value > average
              ? "bg-rose-600 text-white"
              : "bg-amber-500 text-amber-900"
            : "bg-accent text-accent-foreground"
        } ${sizes.get(size)}`,
        className,
      )}
    >
      {value}
    </div>
  ) : null;
}
