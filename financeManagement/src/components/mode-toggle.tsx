import { MoonIcon, SunIcon } from "@radix-ui/react-icons";
import { useTheme } from "@/components/theme-provider";
import { Switch } from "@/components/ui/switch";

export function ModeToggle() {
  const { theme, setTheme } = useTheme();

  function handleChecked() {
    if (theme === "light") {
      setTheme("dark");
    } else {
      setTheme("light");
    }
  }

  return (
    <div className="flex items-center space-x-2">
      <Switch id="mode-toggle" onCheckedChange={handleChecked} />
      <div className="mr-3">{theme === "dark" ? <MoonIcon className="mr-3"/> : <SunIcon className="mr-3"/>}</div>
    </div>
  );
}
