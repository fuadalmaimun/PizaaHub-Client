import FeaturedItems from "./home/FeaturedItems";
import HowPizzaHubWorks from "./home/HowPizzaHubWorks";
import Hero from "./home/Hero";
import WhyChoosePizzaHub from "./home/WhyChoosePizzaHub";

export default function Home() {
  return (
    <>
      <Hero />
      <FeaturedItems />
      <WhyChoosePizzaHub />
      <HowPizzaHubWorks />
    </>
  );
}