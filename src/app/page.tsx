import Image from "next/image";
import Link from "next/link";
import Hero from "@/components/home/Hero";
import Favorites from "@/components/home/Favorites";
import About from "@/components/home/About";
import App from "@/components/home/Apps";
import Promo from "@/components/home/Promo";

export default function HomePage() {
  return (
    <main className="page">
      <Hero />
      <Favorites />
      <About />
      <App />
    </main>
  );
}
