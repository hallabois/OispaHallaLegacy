<script lang="ts">
    import { onMount } from "svelte";

    import { auth } from "$lib/Auth/authstore";

    import Popup from "$lib/components/common/popup/popup.svelte";
    import { checkAlive, joined_game_id, joined_game_error, poll_success, poll_game, joined_game_user_id, joined_game_am_host, joined_game_host_pswds, refreshGameData } from "$lib/tournamentstore";
    import TournamentCreator from "./tournaments/tournamentCreator.svelte";
    import TournamentBrowser from "./tournaments/tournamentBrowser.svelte";
    import Lobby from "./tournaments/lobby.svelte";
    import TournamentJoiner from "./tournaments/tournamentJoiner.svelte";
    import type Announcer from "./tournaments/announcer.svelte";

    export let open = false;
    export function show() {
        open = true;
        checkServerAlive();
    }

    export let announcer: Announcer|null = null;
    let chosen_game: string|null|undefined = null;

    let serverAlive: boolean|null;
    async function checkServerAlive() {
        serverAlive = await checkAlive();
    }

    $: if($joined_game_id != null && !window.location.href.endsWith("/moninpeli")) {
        console.log("Moving to multiplayer...");
        let data = {
            "game_id": $joined_game_id,
            "user_id": $joined_game_user_id,
            "am_host": $joined_game_am_host,
            "host_pswd": joined_game_host_pswds[$joined_game_id]
        };
        localStorage["mp_data"] = JSON.stringify(data);
        window.location.href = `/moninpeli`;
    }

    let activeTab = 0;
    let wasActive = false;
    let hadEnded = false;
    $: if($poll_success && $poll_game) {
        if($poll_game.active && !wasActive) {
            open = false;
            wasActive = true;
            if(announcer) {
                announcer.announce("Peli on alkanut!");
            }
        }
        else if(!$poll_game.active){
            wasActive = false;
        }

        if($poll_game.ended && !hadEnded) {
            open = true;
            hadEnded = true;
            if(announcer) {
                announcer.announce("Peli on päättynyt!");
            }
        }
    }
    else {
        wasActive = false;
        hadEnded = false;
    }

    onMount(()=>{
        if(window.location.href.includes("?")) {
            const params = new URLSearchParams(window.location.search);
            let game_id = params.get("game_id");
            if(game_id) {
                chosen_game = game_id;
                activeTab = 2;
                show();
            }
            
            // @ts-ignore
            history.pushState({}, null, window.location.href.split("?")[0]);
        }
        else{
            if(localStorage["mp_data"] != null && window.location.href.endsWith("/moninpeli")) {
                let data = JSON.parse(localStorage["mp_data"]);
                if(data) {
                    console.log("READ MP_DATA", data);

                    joined_game_id.set(data.game_id);
                    joined_game_user_id.set(data.user_id);
                    joined_game_am_host.set(data.am_host);
                    joined_game_host_pswds[data.game_id] = data.host_pswd;
                    refreshGameData();

                    // localStorage["mp_data"] = null;
                    show();
                }
            }
        }
    });
</script>

<Popup bind:open>
    <span slot="title">Moninpeli</span>
    <div slot="content">
        {#if $auth}
            <p>Kirjautuneena sisään: {$auth.displayName || $auth.email}</p>
            {#if serverAlive}
                {#if $joined_game_id != null}
                    <Lobby {announcer} />
                {:else}
                    {#if !activeTab || activeTab == 0}
                        <div class="action-chooser">
                            <button on:click={()=>{activeTab = 1}} class="button action-btn">Luo Peli</button>
                            <button on:click={()=>{activeTab = 2}} class="button action-btn">Liity Peliin Koodilla</button>
                            <button on:click={()=>{activeTab = 3}} class="button action-btn">Selaa Julkisia Pelejä</button>
                        </div>
                        <a href="/auth" style="text-align: center;display: block;padding: 0.75em;">Hallinnoi kirjautumista</a>
                    {:else}
                        <button class="button action-btn back" on:click={()=>{activeTab = 0;joined_game_error.set(null)}}>&lt; Takaisin</button>
                        {#if activeTab == 1}
                            <TournamentCreator />
                        {/if}
                        {#if activeTab == 2}
                            <TournamentJoiner {chosen_game} />
                        {/if}
                        {#if activeTab == 3}
                            <TournamentBrowser />
                        {/if}
                    {/if}
                {/if}
            {:else if serverAlive == null}
                <h3>Otetaan yhteyttä palvelimeen...</h3>
            {:else}
                <h3>Palvelimeen ei saatu yhteyttä.</h3>
                <button on:click={checkServerAlive}>Yritä uudelleen</button>
            {/if}
        {:else}
            {#if $auth === undefined}
                <p style="text-align: center;display: block;padding: 0.75em;">Tarkistetaan tietoja</p>
            {:else}
                <button on:click={()=>{window.location.href="/auth"}} class="button action-btn" style="width: 100%;">Kirjaudu sisään</button>
            {/if}
        {/if}
    </div>
</Popup>

<style>
    .action-chooser {
        display: flex;
        flex-direction: column;
        gap: .5em;
        margin-top: .5em;
    }
    .back {
        font-size: .75em;
    }
</style>