import { ref } from "vue";
import { check, type Update } from "@tauri-apps/plugin-updater";
import { relaunch } from "@tauri-apps/plugin-process";

const updateAvailable = ref(false);
const updating = ref(false);
const update = ref<Update | null>(null);

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
    return;
  }

  try {
    updating.value = true;

    await update.value.downloadAndInstall((event) => {
      switch (event.event) {
        case "Started":
          console.log("Update download started:", event.data.contentLength);
          break;

        case "Progress":
          console.log("Downloaded:", event.data.chunkLength);
          break;

        case "Finished":
          console.log("Update download finished.");
          break;
      }
    });

    console.log("Update installed. Restarting...");

    await relaunch();
  } catch (error) {
    console.error("Failed to install update:", error);

    updating.value = false;
  }
};

export const useAppUpdater = () => {
  return {
    updateAvailable,
    updating,
    update,
    checkForUpdates,
    installUpdate,
    dismissUpdate
  };
};
