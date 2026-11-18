use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;
use tauri::{AppHandle, Manager};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AppRule {
    pub process_name: String,
    pub window_title: String,
    pub action: RuleAction,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "snake_case")]
pub enum RuleAction {
    Hide,
    Minimize,
    MuteAudio,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LaunchItem {
    pub path: String,
    pub args: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Profile {
    pub id: String,
    pub name: String,
    pub icon: String,
    pub app_rules: Vec<AppRule>,
    pub launch_items: Vec<LaunchItem>,
    pub wallpaper_path: Option<String>,
    pub is_active: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AppSettings {
    pub hotkey: String,
    pub active_profile_id: Option<String>,
    pub profiles: Vec<Profile>,
    pub hidden_window_handles: Vec<isize>,
    pub muted_pids: Vec<u32>,
}

impl Default for AppSettings {
    fn default() -> Self {
        Self {
            hotkey: "Ctrl+Shift+Space".to_string(),
            active_profile_id: Some("panic-mode".to_string()),
            profiles: vec![
                Profile {
                    id: "panic-mode".to_string(),
                    name: "🚨 PANIC MODE".to_string(),
                    icon: "🚨".to_string(),
                    app_rules: vec![],
                    launch_items: vec![],
                    wallpaper_path: None,
                    is_active: true,
                },
                Profile {
                    id: "deep-work".to_string(),
                    name: "💼 DEEP WORK".to_string(),
                    icon: "💼".to_string(),
                    app_rules: vec![],
                    launch_items: vec![],
                    wallpaper_path: None,
                    is_active: false,
                },
            ],
            hidden_window_handles: vec![],
            muted_pids: vec![],
        }
    }
}

fn get_config_path(app: &AppHandle) -> Result<PathBuf, String> {
    let config_dir = app
        .path()
        .app_config_dir()
        .map_err(|e| format!("Failed to get app config dir: {}", e))?;
    
    fs::create_dir_all(&config_dir)
        .map_err(|e| format!("Failed to create config dir: {}", e))?;
    
    Ok(config_dir.join("settings.json"))
}

#[tauri::command]
pub fn load_settings(app: AppHandle) -> Result<AppSettings, String> {
    let path = get_config_path(&app)?;
    
    if !path.exists() {
        let defaults = AppSettings::default();
        save_settings_inner(&path, &defaults)?;
        return Ok(defaults);
    }
    
    let data = fs::read_to_string(&path)
        .map_err(|e| format!("Failed to read settings: {}", e))?;
    
    let settings: AppSettings = serde_json::from_str(&data)
        .map_err(|e| format!("Failed to parse settings: {}", e))?;
    
    Ok(settings)
}

#[tauri::command]
pub fn save_settings(app: AppHandle, settings: AppSettings) -> Result<(), String> {
    let path = get_config_path(&app)?;
    save_settings_inner(&path, &settings)
}

fn save_settings_inner(path: &PathBuf, settings: &AppSettings) -> Result<(), String> {
    let json = serde_json::to_string_pretty(settings)
        .map_err(|e| format!("Failed to serialize settings: {}", e))?;
    
    fs::write(path, json)
        .map_err(|e| format!("Failed to write settings: {}", e))?;
    
    Ok(())
}
