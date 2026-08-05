"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { MobileCabinetNav } from "@/components/dashboard/mobile-cabinet-nav";

const cabinetRoots = ["/billing", "/children", "/dashboard", "/series", "/stories"];

type RouteShellProps = {
  children: ReactNode;
  footer: ReactNode;
  header: ReactNode;
  sidebar: ReactNode;
};

export function RouteShell({ children, footer, header, sidebar }: RouteShellProps) {
  const pathname = usePathname();
  const isCabinet = cabinetRoots.some(
    (root) => pathname === root || pathname.startsWith(`${root}/`)
  );

  if (!isCabinet) {
    return (
      <>
        {header}
        {children}
        {footer}
      </>
    );
  }

  return (
    <>
      {header}
      <div className="mx-auto flex w-full max-w-[96rem]">
        {sidebar}
        <div className="min-w-0 flex-1 pb-20 lg:pb-0">{children}</div>
      </div>
      <MobileCabinetNav />
    </>
  );
}
