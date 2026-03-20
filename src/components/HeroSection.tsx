import { Moon, Star } from "lucide-react";

interface HeroSectionProps {
  onCreateFrame: () => void;
}

const HeroSection = ({ onCreateFrame }: HeroSectionProps) => {
  return (
    <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden eid-gradient">
      {/* Floating decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <Moon className="absolute top-12 right-8 w-16 h-16 text-primary-foreground/30 animate-float" style={{ animationDelay: '0s' }} />
        <Star className="absolute top-24 left-12 w-6 h-6 text-primary-foreground/20 animate-twinkle" style={{ animationDelay: '0.5s' }} />
        <Star className="absolute top-16 left-1/3 w-4 h-4 text-primary-foreground/25 animate-twinkle" style={{ animationDelay: '1s' }} />
        <Star className="absolute bottom-32 right-1/4 w-5 h-5 text-primary-foreground/20 animate-twinkle" style={{ animationDelay: '1.5s' }} />
        <Star className="absolute top-1/3 right-1/3 w-3 h-3 text-primary-foreground/15 animate-twinkle" style={{ animationDelay: '0.8s' }} />
        <div className="absolute -bottom-20 -left-20 w-60 h-60 rounded-full bg-primary-foreground/5 blur-3xl" />
        <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-primary-foreground/5 blur-3xl" />
      </div>

      <div className="relative z-10 text-center px-6 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-foreground/10 backdrop-blur-sm mb-6 animate-fade-up" style={{ animationDelay: '0.1s' }}>
          <Moon className="w-4 h-4 text-primary-foreground" />
          <span className="text-sm font-body font-medium text-primary-foreground/90">Progoti-21</span>
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-display font-bold text-primary-foreground leading-tight mb-4 animate-fade-up" style={{ animationDelay: '0.2s' }}>
          Eid Mubarak from{" "}
          <span className="eid-gradient-text block mt-1" style={{ WebkitTextFillColor: 'hsl(42, 70%, 75%)' }}>
            Progoti-21
          </span>
        </h1>

        <p className="text-lg sm:text-xl text-primary-foreground/75 font-body font-light mb-10 animate-fade-up" style={{ animationDelay: '0.35s' }}>
          Create your personalized Eid frame and share your joy
        </p>

        <button
          onClick={onCreateFrame}
          className="group relative inline-flex items-center gap-3 px-8 py-4 rounded-full bg-primary-foreground text-primary font-body font-semibold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 animate-fade-up"
          style={{ animationDelay: '0.5s' }}
        >
          <Moon className="w-5 h-5 transition-transform group-hover:rotate-12" />
          Create Your Frame
          <span className="absolute inset-0 rounded-full bg-primary-foreground/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </button>
      </div>

      {/* Bottom wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
          <path d="M0 80L48 74.7C96 69 192 59 288 58.7C384 59 480 69 576 74.7C672 80 768 80 864 74.7C960 69 1056 59 1152 58.7C1248 59 1344 69 1392 74.7L1440 80V120H1392C1344 120 1248 120 1152 120C1056 120 960 120 864 120C768 120 672 120 576 120C480 120 384 120 288 120C192 120 96 120 48 120H0V80Z" fill="hsl(140, 20%, 97%)" />
        </svg>
      </div>
    </section>
  );
};

export default HeroSection;
