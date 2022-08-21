<script lang="ts">
	import { browser } from '$app/env';
	import { auth } from '$lib/Auth/authstore';
	import Popup from "$lib/components/common/popup/popup.svelte";

	let token: string | null;
	$: if($auth) {
		$auth.getIdToken(true).then((t)=>{
			token = t;
		});
	}

	let validation_result: Response | null;
	async function validate() {
		validation_result = null;
		validation_result = await fetch("/auth/validate", {
			method: "POST",
			body: JSON.stringify({
				token: token
			})
		});
	}

	let email_popup_open = false;
	let email: string | null;

	async function log_in_with_email() {
		if(email) {
			let result = await auth.sendSignInLink(email, window.location.origin);
			if(result) {
				try{
					window.localStorage.setItem('emailForSignIn', email);
				}catch{};
				alert("Linkki lähetetty!\nMuistathan tarkistaa roskaposti-kansion.\n\nVoit poistua tältä sivulta toistaiseksi.");
			}
			else {
				alert("Virhe.");
			}
		}
	}
</script>

<main>
	{#if browser}
		{#if $auth === undefined}
			<p>Tarkistetaan tietoja...</p>
		{:else}
			{#if $auth === null}
				<Popup bind:open={email_popup_open}>
					<span slot="title">Kirjaudu sisään sähköpostilla</span>
					<div slot="content" style="display: flex;gap: .5em;flex-wrap: wrap;">
						<input bind:value={email} placeholder="sähköposti" style="flex:1;font-size: 1em;">
						<button on:click={log_in_with_email} class="button action-btn" style="width: 100%;">Kirjaudu sisään</button>
					</div>
				</Popup>
				<h1>Kirjaudu sisään</h1>
				<div class="actions">
					<button class="button action-btn" on:click={() => auth.signInWith('google')}>Googlella</button>
					<button class="button action-btn" on:click={() => email_popup_open = true}>Sähköpostilla</button>
				</div>
			{:else}
				<h1>Hei, {$auth.displayName || $auth.email}</h1>
				{#if $auth.displayName}
					<h3>({$auth.email})</h3>
				{/if}
				<div class="actions">
					<button class="button action-btn" on:click={() => {if(confirm("Oletko varma?")){auth.signOut();}}}>
		             	Kirjaudu Ulos
		            </button>
		            {#if token}
			            <button class="button action-btn" on:click={validate}>Validoi</button>
		            {:else}
		            	<button class="button action-btn" disabled>Ladataan...</button>
		            {/if}
	            </div>
	            {#if validation_result}
					{#if validation_result.ok}
						{#await validation_result.json()}
							<p>{validation_result.status}: ladataan dataa...</p>
						{:then data}
							<p>Kaikki OK</p>
						{/await}
					{:else}
						<div style="text-align: center;">
							<p>Virhe.</p>
							{#await validation_result.json()}
								<p>{validation_result.status}: ladataan dataa...</p>
							{:then data}
								<p class="error">{data.message}</p>
							{/await}
						</div>
					{/if}
	            {/if}
			{/if}
		<a href="/">Takaisin OispaHallaan</a>
		{/if}
	{:else}
		<p>Ladataan...</p>
	{/if}
</main>

<style>
	h1 {
		margin: 0;
	}
	h3 {
		margin: 0;
		opacity: .5;
		margin-top: -.5em;
	}
	main {
		background: var(--background);
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;

		padding-inline: .5em;
		gap: .5em;

		min-height: 100vh;
	}

	.error {
		background-color: #111;
		color: red;
		padding: .2em 1em;
		border-radius: .25rem;
	}
</style>