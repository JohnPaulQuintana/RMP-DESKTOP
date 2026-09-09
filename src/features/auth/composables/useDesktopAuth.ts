import { listen } from "@tauri-apps/api/event";
import { invoke } from "@tauri-apps/api/core";
import { useAuthStore } from "@/stores/auth";
import router from "@/router";

const handleAuth = (
  urlString: string,
  authStore: ReturnType<typeof useAuthStore>,
) => {
  console.log("Desktop auth received:", urlString);

  try {
    const url = new URL(urlString);

    const token = url.searchParams.get("token");
    const uid = url.searchParams.get("uid");
    const email = url.searchParams.get("email");
    const role = url.searchParams.get("role");

    if (!token || !uid || !email || !role) {
      console.error("Invalid desktop auth callback.");
      return;
    }

    authStore.setAuth(
      {
        uid,
        email,
        role,
      },
      token,
      true,
    );

    console.log("Desktop Google login successful");

    router.push("/dashboard");
  } catch (error) {
    console.error("Failed to process desktop auth:", error);
  }
};

export const listenDesktopLogin = async () => {
  const authStore = useAuthStore();

  // =================================
  // Listen first
  // =================================

  await listen<string>("desktop-auth", (event) => {
    handleAuth(event.payload, authStore);
  });

  // =================================
  // Check startup deep link
  // =================================

  try {
    const pending = await invoke<string | null>("get_pending_auth");

    if (pending) {
      console.log("Pending desktop auth:", pending);

      handleAuth(pending, authStore);
    }
  } catch (error) {
    console.error("Failed checking pending auth:", error);
  }
};
