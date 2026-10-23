
import type { Metadata } from "next";
import "@fontsource-variable/google-sans-flex";
import "./globals.css";


export const metadata: Metadata = {
  title: "Institute Admission Form | Admissions Form",
  description: "Apply to Institute Admission Form through our online admission form.",
  icons: {
    icon: "/icon.png",
  },
};


export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body
        className="min-h-full flex flex-col"
        style={{
          fontFamily: '"Google Sans Flex Variable", sans-serif',
        }}
      >
        {children}
      </body>
    </html>
  );
}
