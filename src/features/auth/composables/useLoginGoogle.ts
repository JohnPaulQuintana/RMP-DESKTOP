import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuth } from "./useAuth";
import { isTauri } from '@tauri-apps/api/core'

export const useLoginGoogle = () => {
  const router = useRouter();
  const { googleLogin, googleDesktopLogin } = useAuth();

  const isLoading = ref(false);
  const errorMessage = ref("");

  const handleGoogleLogin = async () => {
    if (isLoading.value) {
      return;
    }

    try {
      isLoading.value = true;
      errorMessage.value = "";

      // Tauri desktop app
      if (await isTauri()) {
        await googleDesktopLogin()
        return
      }

      // Browser login
      const user = await googleLogin();

      if (!user) {
        return null;
      }

      if (user.role === "admin") {
        await router.push("/admin/manageUser");
      } else {
        await router.push("/dashboard");
      }

      return user;
    } catch (error: unknown) {
      console.error("Google login failed:", error);

      errorMessage.value = "Unable to sign in with Google. Please try again.";

      return null;
    } finally {
      isLoading.value = false;
    }
  };

  return {
    isLoading,
    errorMessage,
    handleGoogleLogin,
  };
};
