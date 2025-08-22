import { Heading } from "~/components/common/forms/Headings";

interface AdminLayoutProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  gridClassName?: string;
}

/**
 * Shared layout component for admin pages
 * Eliminates duplication across admin routes
 */
export function AdminLayout({ 
  title, 
  children, 
  className = "", 
  gridClassName = "grid gap-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" 
}: AdminLayoutProps) {
  return (
    <div className={`bg-background min-h-screen w-full py-8 lg:py-24 ${className}`}>
      <div className="px-2 pb-8 md:px-8">
        <Heading className="text-center">{title}</Heading>
        <div className={gridClassName}>
          {children}
        </div>
      </div>
    </div>
  );
}