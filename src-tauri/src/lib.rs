mod audio_ctrl;
mod profiles;
mod tray;
mod win_api;

use tauri::Manager;

#[tauri::command]
fn update_tray_menu(app: tauri::AppHandle, profile_names: Vec<(String, String)>) -> Result<(), String> {
    let menu = tray::create_tray_menu(&app, &profile_names)?;
    if let Some(tray) = app.tray_by_id("altspace-tray") {
        tray.set_menu(Some(menu))
            .map_err(|e| format!("Failed to set tray menu: {}", e))?;
    }
    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .setup(|app| {
            // Setup tray menu with default profiles
            let default_profiles = vec![
                ("panic-mode".to_string(), "🚨 PANIC MODE".to_string()),
                ("deep-work".to_string(), "💼 DEEP WORK".to_string()),
            ];

            let menu = tray::create_tray_menu(&app.handle(), &default_profiles)
                .expect("Failed to create initial tray menu");

            if let Some(tray) = app.tray_by_id("altspace-tray") {
                tray.set_menu(Some(menu))
                    .expect("Failed to set initial tray menu");

                let app_handle = app.handle().clone();
                tray.on_menu_event(move |_app, event| {
                    tray::handle_tray_menu_event(&app_handle, event.id().as_ref());
                });

                let app_handle2 = app.handle().clone();
                tray.on_tray_icon_event(move |_tray, event| {
                    tray::handle_tray_icon_event(&app_handle2, event);
                });
            }

            // Hide to tray on close instead of quitting
            let app_handle3 = app.handle().clone();
            if let Some(window) = app.get_webview_window("main") {
                window.on_window_event(move |event| {
                    if let tauri::WindowEvent::CloseRequested { api, .. } = event {
                        api.prevent_close();
                        if let Some(w) = app_handle3.get_webview_window("main") {
                            let _ = w.hide();
                        }
                    }
                });
            }

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            profiles::load_settings,
            profiles::save_settings,
            win_api::get_running_apps,
            win_api::minimize_window,
            win_api::hide_window_by_handle,
            win_api::restore_window,
            win_api::restore_all_hidden,
            win_api::set_wallpaper,
            win_api::launch_application,
            audio_ctrl::mute_process_audio,
            audio_ctrl::unmute_process_audio,
            audio_ctrl::unmute_all_processes,
            update_tray_menu,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
