<script lang="ts">
    import { gamemode_0_names, host_deleteGame, host_startGame, joined_game_am_host, joined_game_data, joined_game_error, joined_game_id, leaveGame, poll_game, poll_id_index, poll_success, refreshGameData } from "$lib/tournamentstore";
    import Board from "../board/board.svelte";
    import { hac_gamestate_to_grid } from "$lib/gamelogic/utils";
    import type Announcer from "./announcer.svelte";

    export let announcer: Announcer | null = null;

    function shareGameID() {
        navigator.share({
            title: "Kutsu OispaHalla -peliin",
            text: `Liity mukaan OispaHalla -peliini koodilla ${$joined_game_id} tai alla olevan linkin kautta.`,
            url: `https://oispahalla.com/moninpeli?game_id=${$joined_game_id}`
        });
    }
    function copyGameID() {
        if(announcer) {
            navigator.clipboard.writeText(`${window.location.origin}/moninpeli?game_id=${$joined_game_id}`);
            announcer.announce("Liittymislinkki kopioitu!");
        }
    }
</script>

<main>
    {#if $joined_game_error}
        <p>Virhe pelin tietoja haettaessa: {$joined_game_error}</p>
        <button on:click={refreshGameData}>Yritä Uudelleen</button>
        <button on:click={leaveGame}>Anna Olla</button>
    {:else}
        <div class="top">
            <button class="" on:click={leaveGame}>Poistu Pelistä</button>
            {#if $joined_game_am_host}
                Järjestäjä 👑
                <button class="" on:click={host_deleteGame}>
                    Poista Peli
                </button>
            {/if}
        </div>
        <hr />
        {#if $joined_game_data}
            <p>Liitytty peliin "{$joined_game_data.name}"</p>
            <p>Liittymiskoodi: <code>{$joined_game_id}</code>
                {#if navigator.clipboard}
                    <button on:click={copyGameID}>Kopioi linkki</button>
                {/if}
                {#if navigator.share}
                    <button on:click={shareGameID}>Jaa kutsu</button>
                {/if}
            </p>
            {#if $joined_game_data.gamemode == 0}
                <p style="max-width:430px;">Pelaaja joka saavuttaa ensimmäisenä laatan <b style="white-space: nowrap;">{$joined_game_data.gamemode_goal} ({gamemode_0_names[+$joined_game_data.gamemode_goal]})</b> voittaa.</p>
            {/if}
            <div class="data">
                <div>
                    <h3>Aloitustilanne</h3>
                    <div class="game-preview">
                        <Board grid={hac_gamestate_to_grid($joined_game_data.starting_state)} />
                    </div>
                </div>
                <div>
                    {#if $poll_success}
                        <h4>{$poll_game.clients} {$poll_game.clients == 1 ? "pelaaja" : "pelaajaa"}</h4>
                        <div style="max-height:300px;overflow-y: auto;">
                            {#each $poll_game.client_aliases as player_name, index}
                                <p>
                                    {player_name}
                                    {#if index == $poll_id_index}
                                        (sinä)
                                    {/if}
                                </p>
                            {/each}
                        </div>
                    {/if}
                </div>
            </div>
        {:else}
            <p>Ladataan pelin tietoja...</p>
            <div class="data">
                <div>
                    <h3>...</h3>
                    <div class="game-preview"></div>
                </div>
                <div>
                    <h3>...</h3>
                </div>
            </div>
        {/if}
        {#if $joined_game_am_host && $poll_success}
            <div class="start">
                <button
                    style="width:100%;"
                    class="button action-btn"
                    on:click={host_startGame}
                    disabled={$poll_game.active || $poll_game.ended}
                >
                    {$poll_game.ended ? "Peli on päättynyt!" : $poll_game.active ? "Peli on alkanut!" : "Aloita Peli"}
                </button>
            </div>
        {/if}
        {#if !$joined_game_am_host && $poll_success}
            <div class="start">
                <p style="width: 100%;text-align:center;">
                    {$poll_game.ended ? "Peli on päättynyt!" : $poll_game.active ? "Peli on alkanut!" : "Odotetaan pelin alkua..."}
                </p>
            </div>
        {/if}
    {/if}
</main>

<style>
    .top {
        display: flex;
        justify-content: space-between;
    }
    .data {
        display: flex;
        flex-wrap: wrap;
        gap: 1em;
    }
    .game-preview {
        --field-width: 300px !important;
        --tile-size: calc(calc(var(--field-width) - calc(var(--grid-gap) * calc(var(--grid-size) + 1))) / var(--grid-size));
        overflow: hidden;
        display: block;
        width: 300px;
        height: 300px;
        border-radius: 6px;
    }
    .start {
        margin-top: 1em;
    }
    hr {
        margin-block: .25em;
    }
</style>
