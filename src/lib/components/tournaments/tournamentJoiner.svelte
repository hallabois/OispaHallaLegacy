<script lang="ts">
    import { fade } from "svelte/transition";
    import { joinGame, getGameData, joined_game_error } from "$lib/tournamentstore";

    export let chosen_game: string|number|any[]|null = null;
    let requires_password = false;
    let password;
    let canJoin = false;
    $: game_id_valid = chosen_game != null && chosen_game.length > 0 && !isNaN(chosen_game) && !isNaN(parseFloat(chosen_game));
    $: if(chosen_game && game_id_valid) {
        let data = getGameData(chosen_game).then((data)=>{
            if(data) {
                requires_password = data.requires_password;
                if(!requires_password) {
                    canJoin = true;
                }
            }
            else {
                canJoin = false;
                requires_password = false;
            }
        })
    }
    else {
        canJoin = false;
        requires_password = false;
    }
    $: if(requires_password && password) {
        canJoin = password != null && password.length > 0;
    }
</script>

<main>
    <!-- svelte-ignore a11y-autofocus -->
    <input bind:value={chosen_game} placeholder="Kirjoita liittymiskoodi tähän" autofocus/>
    {#if requires_password}
        <input bind:value={password} placeholder="Peli vaatii salasanan"/>
    {/if}
    {#if $joined_game_error}
        <div class="err" transition:fade|local>
            <p>Virhe: {$joined_game_error}</p>
            <spacer />
            <button on:click={()=>{joined_game_error.set(null)}}>×</button>
        </div>
    {/if}
    <button disabled={!canJoin} on:click={()=>{joinGame(chosen_game, password)}} class="button action-btn fill-w">Liity</button>
</main>

<style>
    main {
        display: flex;
        flex-direction: column;
        gap: .5em;
        margin-top: 1em;
    }
    .fill-w {
        width: calc(100%);
    }
    input {
        width: calc(100% - 2em);
        padding: .25em 1em;
        font-size: 1.15em;
    }
    .err {
        color: red;
        display: flex;
        align-items: baseline;
    }
    spacer {
        flex: 1;
    }
</style>