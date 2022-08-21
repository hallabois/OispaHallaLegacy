<script lang="ts">
    import { onMount } from "svelte";
    import { draw } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';

    export let d = null;
    export let show_stroke = false;
    export let stroke = "none";
    export let stroke_width = "0.5";
    export let fill = "var(--color)";
    export let fill_opacity = "1.0";
    export let animation_length = 1500;

    export let text = null;
    export let text_id = "";
</script>

<main style="--duration:{animation_length/10}ms;--s-width:{stroke_width}px">
    {#if d != null}
        <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 24 24">
            <path transition:draw="{{duration: animation_length, easing: quintOut}}"
                    d={d}
                    fill={fill}
                    fill-opacity={fill_opacity}
                    stroke="none"
            />
            {#if show_stroke}
                <path transition:draw="{{duration: animation_length, easing: quintOut}}"
                    d={d}
                    fill="none"
                    stroke={stroke}
                    stroke-width={stroke_width + "px"}
                />
            {/if}
        </svg>
    {/if}
    {#if text != null}
        <span id={text_id}>{text}</span>
    {/if}
</main>

<style>
    main {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 100%;
    }
    path {
        transition: fill-opacity var(--duration), stroke-width var(--duration);
        stroke-width: var(--s-width);
    }
</style>