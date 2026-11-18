import { useState, useEffect } from "react";
import {
  Search,
  RefreshCw,
  Eye,
  EyeOff,
  Minimize2,
  VolumeX,
  Plus,
  Trash2,
  FileImage,
  Rocket,
  X,
  Copy,
} from "lucide-react";
import type { Profile, AppRule, LaunchItem, RunningApp } from "../types";
import { open } from "@tauri-apps/plugin-dialog";

interface ProfileEditorProps {
  profile: Profile;
  onSave: (profile: Profile) => void;
  onClose: () => void;
  onDuplicate: (profile: Profile) => void;
  runningApps: RunningApp[];
  onScanApps: () => void;
  scanning: boolean;
}

const ACTION_LABELS: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  hide: { label: "HIDE", color: "bg-brutalist-danger text-white", icon: <EyeOff className="w-3 h-3" /> },
  minimize: { label: "MINIMIZE", color: "bg-brutalist-accent text-black", icon: <Minimize2 className="w-3 h-3" /> },
  mute_audio: { label: "MUTE", color: "bg-brutalist-purple text-white", icon: <VolumeX className="w-3 h-3" /> },
};

export default function ProfileEditor({
  profile: initialProfile,
  onSave,
  onClose,
  onDuplicate,
  runningApps,
  onScanApps,
  scanning,
}: ProfileEditorProps) {
  const [profile, setProfile] = useState<Profile>({ ...initialProfile });
  const [appFilter, setAppFilter] = useState("");
  const [selectedAction, setSelectedAction] = useState<"hide" | "minimize" | "mute_audio">("minimize");
  const [newLaunchPath, setNewLaunchPath] = useState("");

  useEffect(() => {
    setProfile({ ...initialProfile });
  }, [initialProfile]);

  const filteredApps = runningApps.filter(app => {
    const q = appFilter.toLowerCase();
    return app.title.toLowerCase().includes(q) || app.process_name.toLowerCase().includes(q);
  });

  const isAppInRules = (app: RunningApp) => {
    return profile.app_rules.some(
      r => r.process_name.toLowerCase() === app.process_name.toLowerCase()
    );
  };

  const toggleAppRule = (app: RunningApp) => {
    if (isAppInRules(app)) {
      setProfile(p => ({
        ...p,
        app_rules: p.app_rules.filter(
          r => r.process_name.toLowerCase() !== app.process_name.toLowerCase()
        ),
      }));
    } else {
      const rule: AppRule = {
        process_name: app.process_name,
        window_title: app.title,
        action: selectedAction,
      };
      setProfile(p => ({ ...p, app_rules: [...p.app_rules, rule] }));
    }
  };

  const removeRule = (index: number) => {
    setProfile(p => ({
      ...p,
      app_rules: p.app_rules.filter((_, i) => i !== index),
    }));
  };

  const updateRuleAction = (index: number, action: "hide" | "minimize" | "mute_audio") => {
    setProfile(p => ({
      ...p,
      app_rules: p.app_rules.map((r, i) => (i === index ? { ...r, action } : r)),
    }));
  };

  const addLaunchItem = () => {
    if (!newLaunchPath.trim()) return;
    const item: LaunchItem = { path: newLaunchPath.trim(), args: [] };
    setProfile(p => ({ ...p, launch_items: [...p.launch_items, item] }));
    setNewLaunchPath("");
  };

  const removeLaunchItem = (index: number) => {
    setProfile(p => ({
      ...p,
      launch_items: p.launch_items.filter((_, i) => i !== index),
    }));
  };

  const pickWallpaper = async () => {
    try {
      const path = await open({
        multiple: false,
        filters: [{ name: "Images", extensions: ["png", "jpg", "jpeg", "bmp", "webp"] }],
      });
      if (path) {
        setProfile(p => ({ ...p, wallpaper_path: path as string }));
      }
    } catch (e) {
      console.error("Failed to pick wallpaper:", e);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="brutal-card bg-brutalist-bg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <input
              className="text-3xl w-16 text-center bg-transparent border-none outline-none"
              value={profile.icon}
              onChange={e => setProfile(p => ({ ...p, icon: e.target.value }))}
              maxLength={2}
            />
            <input
              className="brutal-input text-xl font-bold !w-auto"
              value={profile.name}
              onChange={e => setProfile(p => ({ ...p, name: e.target.value }))}
              placeholder="Profile Name"
            />
          </div>
          <div className="flex gap-2">
            <button
              className="brutal-btn bg-white"
              onClick={() => onDuplicate(profile)}
              title="Duplicate Profile"
            >
              <Copy className="w-4 h-4" />
            </button>
            <button className="brutal-btn bg-white" onClick={onClose}>
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* App Rules Section */}
        <section className="mb-6">
          <h3 className="text-lg font-black uppercase mb-3 flex items-center gap-2">
            <Eye className="w-5 h-5" /> App Rules
          </h3>

          {/* Current Rules */}
          {profile.app_rules.length > 0 && (
            <div className="mb-4 space-y-2">
              {profile.app_rules.map((rule, i) => {
                const actionInfo = ACTION_LABELS[rule.action];
                return (
                  <div key={i} className="flex items-center gap-2 p-2 border-2 border-black bg-white">
                    <span className={`brutal-badge ${actionInfo.color} flex items-center gap-1`}>
                      {actionInfo.icon} {actionInfo.label}
                    </span>
                    <span className="font-mono text-sm flex-1 truncate">{rule.process_name}</span>
                    <span className="text-xs text-brutalist-muted truncate max-w-[200px]">{rule.window_title}</span>
                    <select
                      className="brutal-select text-xs !py-1"
                      value={rule.action}
                      onChange={e => updateRuleAction(i, e.target.value as AppRule["action"])}
                    >
                      <option value="hide">Hide</option>
                      <option value="minimize">Minimize</option>
                      <option value="mute_audio">Mute Audio</option>
                    </select>
                    <button
                      className="p-1 hover:bg-brutalist-danger hover:text-white border-2 border-black"
                      onClick={() => removeRule(i)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* App Scanner */}
          <div className="border-2 border-black p-3 bg-white">
            <div className="flex items-center gap-2 mb-3">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-brutalist-muted" />
                <input
                  className="brutal-input !pl-8"
                  placeholder="Filter running apps..."
                  value={appFilter}
                  onChange={e => setAppFilter(e.target.value)}
                />
              </div>
              <select
                className="brutal-select"
                value={selectedAction}
                onChange={e => setSelectedAction(e.target.value as AppRule["action"])}
              >
                <option value="hide">Hide</option>
                <option value="minimize">Minimize</option>
                <option value="mute_audio">Mute Audio</option>
              </select>
              <button
                className="brutal-btn-primary flex items-center gap-1"
                onClick={onScanApps}
                disabled={scanning}
              >
                <RefreshCw className={`w-4 h-4 ${scanning ? "animate-spin" : ""}`} />
                Scan
              </button>
            </div>

            <div className="max-h-48 overflow-y-auto space-y-1">
              {filteredApps.length === 0 ? (
                <p className="text-center text-brutalist-muted py-4 text-sm">
                  {runningApps.length === 0 ? 'Click "Scan" to detect running apps' : "No apps match filter"}
                </p>
              ) : (
                filteredApps.map(app => (
                  <label
                    key={app.hwnd}
                    className={`flex items-center gap-2 p-2 cursor-pointer border-2 border-black hover:bg-brutalist-accent/20 transition-colors ${isAppInRules(app) ? "bg-brutalist-accent/30" : ""}`}
                  >
                    <input
                      type="checkbox"
                      className="brutal-checkbox"
                      checked={isAppInRules(app)}
                      onChange={() => toggleAppRule(app)}
                    />
                    <span className="font-mono text-xs text-brutalist-muted w-32 truncate">{app.process_name}</span>
                    <span className="text-sm font-medium flex-1 truncate">{app.title}</span>
                  </label>
                ))
              )}
            </div>
          </div>
        </section>

        {/* Launch Items */}
        <section className="mb-6">
          <h3 className="text-lg font-black uppercase mb-3 flex items-center gap-2">
            <Rocket className="w-5 h-5" /> Launch Apps
          </h3>
          <div className="space-y-2 mb-3">
            {profile.launch_items.map((item, i) => (
              <div key={i} className="flex items-center gap-2 p-2 border-2 border-black bg-white">
                <Rocket className="w-4 h-4 shrink-0 text-brutalist-info" />
                <span className="font-mono text-sm flex-1 truncate">{item.path}</span>
                <button
                  className="p-1 hover:bg-brutalist-danger hover:text-white border-2 border-black"
                  onClick={() => removeLaunchItem(i)}
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              className="brutal-input flex-1"
              placeholder="Executable path or URL (e.g., C:\...\code.exe)"
              value={newLaunchPath}
              onChange={e => setNewLaunchPath(e.target.value)}
              onKeyDown={e => e.key === "Enter" && addLaunchItem()}
            />
            <button className="brutal-btn-primary" onClick={addLaunchItem}>
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </section>

        {/* Wallpaper */}
        <section className="mb-6">
          <h3 className="text-lg font-black uppercase mb-3 flex items-center gap-2">
            <FileImage className="w-5 h-5" /> Wallpaper Override
          </h3>
          <div className="flex items-center gap-3">
            <button className="brutal-btn bg-white" onClick={pickWallpaper}>
              Choose Image
            </button>
            {profile.wallpaper_path ? (
              <div className="flex items-center gap-2 flex-1">
                <span className="font-mono text-sm truncate flex-1">{profile.wallpaper_path}</span>
                <button
                  className="p-1 hover:bg-brutalist-danger hover:text-white border-2 border-black"
                  onClick={() => setProfile(p => ({ ...p, wallpaper_path: null }))}
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <span className="text-brutalist-muted text-sm">No wallpaper override set</span>
            )}
          </div>
        </section>

        {/* Save */}
        <div className="flex justify-end gap-3 pt-4 border-t-2 border-black">
          <button className="brutal-btn bg-white" onClick={onClose}>
            Cancel
          </button>
          <button
            className="brutal-btn-primary text-base px-8"
            onClick={() => onSave(profile)}
          >
            Save Profile
          </button>
        </div>
      </div>
    </div>
  );
}
