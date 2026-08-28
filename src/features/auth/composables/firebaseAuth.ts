import {
  signInWithPopup,
  signOut
} from 'firebase/auth'

import {
  auth,
  googleProvider
} from '@/services/firebase'


export const signInWithGoogle = async () => {

  try {

    googleProvider.setCustomParameters({
      prompt: 'select_account',
    })


    const result = await signInWithPopup(
      auth,
      googleProvider
    )


    const user = result.user

    const idToken = await user.getIdToken(true)


    return {
      user,
      idToken,
    }


  } catch (error) {

    console.error(
      'Firebase Auth Error:',
      error
    )

    throw error
  }
}


export const signOutGoogle = async () => {
  await signOut(auth)
}