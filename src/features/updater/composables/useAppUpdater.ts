import { ref, shallowRef } from "vue";
import { check, type Update } from "@tauri-apps/plugin-updater";
import { relaunch } from "@tauri-apps/plugin-process";

const updateAvailable = ref(false);
const updating = ref(false);

/**
 * Tauri Update is a class instance.
 *
 * Use shallowRef so Vue does not convert the Update
 * instance into a reactive Proxy.
 */
const update = shallowRef<Update | null>(null);

const updateProgress = ref(0);
const updateError = ref<string | null>(null);

const dismissUpdate = () => {
  updateAvailable.value = false;
};

const checkForUpdates = async () => {
  try {
    updateError.value = null;

    const result = await check();

    if (result) {
      console.log(`Update available: ${result.version}`);

      update.value = result;
      updateAvailable.value = true;
    } else {
      console.log("Application is up to date.");

      update.value = null;
      updateAvailable.value = false;
    }
  } catch (error) {
    console.error("Failed to check for updates:", error);
  }
};

const installUpdate = async () => {
  /**
   * Store the Update instance in a local variable.
   *
   * This makes sure we are calling methods directly on
   * the original Tauri Update instance.
   */
  const currentUpdate = update.value;

  if (!currentUpdate) {
    console.error("No update available.");
    return;
  }

  try {
    updating.value = true;
    updateError.value = null;
    updateProgress.value = 0;

    console.log("Starting update:", currentUpdate.version);

    await currentUpdate.downloadAndInstall((event) => {
      console.log("Update event:", event);

      switch (event.event) {
        case "Started":
          console.log("Download started:", event.data.contentLength);

          updateProgress.value = 0;
          break;

        case "Progress":
          console.log("Downloaded:", event.data.chunkLength);

          /**
           * Progress events provide the size of the
           * downloaded chunk, not the total percentage.
           *
           * We therefore don't calculate a percentage here.
           */
          break;

        case "Finished":
          console.log("Download finished.");

          updateProgress.value = 100;
          break;
      }
    });

    console.log("Update installed. Restarting...");

    await relaunch();
  } catch (error) {
    console.error("Update installation failed:", error);

    updateError.value = error instanceof Error ? error.message : String(error);

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
