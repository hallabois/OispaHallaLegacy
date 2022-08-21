<script lang="ts">
    import { fade, slide } from "svelte/transition";
    import { getPublicTournaments, joined_game_host_pswds, joinGame, joined_game_error, TournamentInfo } from "$lib/tournamentstore";


    let filter: string|null;
    let chosen_game: number|null;
    let game_requires_password = false;
    let passwords: {[key: number]: string} = {};
    $: canJoin = chosen_game != null && !(game_requires_password && (passwords[chosen_game] == null || passwords[chosen_game] == ""));

    function selectGame(game: TournamentInfo) {
        chosen_game = game.id;
        game_requires_password = game.requires_password;
    }
</script>

<main>
    {#await getPublicTournaments()}
        <p>Haetaan pelejä...</p>
    {:then result} 
        <p>DEBUG: {result.status_code}</p>
        {#if result.success}
            <div>
                <p>Löydettiin {result.ongoing_games.length} {result.ongoing_games.length == 1 ? "julkinen peli" : "julkista peliä"}!</p>
                <input class="search" bind:value={filter} placeholder="Hae pelejä nimen perusteella" />
            </div>
            <hr />
            <div class="games">
                {#each result.ongoing_games.filter(x=>filter==null||(x.name).includes(filter)||chosen_game == x.id) as game, index}
                    <div class="game" class:selected={chosen_game == game.id} on:click={()=>{selectGame(game)}} title={game.id+""}>
                        <p>{game.name}</p>
                        <spacer />
                        {#if Object.keys(joined_game_host_pswds).includes(game.id+"")}
                            <p title="Olet tämän pelin luoja">👑</p>
                        {/if}
                        {#if game.requires_password}
                            <p title="Tähän peliin liittyminen vaatii salasanan">🔐</p>
                        {/if}
                        <p>{game.clients}/{game.max_clients} {game.clients == 1 ? "pelaaja " : "pelaajaa"}</p>
                    </div>
                    {#if game.requires_password && chosen_game == game.id}
                        <div>
                            <label for="pswd">Salasana:</label>
                            <!-- svelte-ignore a11y-autofocus -->
                            <input bind:value={passwords[game.id]} autofocus />
                        </div>
                    {/if}
                {/each}
            </div>
            <hr />
            {#if $joined_game_error}
                <div class="err" transition:fade|local>
                    <p>Virhe: {$joined_game_error}</p>
                    <spacer />
                    <button on:click={()=>{joined_game_error.set(null)}}>×</button>
                </div>
            {/if}
            <button disabled={!canJoin} on:click={()=>{joinGame(chosen_game, passwords[chosen_game])}} class="button action-btn fill-w">Liity</button>
        {/if}
    {/await}
</main>

<style>
    .fill-w {
        width: calc(100%);
    }
    .search {
        width: calc(100% - 2em);
        padding: .25em 1em;
    }
    .games {
        max-height: 30vh;
        min-height: 2em;
        overflow-y: auto;

        display: flex;
        flex-direction: column;
        gap: .25em;
    }
    .game {
        display: flex;
        align-items: center;
        gap: .5em;

        padding: .5em 1em;
        border-radius: .25em;
        cursor: pointer;
        transition: background 200ms, color 200ms;
    }
    .game:hover {
        background: var(--background);
    }
    .game.selected {
        background: var(--color);
        color: var(--background);
    }
    .game p {
        margin: 0;
    }
    spacer {
        flex: 1;
    }
    hr {
        margin-block: .5em;
    }
    .err {
        color: red;
        display: flex;
        align-items: baseline;
    }
</style>