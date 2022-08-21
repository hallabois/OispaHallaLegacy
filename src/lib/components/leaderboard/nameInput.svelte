<script lang="ts">
    import { onMount } from "svelte";
    let mounted = false;

    export let display_name = "";
    export let show_title = true;
    $: if(mounted && display_name != null){
        localStorage.display_name = display_name;
    }
    export let correct_name = "";
    $: correct_name = display_name ? [...display_name.matchAll(/[\wÅÄÖåäö]{3,20}/g)].join(" ") : "";

    onMount( ()=>{mounted=true} );
</script>
<div class="name-form-container">
    {#if show_title}<h4 class="name-form-title">Muuta Käyttäjänimeäsi:</h4>{/if}
    <form id="lb-name-form" class="name-form">
        <div class="name-form-div">
            <label for="lb-name">Nimi:</label>
            <input type="text" id="lb-name" placeholder="Käyttäjänimi" minlength="3" maxlength="20" required bind:value={display_name}>
            {#if display_name == null || display_name != correct_name || display_name.length == 0}
                {#if display_name == null || display_name.length < 3}
                    <p class="err">liian lyhyt nimi!</p>
                {:else if display_name.length > 20}
                    <p class="err">liian pitkä nimi!</p>
                {:else}
                    <p class="warn">muokataan muotoon "{correct_name}"</p>
                {/if}
            {/if}
        </div>
    </form>
    <p id="name-error" class="lb-error"></p>
</div>

<style>
    .warn{
        margin-bottom: 0;
        color: #ff6c00;
        font-size: 0.9em;
    }
    .err{
        margin-bottom: 0;
        color: #ff0000;
        font-size: 0.9em;
    }
</style>