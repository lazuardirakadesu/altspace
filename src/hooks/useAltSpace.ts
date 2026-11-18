import { useState, useEffect, useCallback, useRef } from "react";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import type { AppSettings, RunningApp, Profile, AppRule } from "../types";

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loadSettings = useCallback(async () => {
    try {
      setLoading(true);
      const data = await invoke<AppSettings>("load_settings");
      setSettings(data);
      setError(null);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  const saveSettings = useCallback(async (newSettings: AppSettings) => {
    setSettings(newSettings);
    // Debounce saves
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(async () => {
      try {
        await invoke("save_settings", { settings: newSettings });
        // Update tray menu with profile names
        const profileNames: [string, string][] = newSettings.profiles.map(p => [p.id, p.name]);
        await invoke("update_tray_menu", { profileNames });
      } catch (e) {
        setError(String(e));
      }
    }, 300);
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  return { settings, loading, error, saveSettings, loadSettings };
}

export function useRunningApps() {
  const [apps, setApps] = useState<RunningApp[]>([]);
  const [scanning, setScanning] = useState(false);

  const scanApps = useCallback(async () => {
    setScanning(true);
    try {
      const result = await invoke<RunningApp[]>("get_running_apps");
      setApps(result);
    } catch (e) {
      console.error("Failed to scan apps:", e);
    } finally {
      setScanning(false);
    }
  }, []);

  return { apps, scanning, scanApps };
}

export function useProfileActions(
  settings: AppSettings | null,
  saveSettings: (s: AppSettings) => Promise<void>
) {
  const executeProfile = useCallback(async (profile: Profile) => {
    const hiddenHandles: number[] = [];
    const mutedPids: number[] = [];

    // Get current running apps to match rules
    let currentApps: RunningApp[] = [];
    try {
      currentApps = await invoke<RunningApp[]>("get_running_apps");
    } catch (e) {
      console.error("Failed to get running apps:", e);
    }

    for (const rule of profile.app_rules) {
      const matchingApps = currentApps.filter(app => {
        const nameMatch = rule.process_name
          ? app.process_name.toLowerCase().includes(rule.process_name.toLowerCase())
          : false;
        const titleMatch = rule.window_title
          ? app.title.toLowerCase().includes(rule.window_title.toLowerCase())
          : false;
        return nameMatch || titleMatch;
      });

      for (const app of matchingApps) {
        try {
          switch (rule.action) {
            case "hide":
              await invoke("hide_window_by_handle", { hwnd: app.hwnd });
              hiddenHandles.push(app.hwnd);
              break;
            case "minimize":
              await invoke("minimize_window", { hwnd: app.hwnd });
              break;
            case "mute_audio":
              await invoke("mute_process_audio", { targetPid: app.pid });
              mutedPids.push(app.pid);
              break;
          }
        } catch (e) {
          console.error(`Failed to execute rule for ${app.process_name}:`, e);
        }
      }
    }

    // Launch items
    for (const item of profile.launch_items) {
      try {
        await invoke("launch_application", { path: item.path, args: item.args });
      } catch (e) {
        console.error(`Failed to launch ${item.path}:`, e);
      }
    }

    // Set wallpaper
    if (profile.wallpaper_path) {
      try {
        await invoke("set_wallpaper", { path: profile.wallpaper_path });
      } catch (e) {
        console.error("Failed to set wallpaper:", e);
      }
    }

    // Save hidden handles and muted pids
    if (settings) {
      await saveSettings({
        ...settings,
        hidden_window_handles: [...settings.hidden_window_handles, ...hiddenHandles],
        muted_pids: [...settings.muted_pids, ...mutedPids],
        active_profile_id: profile.id,
      });
    }
  }, [settings, saveSettings]);

  const restoreAll = useCallback(async () => {
    if (!settings) return;

    try {
      if (settings.hidden_window_handles.length > 0) {
        await invoke("restore_all_hidden", { handles: settings.hidden_window_handles });
      }
      if (settings.muted_pids.length > 0) {
        await invoke("unmute_all_processes", { pids: settings.muted_pids });
      }
      await saveSettings({
        ...settings,
        hidden_window_handles: [],
        muted_pids: [],
      });
    } catch (e) {
      console.error("Failed to restore:", e);
    }
  }, [settings, saveSettings]);

  // Listen for tray trigger events
  useEffect(() => {
    const unlisten = listen<string>("trigger-profile", (event) => {
      if (!settings) return;
      const profile = settings.profiles.find(p => p.id === event.payload);
      if (profile) {
        executeProfile(profile);
      }
    });
    return () => { unlisten.then(fn => fn()); };
  }, [settings, executeProfile]);

  return { executeProfile, restoreAll };
}
