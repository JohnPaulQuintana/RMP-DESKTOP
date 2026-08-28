#[cfg_attr(mobile, tauri::mobile_entry_point)]

use tauri::Emitter;
use std::time::Duration;
use std::thread;

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


                // App opened from rmp:// deep link
                let args: Vec<String> = std::env::args().collect();

                log::info!("Startup args: {:?}", args);


                for arg in args {

                    if arg.starts_with("rmp://") {

                        log::info!(
                            "Startup deep link found: {}",
                            arg
                        );


                        let handle = app_handle.clone();

                        thread::spawn(move || {

                            thread::sleep(
                                Duration::from_secs(2)
                            );

                            let _ = handle.emit(
                                "desktop-auth",
                                arg
                            );

                        });
                    }
                }


                // App already running and receives deep link
                app.deep_link()
                    .on_open_url(move |event| {

                        let urls = event.urls();

                        log::info!(
                            "Deep link received: {:?}",
                            urls
                        );


                        if let Some(url) = urls.first() {

                            let handle = app_handle.clone();

                            let url = url.to_string();


                            thread::spawn(move || {

                                thread::sleep(
                                    Duration::from_secs(1)
                                );


                                let _ = handle.emit(
                                    "desktop-auth",
                                    url
                                );

                            });

                        }

                    });

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