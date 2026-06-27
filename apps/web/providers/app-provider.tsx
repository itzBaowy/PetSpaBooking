"use client";

import { QueryProvider } from "./query-provider";
import { ThemeProvider } from "./theme-provider";
import { AuthProvider } from "./auth-provider";
import { FeedbackProvider } from "@/components/ui/feedback-provider";

export function AppProvider({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <AuthProvider>
          <FeedbackProvider>{children}</FeedbackProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryProvider>
  );
}
