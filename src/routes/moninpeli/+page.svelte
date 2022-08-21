<script lang="ts">
    import { onMount } from "svelte";

    import Tournaments from "$lib/components/tournaments.svelte";
    import Board from "$lib/components/board/board.svelte";
    import Announcer from '$lib/components/tournaments/announcer.svelte';
    import { checkAlive, joined_game_data, poll_id_index, poll_board_string, poll_game, poll_other_boards_string, poll_send_moves, poll_success, server_status } from '$lib/tournamentstore';
    import { hac_gamestate_to_grid } from '$lib/gamelogic/utils';
    import KeyboardInputManager from '$lib/gamelogic/keyboard_input_manager';
    import type Grid from '$lib/gamelogic/grid';
    import { browser } from "$app/env";

    let app_name = "Oispa Halla";
    let app_description = "Yhdistä opettajat ja saavuta **Halla!**";
    let app_notice = "**HUOMIO**: Pelin lista opettajista on tehty täysin sattumanvaraisesti, eikä opettajia ole laitettu minkäänlaiseen paremmuusjärjestykseen. Rakastamme kaikkia opettajia sekä arvostamme kaikkien heidän työtänsä yhtä paljon ❤️.";
    let app_name_newgame = "Uusi Jakso";
    let app_name_score = "arvosana";
    let app_name_hiscore = "paras halla";

    let enableKIM = false;

    let grid: Grid|null = null;

    $: if($poll_board_string) {
        grid = hac_gamestate_to_grid($poll_board_string);
    }
    else if($joined_game_data) {
        grid = hac_gamestate_to_grid($joined_game_data.starting_state);
    }
    else {
        // enableKIM = false;
    }

    function move(direction: number) {
        if($poll_game && $poll_game.active && !$poll_game.ended) {
            BoardInstance.getGameManagerInstance().move(direction);
            console.log("server-side move called with the value", direction);
            poll_send_moves.push(direction);
            // console.info(JSON.stringify(poll_send_moves));
        }
        else {
            console.warn("Tried to move when the game hadn't started yet");
        }
    }
    $: if($poll_success && $poll_game.active) {
        window.onbeforeunload = function(e) {
            return "Oletko varma että haluat jättää pelin kesken?";
        };
        if(inputManager == null) {
            console.log("Creating server-side inputmanager...");
            inputManager = new KeyboardInputManager(inputRoot);
            inputManager.on("move", move);
            // enableKIM = true;
        }
    }
    else {
        if(browser) {
            window.onbeforeunload = null;
        }
        if(inputManager != null) {
            console.log("Destroying server-side inputmanager...");
            inputManager = null;
            // enableKIM = false;
        }
    }

    let inputManager: KeyboardInputManager|null = null;
    let inputRoot: HTMLElement;
    onMount(()=>{
        onInitDone();
    });
    let TtInstance: Tournaments;
    let AnnouncerInstance: Announcer;
    let BoardInstance: Board;

    let enableMonkey = false;
    let monkeyInterval: NodeJS.Timer|undefined;
    $: if(enableMonkey) {
        monkeyInterval = setInterval(()=>{
            move(Math.round(Math.random() * 400)%4);
        }, 500);
    }
    else {
        clearInterval(monkeyInterval);
    }
</script>

<main bind:this={inputRoot}>
    <Tournaments bind:this={TtInstance} announcer={AnnouncerInstance} />
    <Announcer bind:this={AnnouncerInstance} />
    {#if $poll_success == false}
        <p class="err">Virhe pelitietoja haettaessa!</p>
    {/if}
    {#if $server_status == false}
        <p class="err">Palvelimeen ei saada yhteyttä. <button on:click={checkAlive}>Yritä uudelleen</button></p>
    {/if}
    <div class="board-container">
        <div style="display: flex;justify-content:space-between;width:var(--field-width);">
            <div style="display: flex;align-items: end;">
                <a sveltekit:reload href="/">Takaisin yksinpeliin</a>
            </div>
            {#if $poll_success}
                <h3 style="margin:0;">{$poll_game.client_aliases[$poll_id_index]}</h3>
            {/if}
            <div style="display: flex;align-items: end;">
                <label for="monkey">Enable monkey</label>
                <input id="monkey" type="checkbox" bind:checked={enableMonkey}>
            </div>
        </div>
        <Board {enableKIM} {grid} bind:this={BoardInstance} />
        <button class="button background-none color-button" on:click={()=>{TtInstance.show()}} title="Tournament Mode">
            ⚔
        </button>
        {#if $poll_success}
            <div class="mini-container">
                {#each $poll_other_boards_string as board_string, index}
                    <div class="mini-grid">
                        <Board grid={hac_gamestate_to_grid(board_string)} />
                    </div>
                {/each}
            </div>
        {/if}
    </div>
</main>


<style>
    main {
        min-height: 100vh;

        display: grid;
        place-items: center;
    }
    .err {
        z-index: 217;
        background-color: red;
        color: black;
        text-align: center;

        position: absolute;
        top: 0;
        left: 0;
        right: 0;
    }
    .board-container {
        display: grid;
        place-items: center;
    }
    .mini-container {
        --field-width: calc(500px / 4) !important;
        --grid-gap: calc(15px / 4);
        --tile-size: calc(calc(var(--field-width) - calc(var(--grid-gap) * calc(var(--grid-size) + 1))) / var(--grid-size));

        display: flex;
        gap: .5em;
    }
    .mini-grid {
        width: var(--field-width);
        height: var(--field-width);
        overflow: hidden;
    }
    :global(.mini-container .tile-inner) {
        animation: none !important;
        -moz-animation: none !important;
        -webkit-animation: none !important;
    }
    .patches {
        height: 0;
        width: 0;
    }
</style>
<div class="patches">
    <script src="/js/application.js"></script>
    <div class="preload-container" />
</div>