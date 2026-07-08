import { Separator } from "@roppoh/shadcn/components/ui/separator";
import { SidebarTrigger } from "@roppoh/shadcn/components/ui/sidebar";

export function SiteHeader({ title }: { title: string }) {
  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" size="icon-lg" />
        <Separator
          className="mx-2 my-auto data-[orientation=vertical]:h-5"
          orientation="vertical"
        />
        <h1 className="py-4 font-medium text-base"> {title} </h1>
      </div>
    </header>
  );
}
