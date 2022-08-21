<!-- Explain what global variables are to typescript -->
<script context="module" lang="ts">
    declare var GameManagerInstance: any;
    declare var base_path: string;
</script>
<!-- / -->
<script lang="ts">
    import { browser } from "$app/env";
    import { open_popups } from "$lib/popupstore";
    import { onMount } from "svelte";
    import { fade } from "svelte/transition";
    export let open = false;

    let input_enabled = true; // tän vois siirtää inputManageriin
    $: if(mounted && window != null && open != null){
        (window as any).isLeaderboardOpen = open;
        if(typeof GameManagerInstance !== "undefined" && GameManagerInstance != null){
            if(open && input_enabled == true){
                GameManagerInstance.inputManager.removeKeydownHandler()
                input_enabled = false;
            }
            else if(!open && input_enabled == false){
                GameManagerInstance.inputManager.addKeydownHandler();
                input_enabled = true;
            }
        }
    }

    let my_key = {}; // All objects are unique
    $: if(open && browser) {
        if(!$open_popups.includes(my_key)) {
            open_popups.set( [...$open_popups, my_key] );
        }
    }
    else if(browser) {
        if($open_popups.includes(my_key)) {
            open_popups.set($open_popups.filter(x=>x!==my_key));
        }
    }

    let mounted = false;
    onMount(()=>{
        mounted = true;
    });
</script>

{#if open}
    <main class="lb-popup" on:click={()=>{open = false;}} out:fade>
        <div class="lb-popup-container" on:click={(e)=>{e.stopPropagation();}}>
            <div class="popup">
                <div class="lb-header">
                    <h2 class="lb-title">
                        <slot name="title">
                            This is a generic popup.
                        </slot>
                    </h2>
                    <div class="lb-buttons">
                        <slot name="buttons">
                            <button title="Sulje ikkuna" class="button background-none color-button" on:click={()=>{open=false;}}>×</button>
                        </slot>
                    </div>
                </div>
                <div class="lb-content">
                    <slot name="content">
                        <p>Please fill me with content.</p>
                    </slot>
                </div>
            </div>
        </div>
    </main>
{/if}

<style lang="scss">
    .popup {
        display: flex;
        flex-direction: column;
        max-height: 100vh;
    }
    .lb-content {
        overflow-y: auto;
    }

    h2.lb-title {
        margin-bottom: 0;
    }
    button {
        color: var(--color);
    }

    @media (max-width: 600px) {
        .lb-popup-container{
            height: 100vh !important;
            width: 100vw !important;
            margin: 0 !important;
        }
        .popup{
            flex-direction: column-reverse;
            height: 100%;
        }
        .lb-header {
            margin-bottom: .75em;
        }
    }
</style>