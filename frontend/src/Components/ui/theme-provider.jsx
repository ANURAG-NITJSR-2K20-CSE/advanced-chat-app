import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

/**
 * Applies `class="dark"` on &lt;html&gt; when using attribute="class".
 * @param {import("next-themes").ThemeProviderProps} props
 */
export function ThemeProvider({ children, ...props }) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
