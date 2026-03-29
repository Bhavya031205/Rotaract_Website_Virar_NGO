import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  // Determine the next theme in the cycle: System -> Dark -> Light -> System
  const toggleTheme = () => {
    if (theme === "system") setTheme("dark");
    else if (theme === "dark") setTheme("light");
    else setTheme("system");
  };

  return (
    <button
      onClick={toggleTheme}
      className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors duration-200 text-gray-600 dark:text-gray-300"
      title="Toggle Theme"
    >
      <div className="relative w-6 h-6 flex items-center justify-center">
        {/* Sun Icon (Show only when Light) */}
        <Sun 
          size={20} 
          className={`absolute transition-all duration-300 transform ${
            theme === 'light' ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-0 opacity-0'
          }`} 
        />
        
        {/* Moon Icon (Show only when Dark) */}
        <Moon 
          size={20} 
          className={`absolute transition-all duration-300 transform ${
            theme === 'dark' ? 'rotate-0 scale-100 opacity-100' : 'rotate-90 scale-0 opacity-0'
          }`} 
        />

        {/* Monitor/System Icon (Show only when System) */}
        <Monitor 
          size={20} 
          className={`absolute transition-all duration-300 transform ${
            theme === 'system' ? 'rotate-0 scale-100 opacity-100' : 'rotate-90 scale-0 opacity-0'
          }`} 
        />
      </div>
    </button>
  );
}