import { Link } from "react-router";
import { cn } from "~/lib/ui/utils";

export function Heading({
  children,
  link,
  className,
}: {
  children: React.ReactNode;
  link?: string;
  className?: string;
}) {
  return (
    <h1
      className={cn([
        "pb-8 text-5xl font-bold tracking-tighter uppercase",
        className,
      ])}
    >
      {link ? <Link to={link}>{children}</Link> : children}
    </h1>
  );
}
