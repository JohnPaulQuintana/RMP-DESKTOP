import { listen } from "@tauri-apps/api/event";
import { useAuthStore } from "@/stores/auth";

export const listenDesktopLogin = async () => {
  const authStore = useAuthStore();

  await listen<string>("desktop-auth", (event) => {
    console.log("Desktop auth received:", event.payload);

    const url = new URL(event.payload);

    const token = url.searchParams.get("token");

    const uid = url.searchParams.get("uid");

    const email = url.searchParams.get("email");

    const role = url.searchParams.get("role");

    if (token && uid && email && role) {
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
    }
  });
};
