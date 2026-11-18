import { useState, useEffect, useCallback } from "react";
import {
  ShieldAlert,
  RotateCcw,
  Zap,
  Settings,
  Keyboard,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { useSettings, useRunningApps, useProfileActions } from "./hooks/useAltSpace";
import ProfileCard, { NewProfileCard } from "./components/ProfileCard";
import ProfileEditor from "./components/ProfileEditor";
import HotkeyRecorder from "./components/HotkeyRecorder";
import type { Profile } from "./types";
import { register, unregister } from "@tauri-apps/plugin-global-shortcut";

function generateId() {
  return "profile-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

export default function App() {
  const { settings, loading, error, saveSettings } = useSettings();
  const { apps, scanning, scanApps } = useRunningApps();
  const { executeProfile, restoreAll } = useProfileActions(settings, saveSettings);

  const [editingProfile, setEditingProfile] = useState<Profile | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [triggerFeedback, setTriggerFeedback] = useState<string | null>(null);
  const [restoreFeedback, setRestoreFeedback] = useState(false);

  // Register global hotkey
  useEffect(() => {
    if (!settings?.hotkey) return;

    let mounted = true;
    const hotkey = settings.hotkey;

    const setup = async () => {
      try {
        // Convert our format to Tauri format (Ctrl+Shift+Space → ctrl+shift+space)
        // Tauri v2 uses CommandOrControl, Shift, Alt, etc.
        await register(hotkey, (event) => {
          if (event.state === "Pressed") {
            if (!settings) return;
            const activeProfile = settings.profiles.find(
              p => p.id === settings.active_profile_id
            );
            if (activeProfile) {
              executeProfile(activeProfile);
              setTriggerFeedback(activeProfile.name);
              setTimeout(() => { if (mounted) setTriggerFeedback(null); }, 2000);
            }
          }
        });
      } catch (e) {
        console.error("Failed to register hotkey:", e);
      }
    };

    setup();

    return () => {
      mounted = false;
      unregister(hotkey).catch(() => {});
    };
  }, [settings?.hotkey]);

  const handleSaveProfile = useCallback(async (profile: Profile) => {
    if (!settings) return;
    const idx = settings.profiles.findIndex(p => p.id === profile.id);
    let newProfiles: Profile[];
    if (idx >= 0) {
      newProfiles = settings.profiles.map(p => (p.id === profile.id ? profile : p));
    } else {
      newProfiles = [...settings.profiles, profile];
    }
    await saveSettings({ ...settings, profiles: newProfiles });
    setEditingProfile(null);
  }, [settings, saveSettings]);

  const handleDeleteProfile = useCallback(async (id: string) => {
    if (!settings) return;
    const newProfiles = settings.profiles.filter(p => p.id !== id);
    const newActiveId = settings.active_profile_id === id
      ? (newProfiles[0]?.id || null)
      : settings.active_profile_id;
    await saveSettings({ ...settings, profiles: newProfiles, active_profile_id: newActiveId });
  }, [settings, saveSettings]);

  const handleDuplicate = useCallback(async (profile: Profile) => {
    if (!settings) return;
    const newProfile: Profile = {
      ...profile,
      id: generateId(),
      name: `${profile.name} (Copy)`,
      is_active: false,
    };
    await saveSettings({ ...settings, profiles: [...settings.profiles, newProfile] });
    setEditingProfile(newProfile);
  }, [settings, saveSettings]);

  const handleCreateProfile = useCallback(() => {
    const newProfile: Profile = {
      id: generateId(),
      name: "New Profile",
      icon: "⚡",
      app_rules: [],
      launch_items: [],
      wallpaper_path: null,
      is_active: false,
    };
    setEditingProfile(newProfile);
  }, []);

  const handleTrigger = useCallback(async (profile: Profile) => {
    await executeProfile(profile);
    setTriggerFeedback(profile.name);
    setTimeout(() => setTriggerFeedback(null), 2000);
  }, [executeProfile]);

  const handleRestore = useCallback(async () => {
    await restoreAll();
    setRestoreFeedback(true);
    setTimeout(() => setRestoreFeedback(false), 2000);
  }, [restoreAll]);

  const handleHotkeyChange = useCallback(async (newHotkey: string) => {
    if (!settings) return;
    // Unregister old
    if (settings.hotkey) {
      try { await unregister(settings.hotkey); } catch {}
    }
    await saveSettings({ ...settings, hotkey: newHotkey });
  }, [settings, saveSettings]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="brutal-card flex items-center gap-3 bg-brutalist-accent">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span className="font-black text-lg uppercase">Loading AltSpace...</span>
        </div>
      </div>
    );
  }

  if (error || !settings) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="brutal-card bg-brutalist-danger text-white max-w-md">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-6 h-6" />
            <h2 className="font-black text-lg">ERROR</h2>
          </div>
          <p className="font-mono text-sm">{error || "Failed to load settings"}</p>
        </div>
      </div>
    );
  }

  const hasHiddenOrMuted =
    settings.hidden_window_handles.length > 0 || settings.muted_pids.length > 0;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Trigger Feedback Toast */}
      {triggerFeedback && (
        <div className="fixed top-4 right-4 z-[100] brutal-card bg-brutalist-accent animate-bounce">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            <span className="font-black text-sm">Triggered: {triggerFeedback}</span>
          </div>
        </div>
      )}

      {/* Top Bar */}
      <header className="border-b-4 border-black bg-black text-white">
        <div className="flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-3">
            <ShieldAlert className="w-7 h-7 text-brutalist-accent" />
            <h1 className="text-xl font-black tracking-tight">
              ALT<span className="text-brutalist-accent">SPACE</span>
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {/* Restore Banner */}
            {hasHiddenOrMuted && (
              <button
                className={`brutal-btn flex items-center gap-2 text-sm ${
                  restoreFeedback
                    ? "bg-brutalist-success text-white"
                    : "bg-brutalist-danger text-white"
                }`}
                onClick={handleRestore}
              >
                <RotateCcw className={`w-4 h-4 ${restoreFeedback ? "" : "animate-pulse"}`} />
                {restoreFeedback ? "RESTORED!" : "RESTORE ALL HIDDEN APPS"}
                {!restoreFeedback && (
                  <span className="brutal-badge bg-white text-black ml-1 !border-white">
                    {settings.hidden_window_handles.length + settings.muted_pids.length}
                  </span>
                )}
              </button>
            )}

            <button
              className="brutal-btn bg-white text-black flex items-center gap-1"
              onClick={() => setShowSettings(!showSettings)}
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="border-t-2 border-brutalist-accent bg-zinc-900 px-6 py-4">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <Keyboard className="w-4 h-4 text-brutalist-accent" />
                <span className="text-sm font-bold uppercase text-zinc-300">Global Hotkey:</span>
              </div>
              <div className="w-72">
                <HotkeyRecorder
                  value={settings.hotkey}
                  onChange={handleHotkeyChange}
                />
              </div>
              <span className="text-xs text-zinc-500">
                Triggers the active profile from anywhere in Windows
              </span>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6">
        {/* Test Trigger Button */}
        <div className="mb-6">
          <button
            className="brutal-btn bg-brutalist-accent text-black w-full py-4 text-xl font-black flex items-center justify-center gap-3 hover:bg-yellow-300"
            style={{ boxShadow: "6px 6px 0px #000" }}
            onClick={() => {
              const active = settings.profiles.find(p => p.id === settings.active_profile_id);
              if (active) handleTrigger(active);
            }}
          >
            <Zap className="w-7 h-7" />
            TEST TRIGGER NOW
            {settings.active_profile_id && (
              <span className="text-sm font-mono opacity-70 ml-2">
                ({settings.profiles.find(p => p.id === settings.active_profile_id)?.name || "None"})
              </span>
            )}
          </button>
        </div>

        {/* Profile Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {settings.profiles.map(profile => (
            <ProfileCard
              key={profile.id}
              profile={profile}
              isActive={profile.id === settings.active_profile_id}
              onTrigger={() => handleTrigger(profile)}
              onEdit={() => { scanApps(); setEditingProfile(profile); }}
              onDelete={() => handleDeleteProfile(profile.id)}
              onSetActive={() =>
                saveSettings({ ...settings, active_profile_id: profile.id })
              }
            />
          ))}
          <NewProfileCard onCreate={handleCreateProfile} />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t-2 border-black px-6 py-2 bg-white">
        <div className="flex items-center justify-between text-xs text-brutalist-muted">
          <span>AltSpace v1.0.0 — 100% Local, Zero Telemetry</span>
          <span className="font-mono">
            Hotkey: <strong className="text-black">{settings.hotkey || "Not set"}</strong>
          </span>
        </div>
      </footer>

      {/* Profile Editor Modal */}
      {editingProfile && (
        <ProfileEditor
          profile={editingProfile}
          onSave={handleSaveProfile}
          onClose={() => setEditingProfile(null)}
          onDuplicate={handleDuplicate}
          runningApps={apps}
          onScanApps={scanApps}
          scanning={scanning}
        />
      )}
    </div>
  );
}
