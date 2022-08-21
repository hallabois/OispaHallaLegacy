import { readable, writable, type Writable } from 'svelte/store'
import { browser } from '$app/env'
import type { Auth, User } from "firebase/auth"
import { generateActionCodeSettings } from './firebase_config'

const createAuth = () => {
	let auth: Auth

	const { subscribe } = readable<User>(undefined, set => {
		let unsubscribe = () => {}

		async function listen() {
			if (browser) {
				const { app } = await import('./firebase_config')
				const { getAuth, onAuthStateChanged } = await import('firebase/auth')

				auth = getAuth(app)

				unsubscribe = onAuthStateChanged(auth, set)
			} else {
				set(null)
			}
		}

		listen()

		return () => unsubscribe()
	})

	async function providerFor(name: string) {
		const { GoogleAuthProvider, GithubAuthProvider, TwitterAuthProvider } = await import('firebase/auth')
		switch (name) {
			case 'google': return new GoogleAuthProvider()
			case 'github': return new GithubAuthProvider()
			case 'twitter': return new TwitterAuthProvider()
			default: throw 'unknown provider ' + name
		}
	}

	async function signInWith(name: string) {
		const { signInWithRedirect } = await import('firebase/auth')
		const provider = await providerFor(name)
		await signInWithRedirect(auth, provider)
	}

	async function sendSignInLink(email: string, origin: string) {
		const { sendSignInLinkToEmail } = await import('firebase/auth');
		try {
			await sendSignInLinkToEmail(auth, email, generateActionCodeSettings(origin));
			return true;
		}
		catch (e) {
			console.warn(e);
		};
		return false;
	}

	async function signInWithLink(email: string, href: string) {
		const { signInWithEmailLink } = await import('firebase/auth');
		try {
			await signInWithEmailLink(auth, email, href);
			return true;
		} catch (e) {
			console.warn(e);
		}
		return false;
	}

	async function signOut() {
		const { signOut } = await import('firebase/auth')
		clearTraces();
		await signOut(auth)
	}

	function clearTraces() {
		console.clear();
		console.info("Signed out, have a good day!");
		token.set(null);
		import('$lib/leaderboardstore').then(({lb_screenName})=>{
			lb_screenName.set(null);
		});
		// localStorage.clear(); // Not a good idea
	}

	return {
		subscribe,
		signInWith,
		sendSignInLink,
		signInWithLink,
		signOut,
	}
}

export const token: Writable<null | string> = writable(null);
export const auth = createAuth();
auth.subscribe(async ($auth) => {
	if ($auth != null) {
		let tk = await $auth.getIdToken();
		token.set(tk);
	}
});