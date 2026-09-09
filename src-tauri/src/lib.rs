use std::sync::Mutex;

#[cfg_attr(mobile, tauri::mobile_entry_point)]

use tauri::Emitter;
use tauri::Manager;

#[tauri::command]
fn get_pending_auth(
    state: tauri::State<'_, Mutex<Option<String>>>,
) -> Option<String> {
    let mut pending = state.lock().unwrap();

    pending.take()
}

pub fn run() {
    tauri::Builder::default()

        // ==========================================
        // Store pending authentication callback
        // ==========================================

        .manage(Mutex::new(None::<String>))

        // ==========================================
        // Single Instance
        // ==========================================

        .plugin(
            tauri_plugin_single_instance::init(
                |app, args, _cwd| {

                    log::info!(
                        "Single instance received args: {:?}",
                        args
                    );

                    for arg in args {

                        if arg.starts_with("rmp://") {

                            log::info!(
                                "Deep link received by existing instance: {}",
                                arg
                            );

                            // Save the deep link
                            let state =
                                app.state::<
                                    Mutex<Option<String>>
                                >();

                            let mut pending =
                                state.lock().unwrap();

                            *pending =
                                Some(arg.clone());

                            log::info!(
                                "Saved running app auth callback: {}",
                                arg
                            );

                            // Notify Vue immediately
                            let _ =
                                app.emit(
                                    "desktop-auth",
                                    arg.clone(),
                                );

                            log::info!(
                                "Sent desktop-auth event to Vue"
                            );
                        }
                    }
                },
            ),
        )

        // ==========================================
        // Logging
        // ==========================================

        .plugin(
            tauri_plugin_log::Builder::default()
                .level(log::LevelFilter::Info)
                .build(),
        )

        // ==========================================
        // Updater
        // ==========================================

        .plugin(
            tauri_plugin_updater::Builder::new()
                .build(),
        )

        // ==========================================
        // Process
        // ==========================================

        .plugin(
            tauri_plugin_process::init(),
        )

        // ==========================================
        // Opener
        // ==========================================

        .plugin(
            tauri_plugin_opener::init(),
        )

        // ==========================================
        // Deep Link
        // ==========================================

        .plugin(
            tauri_plugin_deep_link::init(),
        )

        // ==========================================
        // Commands
        // ==========================================

        .invoke_handler(
            tauri::generate_handler![
                get_pending_auth
            ],
        )

        // ==========================================
        // Setup
        // ==========================================

        .setup(|app| {

            #[cfg(desktop)]
            {
                let app_handle =
                    app.handle().clone();

                // =====================================
                // App started from deep link
                // =====================================

                let args: Vec<String> =
                    std::env::args().collect();

                log::info!(
                    "Startup args: {:?}",
                    args
                );

                for arg in args {

                    if arg.starts_with("rmp://") {

                        log::info!(
                            "Startup deep link found: {}",
                            arg
                        );

                        let state =
                            app_handle
                                .state::<
                                    Mutex<Option<String>>
                                >();

                        let mut pending =
                            state.lock().unwrap();

                        *pending =
                            Some(arg.clone());

                        log::info!(
                            "Saved startup auth callback: {}",
                            arg
                        );
                    }
                }
            }

            Ok(())
        })

        .run(
            tauri::generate_context!()
        )

        .expect(
            "error while running tauri application"
        );
}