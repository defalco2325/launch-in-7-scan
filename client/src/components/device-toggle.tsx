import { Button } from "@/components/ui/button";
import { Monitor, Smartphone } from "lucide-react";

interface DeviceToggleProps {
  device: "desktop" | "mobile";
  onDeviceChange: (device: "desktop" | "mobile") => void;
}

export default function DeviceToggle({ device, onDeviceChange }: DeviceToggleProps) {
  return (
    <div className="flex items-center bg-muted rounded-lg p-1">
      <Button
        variant={device === "desktop" ? "default" : "ghost"}
        size="sm"
        onClick={() => onDeviceChange("desktop")}
        className="toggle-switch"
        data-testid="button-desktop-view"
      >
        <Monitor className="w-4 h-4 mr-2" />
        Desktop
      </Button>
      <Button
        variant={device === "mobile" ? "default" : "ghost"}
        size="sm"
        onClick={() => onDeviceChange("mobile")}
        className="toggle-switch"
        data-testid="button-mobile-view"
      >
        <Smartphone className="w-4 h-4 mr-2" />
        Mobile
      </Button>
    </div>
  );
}