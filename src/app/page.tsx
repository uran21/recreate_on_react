import Hero from "@/components/home/Hero";
import Favorites from "@/components/home/Favorites";
import About from "@/components/home/About";
import App from "@/components/home/Apps";

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
