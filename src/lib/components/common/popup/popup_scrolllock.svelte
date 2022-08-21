<script lang="ts">
    import { browser } from "$app/env";
    import { open_popups } from "$lib/popupstore";

    $: if(browser && $open_popups.length > 0) {
        document.querySelector("html").style.overflowY = "hidden";
    }
    else if(browser) {
        document.querySelector("html").style.overflowY = "unset";
    }
</script>

<main></main>