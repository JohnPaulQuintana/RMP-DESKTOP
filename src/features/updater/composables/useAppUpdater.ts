import { ref } from "vue";
import { check, type Update } from "@tauri-apps/plugin-updater";
import { relaunch } from "@tauri-apps/plugin-process";

const updateAvailable = ref(false);
const updating = ref(false);
const update = ref<Update | null>(null);
const updateProgress = ref(0);
const updateError = ref<string | null>(null);

const dismissUpdate = () => {
  updateAvailable.value = false;
};

const checkForUpdates = async () => {
  try {
    const result = await check();

    if (result) {
      console.log(`Update available: ${result.version}`);

      update.value = result;
      updateAvailable.value = true;
    }
  } catch (error) {
    console.error("Failed to check for updates:", error);
  }
};

const installUpdate = async () => {
  if (!update.value) {
    console.error("No update available.");
    return;
  }

  try {
    updating.value = true;
    updateError.value = null;
    updateProgress.value = 0;

    console.log("Starting update:", update.value.version);

    await update.value.downloadAndInstall((event) => {
      console.log("Update event:", event);

      switch (event.event) {
        case "Started":
          console.log(
            "Download started:",
            event.data.contentLength,
          );
          break;

        case "Progress":
          console.log(
            "Downloaded:",
            event.data.chunkLength,
          );
          break;

        case "Finished":
          console.log("Download finished.");
          break;
      }
    });

    console.log("Update installed. Restarting...");

    await relaunch();
  } catch (error) {
    console.error("Update installation failed:", error);

    updateError.value =
      error instanceof Error
        ? error.message
        : String(error);

    updating.value = false;
  }
};

export const useAppUpdater = () => {
  return {
    updateAvailable,
    updating,
    update,
    updateProgress,
    updateError,
    checkForUpdates,
    installUpdate,
    dismissUpdate,
  };
};