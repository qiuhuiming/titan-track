mod commands;
mod models;
mod storage;

use storage::AppStorage;
use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            // Initialize storage with app handle
            let storage = AppStorage::new(app.handle())
                .expect("Failed to initialize storage");
            app.manage(storage);

            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::get_exercises,
            commands::save_exercises,
            commands::get_logs,
            commands::save_logs,
            commands::get_plans,
            commands::save_plans,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
