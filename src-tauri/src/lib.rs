#[cfg_attr(mobile, tauri::mobile_entry_point)]

use tauri::Emitter;
use tauri::Manager;
use std::sync::Mutex;


#[tauri::command]
fn get_pending_auth(
    state: tauri::State<'_, Mutex<Option<String>>>
) -> Option<String> {

    let mut pending =
        state.lock().unwrap();

    pending.take()
}



pub fn run() {

    tauri::Builder::default()

        // Store startup deep link
        .manage(
            Mutex::new(None::<String>)
        )


        .plugin(
            tauri_plugin_log::Builder::default()
                .level(log::LevelFilter::Info)
                .build(),
        )


        .plugin(
            tauri_plugin_updater::Builder::new()
                .build()
        )


        .plugin(
            tauri_plugin_process::init()
        )


        .plugin(
            tauri_plugin_opener::init()
        )


        .plugin(
            tauri_plugin_deep_link::init()
        )


        .invoke_handler(
            tauri::generate_handler![
                get_pending_auth
            ]
        )


        .setup(|app| {


            #[cfg(desktop)]
            {

                use tauri_plugin_deep_link::DeepLinkExt;


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
                                .state::<Mutex<Option<String>>>();


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




                // =====================================
                // App already running
                // =====================================

                let deep_link_handle =
                    app_handle.clone();


                app.deep_link()
                    .on_open_url(move |event| {


                        let urls =
                            event.urls();


                        log::info!(
                            "Deep link received: {:?}",
                            urls
                        );



                        if let Some(url) =
                            urls.first()
                        {


                            let url =
                                url.to_string();


                            log::info!(
                                "Auth callback URL: {}",
                                url
                            );



                            let _ =
                                deep_link_handle.emit(
                                    "desktop-auth",
                                    url
                                );

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