import { useToast } from "vue-toastification";
import {
  login,
  register,
  // currentUser,
  firebaseLogin,
} from "../api/auth.api";
import { signInWithGoogle } from "../composables/firebaseAuth";
import { useAuthStore } from "@/stores/auth";
import { openUrl } from "@tauri-apps/plugin-opener";
const API_URL = import.meta.env.VITE_API_URL;

const toast = useToast();

export const useAuth = () => {
  const authStore = useAuthStore();

  const loginUser = async (
    email: string,
    password: string,
    remember: boolean,
  ) => {
    try {
      const result = await login({
        email,
        password,
      });

      if (result.success) {
        authStore.setAuth(result.data.user, result.data.access_token, remember);

        toast.success("Login successful!");

        return result.data.user;
      }

      toast.error(result.message || "Login failed");

      return null;
    } catch (err) {
      console.error("Login error:", err);

      toast.error("Invalid email or password", {
        timeout: 5000,
      });

      return null;
    }
  };

  const googleLogin = async () => {
    try {
      // 1. Login with Google/Firebase
      const { idToken } = await signInWithGoogle();

      // 2. Send Firebase token to backend
      const result = await firebaseLogin(idToken);

      if (result.success && result.data?.access_token) {
        // 3. Store authentication through Pinia
        authStore.setAuth(result.data.user, result.data.access_token, true);

        toast.success("Login successful!");

        return result.data.user;
      }

      toast.error(result.message || "Google login failed");

      return null;
    } catch (err: unknown) {
      console.error("Google login error:", err);

      if (typeof err === "object" && err !== null && "code" in err) {
        const firebaseError = err as {
          code?: string;
          message?: string;
        };

        if (firebaseError.code === "auth/popup-closed-by-user") {
          toast.error("Google sign-in was cancelled.");

          return null;
        }

        if (firebaseError.code === "auth/popup-blocked") {
          toast.error("Google sign-in popup was blocked.");

          return null;
        }
      }

      if (typeof err === "object" && err !== null && "response" in err) {
        const apiError = err as {
          response?: {
            data?: {
              message?: string;
            };
          };
        };

        const message = apiError.response?.data?.message;

        if (message) {
          toast.error(message);
          return null;
        }
      }

      toast.error("Unable to sign in with Google. Please try again.", {
        timeout: 5000,
      });

      return null;
    }
  };

  const googleDesktopLogin = async () => {
  try {
    await openUrl(`${API_URL}/v1/auth/google`);

    return true;
  } catch (err) {
    console.error(
      "Desktop Google login error:",
      err
    );

    toast.error(
      "Unable to open Google login"
    );

    return false;
  }
};

  const registerUser = async (email: string, password: string) => {
    try {
      const result = await register({
        email,
        password,
      });

      if (result.success) {
        toast.success(result.message || "Registration successful!");

        return result.data;
      }

      toast.error(result.message || "Registration failed");

      return null;
    } catch (err) {
      console.error("Register error:", err);

      toast.error("Registration Failed", {
        timeout: 5000,
      });

      return null;
    }
  };

  const logout = () => {
    authStore.logout();

    toast.success("Logged out successfully!");
  };

  // const getCurrentUser = async () => {
  //   try {
  //     const result = await currentUser()

  //     if (result.success) {
  //       authStore.setUser(
  //         result.data.user
  //       )

  //       return result.data.user
  //     }

  //     return null

  //   } catch (err) {
  //     console.error(
  //       'Get current user error:',
  //       err
  //     )

  //     return null
  //   }
  // }

  return {
    loginUser,
    googleLogin,
    googleDesktopLogin,
    registerUser,
    // getCurrentUser,
    logout,
  };
};
