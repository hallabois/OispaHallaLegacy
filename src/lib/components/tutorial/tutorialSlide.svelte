<script lang="ts">
    import { fly, slide, fade } from "svelte/transition";
</script>

<main>
    Content
    <slot></slot>
</main>

<style>
    main {
        height: 300px;
        width: 300px;
        box-shadow: inset .25em .25em .5em rgba(0,0,0,0.25);
    }
</style>