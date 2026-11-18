use windows::Win32::Media::Audio::{
    eRender, eConsole,
    IMMDeviceEnumerator, MMDeviceEnumerator, IMMDevice,
    IAudioSessionManager2, IAudioSessionEnumerator, IAudioSessionControl,
    IAudioSessionControl2, ISimpleAudioVolume,
};
use windows::Win32::System::Com::{
    CoCreateInstance, CoInitializeEx, CoUninitialize,
    CLSCTX_ALL, COINIT_MULTITHREADED,
};
use windows::core::Interface;

fn with_com_init<F, T>(f: F) -> Result<T, String>
where
    F: FnOnce() -> Result<T, String>,
{
    unsafe {
        let _ = CoInitializeEx(None, COINIT_MULTITHREADED);
    }
    let result = f();
    unsafe {
        CoUninitialize();
    }
    result
}

fn get_audio_sessions() -> Result<IAudioSessionEnumerator, String> {
    unsafe {
        let enumerator: IMMDeviceEnumerator =
            CoCreateInstance(&MMDeviceEnumerator, None, CLSCTX_ALL)
                .map_err(|e| format!("Failed to create device enumerator: {}", e))?;

        let device: IMMDevice = enumerator
            .GetDefaultAudioEndpoint(eRender, eConsole)
            .map_err(|e| format!("Failed to get default audio endpoint: {}", e))?;

        let mgr: IAudioSessionManager2 = device
            .Activate(CLSCTX_ALL, None)
            .map_err(|e| format!("Failed to activate session manager: {}", e))?;

        let session_enum = mgr
            .GetSessionEnumerator()
            .map_err(|e| format!("Failed to get session enumerator: {}", e))?;

        Ok(session_enum)
    }
}

#[tauri::command]
pub fn mute_process_audio(target_pid: u32) -> Result<(), String> {
    with_com_init(|| {
        unsafe {
            let session_enum = get_audio_sessions()?;
            let count = session_enum
                .GetCount()
                .map_err(|e| format!("Failed to get session count: {}", e))?;

            for i in 0..count {
                let session: IAudioSessionControl = session_enum
                    .GetSession(i)
                    .map_err(|e| format!("Failed to get session {}: {}", i, e))?;

                let session2: IAudioSessionControl2 = session
                    .cast()
                    .map_err(|e| format!("Failed to cast session: {}", e))?;

                let pid = session2
                    .GetProcessId()
                    .map_err(|e| format!("Failed to get process ID: {}", e))?;

                if pid == target_pid {
                    let volume: ISimpleAudioVolume = session
                        .cast()
                        .map_err(|e| format!("Failed to cast to volume: {}", e))?;

                    volume
                        .SetMute(true, std::ptr::null())
                        .map_err(|e| format!("Failed to mute: {}", e))?;
                }
            }
            Ok(())
        }
    })
}

#[tauri::command]
pub fn unmute_process_audio(target_pid: u32) -> Result<(), String> {
    with_com_init(|| {
        unsafe {
            let session_enum = get_audio_sessions()?;
            let count = session_enum
                .GetCount()
                .map_err(|e| format!("Failed to get session count: {}", e))?;

            for i in 0..count {
                let session: IAudioSessionControl = session_enum
                    .GetSession(i)
                    .map_err(|e| format!("Failed to get session {}: {}", i, e))?;

                let session2: IAudioSessionControl2 = session
                    .cast()
                    .map_err(|e| format!("Failed to cast session: {}", e))?;

                let pid = session2
                    .GetProcessId()
                    .map_err(|e| format!("Failed to get process ID: {}", e))?;

                if pid == target_pid {
                    let volume: ISimpleAudioVolume = session
                        .cast()
                        .map_err(|e| format!("Failed to cast to volume: {}", e))?;

                    volume
                        .SetMute(false, std::ptr::null())
                        .map_err(|e| format!("Failed to unmute: {}", e))?;
                }
            }
            Ok(())
        }
    })
}

#[tauri::command]
pub fn unmute_all_processes(pids: Vec<u32>) -> Result<(), String> {
    for pid in pids {
        let _ = unmute_process_audio(pid);
    }
    Ok(())
}
