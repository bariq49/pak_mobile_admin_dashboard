import "./assets/scss/globals.scss";
import "./assets/scss/theme.scss";
import { siteConfig } from "@/config/site";
import Providers from "@/provider/providers";
import TanstackProvider from "@/provider/providers.client";
import AuthProvider from "@/provider/auth.provider";
import DirectionProvider from "@/provider/direction.provider";

export const metadata = {
  title: {
    default: siteConfig.name,
    template: `%s - ${siteConfig.name}`,
  },
  description: siteConfig.description,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <TanstackProvider>
        <Providers>
          <AuthProvider>
            <DirectionProvider>{children}</DirectionProvider>
          </AuthProvider>
        </Providers>
      </TanstackProvider>
    </html>
  );
}
