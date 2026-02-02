import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import ThemeRegistry from "@/components/ThemeRegistry";
import AppLayout from "@/components/AppLayout";

export const metadata = {
  title: "Summer Camp Planner",
  description: "Plan your family's summer camp schedule",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AppRouterCacheProvider>
          <ThemeRegistry>
            <AppLayout>{children}</AppLayout>
          </ThemeRegistry>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
