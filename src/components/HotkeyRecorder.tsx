import { useState, useEffect, useCallback, useRef } from "react";
import { Keyboard } from "lucide-react";

interface HotkeyRecorderProps {
  value: string;
  onChange: (hotkey: string) => void;
}

const MODIFIER_KEYS = new Set(["Control", "Shift", "Alt", "Meta"]);
const KEY_DISPLAY_MAP: Record<string, string> = {
  Control: "Ctrl",
  " ": "Space",
  ArrowUp: "Up",
  ArrowDown: "Down",
  ArrowLeft: "Left",
  ArrowRight: "Right",
  Escape: "Esc",
  Delete: "Del",
  Backspace: "Backspace",
};

export default function HotkeyRecorder({ value, onChange }: HotkeyRecorderProps) {
  const [recording, setRecording] = useState(false);
  const [currentKeys, setCurrentKeys] = useState<string[]>([]);
  const inputRef = useRef<HTMLDivElement>(null);

  const formatKey = (key: string) => KEY_DISPLAY_MAP[key] || key;

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!recording) return;
    e.preventDefault();
    e.stopPropagation();

    const key = e.key;
    
    setCurrentKeys(prev => {
      if (prev.includes(key)) return prev;
      return [...prev, key];
    });
  }, [recording]);

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    if (!recording) return;
    e.preventDefault();

    setCurrentKeys(prev => {
      // Only finalize when we have at least one modifier + one non-modifier
      const modifiers = prev.filter(k => MODIFIER_KEYS.has(k));
      const others = prev.filter(k => !MODIFIER_KEYS.has(k));

      if (modifiers.length > 0 && others.length > 0) {
        const hotkey = [...modifiers.map(formatKey), ...others.map(k => formatKey(k).toUpperCase())].join("+");
        onChange(hotkey);
        setRecording(false);
        return [];
      }

      // Remove released key
      return prev.filter(k => k !== e.key);
    });
  }, [recording, onChange]);

  useEffect(() => {
    if (recording) {
      window.addEventListener("keydown", handleKeyDown);
      window.addEventListener("keyup", handleKeyUp);
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [recording, handleKeyDown, handleKeyUp]);

  return (
    <div className="flex items-center gap-3">
      <div
        ref={inputRef}
        onClick={() => { setRecording(true); setCurrentKeys([]); }}
        className={`brutal-input cursor-pointer flex items-center gap-2 min-h-[42px] select-none ${recording ? "!border-brutalist-accent !bg-yellow-50" : ""}`}
        tabIndex={0}
      >
        <Keyboard className="w-4 h-4 shrink-0" />
        {recording ? (
          <span className="text-brutalist-muted animate-pulse">
            {currentKeys.length > 0
              ? currentKeys.map(formatKey).join(" + ")
              : "Press keys..."}
          </span>
        ) : (
          <span className="font-bold">{value || "Click to record"}</span>
        )}
      </div>
      {recording && (
        <button
          className="brutal-btn bg-white text-xs"
          onClick={() => { setRecording(false); setCurrentKeys([]); }}
        >
          Cancel
        </button>
      )}
    </div>
  );
}
