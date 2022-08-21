// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCOV2pOfusUtinSwdDHONKQ48zvZRdQ6Gs",
    authDomain: "hallabois-auth.firebaseapp.com",
    projectId: "hallabois-auth",
    storageBucket: "hallabois-auth.appspot.com",
    messagingSenderId: "122091804244",
    appId: "1:122091804244:web:6f8346acf9ade4b3d57fc1",

    languageCode: "fi"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);


export function generateActionCodeSettings(origin: string) {
    return {
        // URL you want to redirect back to. The domain (www.example.com) for this
        // URL must be in the authorized domains list in the Firebase Console.
        url: `${origin}/auth/emailconfirm`,
        // This must be true.
        handleCodeInApp: true,
    };
}