#[cfg_attr(mobile, tauri::mobile_entry_point)]
use tauri::Emitter;

pub fn run() {

    tauri::Builder::default()

        .plugin(
            tauri_plugin_log::Builder::default()
                .level(log::LevelFilter::Info)
                .build(),
        )

        .plugin(tauri_plugin_updater::Builder::new().build())

        .plugin(tauri_plugin_process::init())

        .plugin(tauri_plugin_opener::init())

        .plugin(tauri_plugin_deep_link::init())

        .setup(|app| {

            #[cfg(desktop)]
            {
                use tauri_plugin_deep_link::DeepLinkExt;

                let app_handle = app.handle().clone();

                app.deep_link()
                    .on_open_url(move |event| {

                        let urls = event.urls();

                        log::info!(
                            "Deep link received: {:?}",
                            urls
                        );

                        if let Some(url) = urls.first() {

                            log::info!(
                                "Auth callback URL: {}",
                                url
                            );

                            let _ = app_handle.emit(
                                "desktop-auth",
                                url.to_string()
                            );
                        }

                    });
            }

            Ok(())
        })

        .run(tauri::generate_context!())
        .expect("error while running tauri application");

}