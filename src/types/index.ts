export interface AppRule {
  process_name: string;
  window_title: string;
  action: "hide" | "minimize" | "mute_audio";
}

export interface LaunchItem {
  path: string;
  args: string[];
}

export interface Profile {
  id: string;
  name: string;
  icon: string;
  app_rules: AppRule[];
  launch_items: LaunchItem[];
  wallpaper_path: string | null;
  is_active: boolean;
}

export interface AppSettings {
  hotkey: string;
  active_profile_id: string | null;
  profiles: Profile[];
  hidden_window_handles: number[];
  muted_pids: number[];
}

export interface RunningApp {
  hwnd: number;
  title: string;
  process_name: string;
  pid: number;
}
