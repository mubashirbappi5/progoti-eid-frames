import HeroSection from "@/components/HeroSection";
import FrameGenerator from "@/components/FrameGenerator";
import EidFooter from "@/components/EidFooter";

const Index = () => {
  const generatorRef = useRef<HTMLDivElement>(null);

  const scrollToGenerator = () => {
    document.getElementById("frame-generator")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background">
      <HeroSection onCreateFrame={scrollToGenerator} />
      <FrameGenerator />
      <EidFooter />
    </div>
  );
};

export default Index;
