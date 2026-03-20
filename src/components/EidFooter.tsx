import { Moon } from "lucide-react";
import progotiLogo from "@/assets/progoti-logo.jpg";

const EidFooter = () => (
  <footer className="py-8 text-center border-t border-border">
    <div className="flex flex-col items-center gap-3">
      <img src={progotiLogo} alt="Progoti-21" className="w-10 h-10 rounded-full object-contain" />
      <div className="flex items-center gap-2 text-muted-foreground font-body text-sm">
        <Moon className="w-4 h-4 text-secondary" />
        Made with ❤️ by Mubashir bappi
        <Moon className="w-4 h-4 text-secondary" />
      </div>
    </div>
  </footer>
);

export default EidFooter;
