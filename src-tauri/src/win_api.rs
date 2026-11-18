use std::ffi::OsString;
use std::os::windows::ffi::OsStringExt;
use serde::{Deserialize, Serialize};
use windows::Win32::Foundation::{BOOL, HWND, LPARAM, TRUE, CloseHandle};
use windows::Win32::System::Threading::{OpenProcess, PROCESS_QUERY_LIMITED_INFORMATION};
use windows::Win32::System::ProcessStatus::GetModuleFileNameExW;
use windows::Win32::UI::WindowsAndMessaging::{
    EnumWindows, GetWindowTextW, GetWindowTextLengthW, GetWindowThreadProcessId,
    IsWindowVisible, ShowWindow, SystemParametersInfoW,
    SW_HIDE, SW_MINIMIZE, SW_RESTORE, SW_SHOW,
    SPI_SETDESKWALLPAPER, SPIF_SENDCHANGE, SPIF_UPDATEINIFILE,
};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RunningApp {
    pub hwnd: isize,
    pub title: String,
    pub process_name: String,
    pub pid: u32,
}

unsafe extern "system" fn enum_windows_callback(hwnd: HWND, lparam: LPARAM) -> BOOL {
    let windows = &mut *(lparam.0 as *mut Vec<RunningApp>);

    if !IsWindowVisible(hwnd).as_bool() {
        return TRUE;
    }

    let title_len = GetWindowTextLengthW(hwnd);
    if title_len == 0 {
        return TRUE;
    }

    let mut title_buf = vec![0u16; (title_len + 1) as usize];
    GetWindowTextW(hwnd, &mut title_buf);
    let title = OsString::from_wide(&title_buf[..title_len as usize])
        .to_string_lossy()
        .to_string();

    if title.is_empty() {
        return TRUE;
    }

    let mut pid: u32 = 0;
    GetWindowThreadProcessId(hwnd, Some(&mut pid));

    let process_name = get_process_name(pid).unwrap_or_else(|| "Unknown".to_string());

    windows.push(RunningApp {
        hwnd: hwnd.0 as isize,
        title,
        process_name,
        pid,
    });

    TRUE
}

fn get_process_name(pid: u32) -> Option<String> {
    unsafe {
        let handle = OpenProcess(PROCESS_QUERY_LIMITED_INFORMATION, false, pid).ok()?;
        let mut buf = [0u16; 260];
        let len = GetModuleFileNameExW(handle, None, &mut buf);
        let _ = CloseHandle(handle);
        if len == 0 {
            return None;
        }
        let full_path = OsString::from_wide(&buf[..len as usize])
            .to_string_lossy()
            .to_string();
        full_path
            .rsplit('\\')
            .next()
            .map(|s| s.to_string())
    }
}

#[tauri::command]
pub fn get_running_apps() -> Result<Vec<RunningApp>, String> {
    let mut windows: Vec<RunningApp> = Vec::new();

    unsafe {
        EnumWindows(
            Some(enum_windows_callback),
            LPARAM(&mut windows as *mut Vec<RunningApp> as isize),
        )
        .map_err(|e| format!("EnumWindows failed: {}", e))?;
    }

    // Deduplicate by pid, keeping the first (most prominent) window
    let mut seen_pids = std::collections::HashSet::new();
    windows.retain(|w| seen_pids.insert(w.pid));

    // Filter out our own process and common system windows
    let self_pid = std::process::id();
    windows.retain(|w| {
        w.pid != self_pid
            && !w.process_name.eq_ignore_ascii_case("explorer.exe")
            && !w.process_name.eq_ignore_ascii_case("TextInputHost.exe")
            && !w.process_name.eq_ignore_ascii_case("SearchHost.exe")
            && !w.title.is_empty()
    });

    windows.sort_by(|a, b| a.title.to_lowercase().cmp(&b.title.to_lowercase()));

    Ok(windows)
}

#[tauri::command]
pub fn minimize_window(hwnd: isize) -> Result<(), String> {
    unsafe {
        let h = HWND(hwnd as *mut _);
        let _ = ShowWindow(h, SW_MINIMIZE);
    }
    Ok(())
}

#[tauri::command]
pub fn hide_window_by_handle(hwnd: isize) -> Result<(), String> {
    unsafe {
        let h = HWND(hwnd as *mut _);
        let _ = ShowWindow(h, SW_HIDE);
    }
    Ok(())
}

#[tauri::command]
pub fn restore_window(hwnd: isize) -> Result<(), String> {
    unsafe {
        let h = HWND(hwnd as *mut _);
        let _ = ShowWindow(h, SW_SHOW);
        let _ = ShowWindow(h, SW_RESTORE);
    }
    Ok(())
}

#[tauri::command]
pub fn restore_all_hidden(handles: Vec<isize>) -> Result<(), String> {
    for hwnd in handles {
        unsafe {
            let h = HWND(hwnd as *mut _);
            let _ = ShowWindow(h, SW_SHOW);
            let _ = ShowWindow(h, SW_RESTORE);
        }
    }
    Ok(())
}

#[tauri::command]
pub fn set_wallpaper(path: String) -> Result<(), String> {
    let wide_path: Vec<u16> = path.encode_utf16().chain(std::iter::once(0)).collect();

    unsafe {
        SystemParametersInfoW(
            SPI_SETDESKWALLPAPER,
            0,
            Some(wide_path.as_ptr() as *mut _),
            SPIF_UPDATEINIFILE | SPIF_SENDCHANGE,
        )
        .map_err(|e| format!("Failed to set wallpaper: {}", e))?;
    }

    Ok(())
}

#[tauri::command]
pub fn launch_application(path: String, args: Vec<String>) -> Result<(), String> {
    let mut cmd = std::process::Command::new(&path);
    for arg in &args {
        cmd.arg(arg);
    }
    cmd.spawn()
        .map_err(|e| format!("Failed to launch '{}': {}", path, e))?;
    Ok(())
}
