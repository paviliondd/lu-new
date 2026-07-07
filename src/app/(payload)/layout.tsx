import config from "@payload-config";
import { RootLayout } from "@payloadcms/next/layouts";
import type { ReactNode } from "react";
import { importMap } from "./importMap";
import { serverFunction } from "./serverFunction";

export { metadata } from "@payloadcms/next/layouts";

export default function PayloadLayout({ children }: { children: ReactNode }) {
  return (
    <RootLayout
      config={config}
      importMap={importMap}
      serverFunction={serverFunction}
    >
      {children}
    </RootLayout>
  );
}
