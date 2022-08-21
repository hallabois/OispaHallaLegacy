<script lang="ts">
    import { auth, token } from "$lib/Auth/authstore";

    import Popup from "./common/popup/popup.svelte";
    import type Announcer from "./tournaments/announcer.svelte";
    import {lb_screenName, check_server_alive, submit_score, get_top_scores, get_my_top_score, Score_error, my_top_scores, my_top_submitted_scores, my_top_score_histories, get_score_placement} from "$lib/leaderboardstore";
    import { scale } from "svelte/transition";
    import type GameManager from "$lib/gamelogic/game_manager";

    export let GameManagerInstance: GameManager | null = null;
    function submitUnsubmittedTopScores() {
        if(GameManagerInstance != null) {
            for(let s of [3, 4]) {
                let top_saved = $my_top_scores[s] || -1;
                let top_submitted = $my_top_submitted_scores[s] || -1;
                if(GameManagerInstance?.size == s && GameManagerInstance?.score >= top_saved) {
                    // Do nothing, as the top scoring game is not over yet.
                }
                else if(top_saved > top_submitted) {
                    console.info(`Please submit score for size ${s}...`);
                    submitting = true;
                    size = s;
                    show();
                    return;
                }
            }
        }
    }
    function markAsSubmitted(s: number) {
        $my_top_submitted_scores[s] = $my_top_scores[s] as number;
        submitting = false;
    }
    function getHACString(run: any[]) {
        return size + "x" + size + "S" + run.join(":");
    }
    let submit_in_progress = false;
    async function submit() {
        submit_in_progress = true;
        let starting_size = size;
        let result = await submit_score(starting_size, $token, $lb_screenName as string, $my_top_scores[starting_size] as number, 0, getHACString($my_top_score_histories[starting_size]));
        submit_in_progress = false;
        console.info("submit result", result);
        if(result.message) {
            if(announcer) {
                announcer.announce(result.message);
            }
        }
        if(result.success) {
            markAsSubmitted(starting_size);
        }
    }
    function submitUnsubmittedTopScoresIfAlive() {
        check_server_alive().then((alive)=>{
            if(alive) {
                submitUnsubmittedTopScores();
            }
        });
    }
    $: if($my_top_scores && $my_top_submitted_scores && open != null) {
        submitUnsubmittedTopScoresIfAlive();
    }

    export let open = false;
    export let size = 4;
    export let submitting = false;
    export function show() {
        open = true;
        submitUnsubmittedTopScoresIfAlive();
    }

    function editScreenName() {
        let new_name = prompt("Uusi nimimerkki", $lb_screenName || undefined);
        if(new_name && new_name != $lb_screenName) {
            lb_screenName.set(new_name);
            if(announcer) {
                announcer.announce("Nimimerkki muuttuu seuraavan tallennuksen yhteydessä."); // Muuttuu seuraavan tallennuksen yhteydessä
            }
        }
        else {
            if(announcer) {
                announcer.announce("Nimimerkki ei muuttunut");
            }
        }
    }

    export let announcer: Announcer|null = null;
    let refreshKey = {}; // Every {} is unique
</script>

<Popup bind:open>
    <span slot="title">Leaderboards {size}x{size}</span>
    <div slot="content" class="content">
        {#key refreshKey}
            {#await check_server_alive()}
                <p>Otetaan yhteyttä palvelimeen...</p>
            {:then alive}
                {#if alive}
                    {#if submitting}
                        <p>Tallennetaas sun tulos!</p>
                        {#if $lb_screenName != null}
                            <button disabled={submit_in_progress} on:click={submit} class="button action-btn" style="width: 100%;">{submit_in_progress ? "Tallennetaan..." : "Tallenna"}</button>
                            <button on:click={()=>{submitting = false;}} class="button" style="width: 100%;font-weight: normal !important;">Älä Tallenna Vielä</button>
                            <button on:click={()=>{markAsSubmitted(size)}} class="button" style="width: 100%;font-weight: normal !important;">Merkitse tallennetuksi (indev)</button>
                        {/if}
                    {:else}
                        <div class="size-selection">
                            {#each [3, 4] as s}
                                <button class="button action-btn" on:click={()=>{size = s;}} disabled={size == s}>{s}</button>
                            {/each}
                        </div>
                        <div style="height: 300px;overflow-y: scroll;">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Sija</th>
                                        <th>Pisteet</th>
                                        <th>Nimi</th>
                                    </tr>
                                </thead>
                                {#await get_top_scores(size, 10)}
                                    <!-- skeleton -->
                                    <tbody>
                                        {#each new Array(10) as index}
                                            <tr>
                                                <td>...</td>
                                                <td>....</td>
                                                <td>.....</td>
                                            </tr>
                                        {/each}
                                    </tbody>
                                {:then top}
                                    <tbody>
                                        {#each top as entry, index}
                                            <tr in:scale={{delay: 100*index}}>
                                                <td>{index+1}.</td>
                                                <td>{entry.score}</td>
                                                <td>{entry.user ? entry.user.screenName : "[Virheellinen nimi]"}</td>
                                            </tr>
                                        {/each}
                                    </tbody>
                                {/await}
                            </table>
                        </div>
                        {#if $token != null}
                            {#await get_my_top_score(size, $token)}
                                <p>Ladataan tuloksiasi...</p>
                            {:then result} 
                                {#if !result.success}
                                    <p>Et ole tallentanut yhtäkään tulosta sarjaan "{size}"</p>
                                {:else}
                                    <div class="my-results">
                                        <table>
                                            <tr>
                                                {#await get_score_placement(size, result.user.screenName)}
                                                    <td>...</td>
                                                {:then placement} 
                                                    <td>{placement}</td>
                                                {/await}
                                                <td>{result.score}</td>
                                                <td>{result.user.screenName}</td>
                                            </tr>
                                        </table>
                                    </div>
                                {/if}
                            {/await}
                        {/if}
                    {/if}
                    <div>
                        {#if $auth}
                            {#if $lb_screenName}
                                <button on:click={editScreenName} class="button action-btn" style="width: 100%;">Muuta nimimerkkiä "{$lb_screenName}"</button>
                            {:else}
                                <button on:click={editScreenName} class="button action-btn" style="width: 100%;">Lisää nimimerkki</button>
                            {/if}
                            <a href="/auth" style="text-align: center;display: block;padding: 0.75em;">Hallinnoi kirjautumista</a>
                        {:else}
                            {#if $auth === undefined}
                                <p style="text-align: center;display: block;padding: 0.75em;">Tarkistetaan tietoja</p>
                            {:else}
                                <button on:click={()=>{window.location.href="/auth"}} class="button action-btn" style="width: 100%;">Kirjaudu sisään</button>
                            {/if}
                        {/if}
                    </div>
                {:else}
                    <p>Virhe otettaessa yhteyttä palvelimeen.</p>
                    <button class="button action-btn" on:click={()=>{refreshKey = {};}}>Yritä uudelleen</button>
                {/if}
            {/await}
        {/key}
    </div>
</Popup>

<style>
    .size-selection {
        display: flex;
        gap: .5em;
        flex-wrap: wrap;
    }
    .size-selection * {
        flex: 1;
    }
    table {
        width: 100%;

        border: 1px solid;
        border-collapse: collapse;

        text-align: left;

        max-height: 200px;
        overflow-y: scroll;
    }
    td, th {
        padding: .25em .5em;
    }
    td {
        border: 1px solid;
    }
    .content {
        display: flex;
        flex-direction: column;
        gap: .5em;
    }
</style>