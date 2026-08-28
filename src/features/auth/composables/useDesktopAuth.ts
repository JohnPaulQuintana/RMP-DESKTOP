import { listen } from "@tauri-apps/api/event";
import { invoke } from "@tauri-apps/api/core";
import { useAuthStore } from "@/stores/auth";


const handleAuth = (
  urlString: string,
  authStore: ReturnType<typeof useAuthStore>
) => {

  console.log(
    "Desktop auth received:",
    urlString
  );


  const url =
    new URL(urlString);


  const token =
    url.searchParams.get("token");

  const uid =
    url.searchParams.get("uid");

  const email =
    url.searchParams.get("email");

  const role =
    url.searchParams.get("role");


  if (
    token &&
    uid &&
    email &&
    role
  ) {

    authStore.setAuth(
      {
        uid,
        email,
        role,
      },
      token,
      true
    );


    console.log(
      "Desktop Google login successful"
    );
  }

};



export const listenDesktopLogin = async () => {

  const authStore =
    useAuthStore();


  // =================================
  // Check startup deep link
  // =================================

  try {

    const pending =
      await invoke<string | null>(
        "get_pending_auth"
      );


    if (pending) {

      console.log(
        "Pending desktop auth:",
        pending
      );


      handleAuth(
        pending,
        authStore
      );

    }

  } catch (error) {

    console.error(
      "Failed checking pending auth:",
      error
    );

  }



  // =================================
  // Listen when app is already open
  // =================================

  await listen<string>(
    "desktop-auth",
    (event)=>{

      handleAuth(
        event.payload,
        authStore
      );

    }
  );

};