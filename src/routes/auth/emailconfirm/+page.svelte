<script lang="ts">
	import { browser } from "$app/env";
	import { auth } from "$lib/Auth/authstore";
	$: if($auth) {
		// Redirect once signed in
		window.location.href = "/auth";
	}
	let email: string | null;
	if( browser ) {
		email = localStorage.getItem('emailForSignIn');
	}
	function promptEmail() {
		email = prompt("Sähköposti");
	}
	let signInMessage: string | null;
	let loadingResults = false;
	async function attemptSignIn() {
		signInMessage = null;
		loadingResults = true;
		if(email) {
			let result = await auth.signInWithLink(email, window.location.href);
			if(result) {
				localStorage.removeItem('emailForSignIn');
				signInMessage = "Kirjautuminen onnistui.";
			}
			else {
				signInMessage = "Kirjautuminen epäonnistui.";
			}
		}
		loadingResults = false;
	}
</script>

<main>
	{#if browser || loadingResults}
		<h1 class="title"><a href="/" target="_blank" style="text-decoration: none;" title="avautuu uuteen välilehteen">OispaHalla</a></h1>
		{#if $auth}
			<p>Ohjataan uudelleen...</p>
		{:else}
			{#if email != null}
				<button class="button action-btn" on:click={attemptSignIn}>Kirjaudu sisään sähköpostilla {email}</button>
			{:else}
				<h1>Kirjautumista ei ole aloitettu</h1>
				<a href="/auth">Aloita kirjautuminen</a>
			{/if}
		{/if}
	{:else}
		<p>Ladataan...</p>
	{/if}
	{#if signInMessage != null}
		<p>{signInMessage}</p>
	{/if}
</main>

<style>
	main {
		background: var(--background);
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;

		gap: .5em;
		padding-inline: .5em;

		min-height: 100vh;
	}
	.discouradge {
		color: var(--button-background);
		background: var(--background);
		border: 1px solid var(--button-background);
	}
</style>