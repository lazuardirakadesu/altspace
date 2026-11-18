use tauri::{
    menu::{Menu, MenuItem, PredefinedMenuItem, Submenu},
    tray::TrayIconEvent,
    AppHandle, Emitter, Manager,
};

pub fn create_tray_menu(app: &AppHandle, profile_names: &[(String, String)]) -> Result<Menu<tauri::Wry>, String> {
    let menu = Menu::new(app).map_err(|e| format!("Failed to create menu: {}", e))?;

    // Profile submenu
    let profile_menu = Submenu::new(app, "Switch Profile", true)
        .map_err(|e| format!("Failed to create profile submenu: {}", e))?;

    for (id, name) in profile_names {
        let item = MenuItem::with_id(app, format!("profile_{}", id), name, true, None::<&str>)
            .map_err(|e| format!("Failed to create menu item: {}", e))?;
        profile_menu.append(&item)
            .map_err(|e| format!("Failed to append item to submenu: {}", e))?;
    }

    menu.append(&profile_menu)
        .map_err(|e| format!("Failed to append profile menu: {}", e))?;

    let separator = PredefinedMenuItem::separator(app)
        .map_err(|e| format!("Failed to create separator: {}", e))?;
    menu.append(&separator)
        .map_err(|e| format!("Failed to append separator: {}", e))?;

    let panic_item = MenuItem::with_id(app, "trigger_panic", "🚨 Trigger Panic Mode", true, None::<&str>)
        .map_err(|e| format!("Failed to create panic item: {}", e))?;
    menu.append(&panic_item)
        .map_err(|e| format!("Failed to append panic item: {}", e))?;

    let separator2 = PredefinedMenuItem::separator(app)
        .map_err(|e| format!("Failed to create separator: {}", e))?;
    menu.append(&separator2)
        .map_err(|e| format!("Failed to append separator: {}", e))?;

    let dashboard_item = MenuItem::with_id(app, "open_dashboard", "Open AltSpace Dashboard", true, None::<&str>)
        .map_err(|e| format!("Failed to create dashboard item: {}", e))?;
    menu.append(&dashboard_item)
        .map_err(|e| format!("Failed to append dashboard item: {}", e))?;

    let separator3 = PredefinedMenuItem::separator(app)
        .map_err(|e| format!("Failed to create separator: {}", e))?;
    menu.append(&separator3)
        .map_err(|e| format!("Failed to append separator: {}", e))?;

    let quit_item = MenuItem::with_id(app, "quit", "Quit AltSpace", true, None::<&str>)
        .map_err(|e| format!("Failed to create quit item: {}", e))?;
    menu.append(&quit_item)
        .map_err(|e| format!("Failed to append quit item: {}", e))?;

    Ok(menu)
}

pub fn handle_tray_menu_event(app: &AppHandle, event_id: &str) {
    match event_id {
        "open_dashboard" => {
            if let Some(window) = app.get_webview_window("main") {
                let _ = window.show();
                let _ = window.set_focus();
            }
        }
        "trigger_panic" => {
            if let Some(window) = app.get_webview_window("main") {
                let _ = window.emit("trigger-profile", "panic-mode");
            }
        }
        "quit" => {
            app.exit(0);
        }
        id if id.starts_with("profile_") => {
            let profile_id = id.strip_prefix("profile_").unwrap_or("");
            if let Some(window) = app.get_webview_window("main") {
                let _ = window.emit("trigger-profile", profile_id);
            }
        }
        _ => {}
    }
}

pub fn handle_tray_icon_event(app: &AppHandle, event: TrayIconEvent) {
    if let TrayIconEvent::DoubleClick { .. } = event {
        if let Some(window) = app.get_webview_window("main") {
            let _ = window.show();
            let _ = window.set_focus();
        }
    }
}
