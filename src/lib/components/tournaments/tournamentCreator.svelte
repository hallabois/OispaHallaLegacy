<script lang="ts">
    import { token } from "$lib/Auth/authstore";

    import { createTournament, type createResponse, joinGame, gamemode_0_goals, gamemode_0_names } from "$lib/tournamentstore";
    let name: string;
    let create_public = true;
    let max_clients = 4;
    let password: string | null;
    let gamemode: number;

    let gamemode_0_goal: number = 256;

    
    $: t_valid = create_public != null && (!create_public || (name != null && name.length > 0)) && max_clients != null && max_clients > 0;

    let createRequest: Promise<createResponse> | null;
    function createT() {
        if($token == null) {
            alert("Virheellinen sisäänkirjautuminen");
            return;
        }
        createRequest = createTournament(
            create_public ? name : "Yksityinen Peli",
            create_public,
            max_clients,
            password,
            {
                gamemode: gamemode,
                goal: gamemode_0_goal
            },
            $token
        );
    }
</script>

<main>
    {#if createRequest}
        {#await createRequest}
            <p>Luodaan peliä...</p>
        {:then data}
            <p>DEBUG: {data.status_code}</p>
            {#if data.success}
                <p>Peli luotu!</p>
                <p>ID: {data.tournament_id}</p>
                {#await joinGame(data.tournament_id, data.join_password, true, data.edit_key)}
                    <p>Liitytään peliin...</p>
                {:then result} 
                    <p>{JSON.stringify(result)}</p>
                {/await}
            {:else if data.status_code == 1}
                <p>Nimi on jo käytössä</p>
            {:else}
                <p>Peliä luodessa sattui virhe.</p>
            {/if}
        {/await}
    {:else}
        <div class="creator">
            <h4>Asetukset</h4>
            <div class="input-section">
                <label for="ispublic">Julkinen</label>
                <input type="checkbox" id="ispublic" bind:checked={create_public} />
            </div>
            {#if create_public}
                <div class="input-section">
                    <label type="text" for="name">Pelin Nimi</label>
                    <input id="name" bind:value={name} />
                </div>
            {/if}
            <div class="input-section">
                <label for="max_clients">Pelaajien enimmäismäärä</label>
                <input type="number" id="max_clients" bind:value={max_clients} />
            </div>
            <div class="input-section">
                <label for="pswd">Salasana</label>
                <input type="password" id="pswd" bind:value={password} placeholder="Voit jättää salasanan tyhjäksi" />
            </div>
            <h4>Säännöt</h4>
            <div class="input-section">
                <label for="gamemode">Pelimuoto</label>
                <select id="gamemode" bind:value={gamemode}>
                    <option value={0}>Ensimmäinen maalissa</option>
                    <option value={null} disabled>Coming Soon™</option>
                </select>
            </div>
            {#if gamemode == 0}
                <div class="input-section">
                    <label for="goal">Maali</label>
                    <select id="goal" bind:value={gamemode_0_goal}>
                        {#each gamemode_0_goals as num}
                            <option value={num}>{gamemode_0_names[num]}</option>
                        {/each}
                    </select>
                </div>
            {/if}
            <button disabled={!t_valid} on:click={createT} class="button action-btn">Luo</button>
        </div>
    {/if}
</main>

<style>
    h4 {
        margin-top: .5em;
        margin-bottom: 0;
        text-align: center;
    }
    .creator {
        display: flex;
        flex-direction: column;
        gap: .5em;
    }
    .input-section {
        display: flex;
        align-items: center;
    }
    .input-section * {
        flex: 1;
    }
</style>