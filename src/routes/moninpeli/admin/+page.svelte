<script lang="ts">
    import { tournament_endpoint } from "$lib/tournamentstore";
    let refreshKey = {};
    let admin_token: string;
    let admin_token_checking = false;
    let admin_token_valid = false;
    $: {
        if(admin_token != null && admin_token != "" && admin_token.length > 2) {
            admin_token_checking = true;
            testAdminToken().then((v) => {
                admin_token_valid = v;
                admin_token_checking = false;
            });
        }
        else{
            admin_token_valid = false;
            admin_token_checking = false;
        }
    }
    $: if(!admin_token_valid) {
        selected_game = null;
        action_status = null;
    }

    let action_status: null | boolean = null; // Null: Clear, true: OK, false: Error

    function confirm_action() {
        let answer = prompt("Please retype the admin token");
        return answer === admin_token;
    }

    async function testAdminToken() {
        let result = await fetch(`${tournament_endpoint}/admin/games/0/${admin_token}`);
        return result.ok || result.status != 401;
    }

    async function getGames() {
        return fetch(`${tournament_endpoint}/admin/games/${admin_token}`);
    }

    async function getGameDetails(game_id: string) {
        return fetch(`${tournament_endpoint}/admin/games/${game_id}/${admin_token}`);
    }

    async function deleteAllGames() {
        if(confirm_action()) {
            console.log("Confirmation received, deleting all games...");
            let result = await fetch(`${tournament_endpoint}/admin/clean/${admin_token}`, {
                method: 'DELETE'
            });
            console.log("Deletion request result:", result);
            action_status = result.ok;
            refreshKey = {};
        }
    }
    async function deleteGame(game_id: string) {
        if(confirm_action()) {
            console.log(`Confirmation received, deleting game ${game_id}...`);
            let result = await fetch(`${tournament_endpoint}/games/${game_id}/delete`, {
                method: 'POST',
                body: JSON.stringify({
                    "edit_key": admin_token
                }),
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            console.log("Deletion request result:", result);
            action_status = result.ok;
            refreshKey = {};
        }
    }
    async function startGame(game_id:string) {
        if(confirm_action()) {
            console.log(`Confirmation received, starting game ${game_id}...`);
            let result = await fetch(`${tournament_endpoint}/games/${game_id}/start`, {
                method: 'POST',
                body: JSON.stringify({
                    "edit_key": admin_token
                }),
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            console.log("Activation request result:", result);
            action_status = result.ok;
            refreshKey = {};
        }
    }

    let selected_game: string | null;
    
</script>

<svelte:head>
    <title>OHTS Admin Panel</title>
</svelte:head>

<main>
    {#if action_status != null}
        <div class="action"
            on:click={()=>{action_status = null}}
        >
            {#if action_status}
                <p class="success">Action successful!</p>
            {:else}
                <p class="error">Error completing action, check the console for details.</p>
            {/if}
        </div>
    {/if}
    <div class="header">
        <div class="header-bar">
            <h1>OispaHalla™ Multiplayer Admin Panel</h1>
        </div>
        {#if admin_token_valid}
            <div class="actions">
                <button on:click={deleteAllGames}>Delete ALL Games</button>
                <button
                    on:click={
                        ()=>{
                            admin_token = "";
                        }
                    }
                >Log Out</button>
                <button on:click={()=>{refreshKey = {};}}>Refresh data</button>
            </div>
        {/if}
        <hr />
    </div>
    {#if admin_token_valid}
        {#key refreshKey}
            {#await getGames()}
                <div class="content">
                    <p>Loading games</p>
                </div>
            {:then resp} 
                {#if resp.ok}
                    {#await resp.json()}
                        <div class="content">
                            <p>Parsing JSON</p>
                        </div>
                    {:then data}
                        {#if data.ongoing_games && data.ongoing_games.length > 0}
                            <div class="data-view">
                                <div class="games">
                                    <table>
                                        <thead>
                                            <tr class="head">
                                                {#each Object.keys(data.ongoing_games[0]) as key}
                                                    <th>{key}</th>
                                                {/each}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {#each data.ongoing_games as game}
                                                <tr class="game"
                                                    on:click={()=>{
                                                        selected_game = game.id;
                                                    }}
                                                    class:selected={
                                                        selected_game === game.id
                                                    }
                                                >
                                                    {#each Object.keys(game) as key}
                                                        <td>{game[key]}</td>
                                                    {/each}
                                                </tr>
                                            {/each}
                                        </tbody>
                                    </table>
                                </div>
                                {#if selected_game != null}
                                    <div class="game-inspector">
                                        {#await getGameDetails(selected_game)}
                                            <p class="message">Loading game {selected_game}</p>
                                        {:then response} 
                                            {#if response.ok}
                                                {#await response.json()}
                                                    <p class="message">Parsing JSON</p>
                                                {:then json} 
                                                    {#if json.data}
                                                        {@const game_data = JSON.parse(json.data)}
                                                        <div style="display: flex;gap: .5em;align-items: center;">
                                                            <button on:click={()=>{selected_game = null;}}>×</button>
                                                            <h3>Game {selected_game}: "{game_data.name}"</h3>
                                                        </div>
                                                        <div>
                                                            <button on:click={()=>{deleteGame(selected_game||"")}}>Delete</button>
                                                            {#if !game_data.active}
                                                                <button on:click={()=>{startGame(selected_game||"")}}>Start</button>
                                                            {/if}
                                                        </div>
                                                        <table>
                                                            {#each Object.keys(game_data) as game_key}
                                                                <tr>
                                                                    <td>{game_key}</td>
                                                                    <td>{game_data[game_key]}</td>
                                                                </tr>
                                                            {/each}
                                                        </table>
                                                    {:else}
                                                        <p class="message">Invalid data</p>
                                                    {/if}
                                                {/await}
                                            {:else}
                                                <p class="message">Error fetching game details: {response.statusText}</p>
                                            {/if}
                                        {/await}
                                    </div>
                                {/if}
                            </div>
                        {:else}
                            <div class="content">
                                <p>No games atm</p>
                            </div>
                        {/if}
                    {/await}
                {:else}
                    <p>Failed to get games: {resp.statusText}</p>
                {/if}
            {/await}
        {/key}
    {:else}
        <div class="content sign-in">
            <label for="admin_token">Please input the admin token</label>
            <!-- svelte-ignore a11y-autofocus -->
            <input
                id="admin_token"
                type="password"
                bind:value={admin_token}
                autofocus
            />
            {#if admin_token_checking}
                <p>checking...</p>
            {:else}
                <p style="visibility: hidden;">.</p>
            {/if}
        </div>
    {/if}
</main>

<style>
    :global(html, body) {
        color-scheme: dark;
        background: #222 !important;
        color: #ddd !important;
    }
    .action {
        position: fixed;
        top: 0;
        right: 0;
        left: 0;
        text-align: center;
        padding-block: .5em;

        cursor: pointer;
    }
    .action .success {
        color: #4D4;
    }
    .action .error {
        color: #D44;
    }
    main {
        height: 100vh;
        --header-height: 100px;

        color: #e6d2bf;
    }
    .header {
        height: var(--header-height);
    }
    .header-bar {
        display: flex;
        flex-wrap: wrap;
        padding: .5em;
        padding-bottom: 0;
        margin: 0;
        align-items: center;
        justify-content: space-between;
    }
    .actions {
        margin: .5em;
        margin-top: 0;
    }
    .content {
        flex: 1;
        height: calc(100vh - var(--header-height));

        display: flex;
        flex-direction: column;
        flex-wrap: wrap;
        justify-content: center;
        align-items: center;
        gap: .5em;
    }

    .data-view {
        height: calc(100vh - var(--header-height));

        display: flex;
        flex-direction: column;
        /* flex-wrap: wrap; */
    }

    .games {
        flex: 1;
        overflow-x: scroll;
    }
    table{
        width: 100%;
        border-collapse: collapse;
    }
    tbody {
        overflow-y: scroll;
    }
    td, th {
        border: 1px solid #e6d2bf22;
        text-align: left;
        padding: 8px;

        overflow: scroll;
    }
    tr:nth-child(even) {
        background-color: #e6d2bf22;
    }
    tr.game {
        cursor: pointer;
    }
    tr.game:hover, tr.game.selected {
        background-color: #e6d2bf55;
    }

    .game-inspector {
        flex: 1;

        padding: 1em;
        display: flex;
        flex-direction: column;
        /* flex-wrap: wrap; */

        overflow-y: scroll;
    }
    .game-inspector p.message {
        flex: 1;

        height: 100%;
        width: 100%;

        display: flex;
        justify-content: center;
        align-items: center;
    }

    h1, h2, h3 {
        margin: 0;
    }
    hr {
        margin: 0;
    }
    p {
        margin: 0;
        line-height: 1;
    }
</style>