export const metadata = {
  title: "Coffee House — Home",
  description: "Enjoy premium coffee at our charming cafe",
  icons: { icon: "/assets/favicon.png" },
};

import "@/styles/main.css";
import Header from "../components/home/Header";
import Promo from "../components/home/Promo";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <Header />
        {children}
        <Promo />
      </body>
    </html>
  );
}
