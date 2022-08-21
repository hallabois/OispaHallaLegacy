<!-- / -->
<script lang="ts">
    import { slide, scale } from "svelte/transition";
    import { theme_index, base_path } from "$lib/themestore";

    const animate = (node, args) =>
        args.condition ? slide(node, args) : scale(node, args);
    import { browser } from "$app/env";
    class theme {
        name!: string
        index!: number
        icon_url!: string
        style!: string
    }
    class theme_custom {
        name!: string
        index!: number
        theme_url!: string
        icon_url!: string
        style!: string
    }
    let available_themes: theme[]|theme_custom[] = [
        {
            name: "OispaHalla",
            index: 1,
            icon_url: "/img/raksahalla_192.webp",
            style: "background: white;"
        },
        {
            name: "OispaHalla (tumma)",
            index: 0,
            icon_url: "/img/raksahalla_192.webp",
            style: "background: black;"
        },
        {
            name: "Classic",
            index: 16,
            icon_url: "/img/theme-16/2048.webp",
            style: "background: transparent;"
        },
    ];

    let menu_open = false;

    let kaunis = {
        name: "Kaunis",
        index: 14,
        icon_url: "/img/theme-14/2.webp",
        style: ""
    };
    $: if(
            browser && localStorage && 
            (
                localStorage.getItem("hasWon")
                ||
                (
                    localStorage.getItem("bestScore") != null &&
                    (+localStorage.getItem("bestScore")) &&
                    (+localStorage.getItem("bestScore")) > 10000 
                )
            )
            &&
            !available_themes.includes(kaunis)
        ) {
        available_themes.push(kaunis);
        available_themes = available_themes;
    }

    async function fetchCustomThemeDetails(url) {
        try {
            let res = await fetch(`${url}/manifest.json`);
            if(res.ok) {
                try {
                    let json = await res.json();
                    return [true, json, null];
                }
                catch (e) {
                    return [false, {}, "invalid json"];
                }
            }
        }
        catch (e) {
            return [false, {}, "network error"];
        }
        return [false, {}, "what?"];
    }
    function setImageTheme(theme: number) {
        theme_index.set(theme);
    }
    async function addCustomTheme() {
        let url = prompt("Teeman osoite");
        let fetch_result = await fetchCustomThemeDetails(url);
        if(!fetch_result[0]) {
            alert(`Virhe: ${fetch_result[2]}`);
            return;
        }
        let manifest = fetch_result[1];
        let name = manifest.name;
        let icon_url = `${url}/theme-0/2048.png`;
        available_themes.push({
            name: name,
            index: 0,
            theme_url: url,
            icon_url: icon_url,
            style: ""
        });
        available_themes = available_themes;
    }

    export let relative = true;
    export let expandX = false;
    export let expandY = true;
</script>

<main class:relative class:expandX class:expandY>
    {#if browser}
        <!-- svelte-ignore missing-declaration -->
        {#if $theme_index != null}
            {#each available_themes as theme, index}
                <!-- svelte-ignore missing-declaration -->
                {#if (theme.theme_url && $base_path === theme.theme_url) || ($theme_index == theme.index && $base_path.length < 1) || menu_open}
                    <!-- svelte-ignore missing-declaration -->
                    <button
                        title={menu_open ? `vaihda teemaan ${theme.name}` : "avaa teemavalitsin"}
                        aria-label={menu_open ? `vaihda teemaan ${theme.name}` : "avaa teemavalitsin"}
                        on:click={()=>{
                            if(menu_open) {
                                if(theme.theme_url) {
                                    base_path.set(theme.theme_url);
                                }
                                else {
                                    base_path.set("");
                                    setImageTheme(theme.index);
                                }
                            }
                            menu_open = !menu_open;
                        }}
                        transition:animate={{condition: relative, delay: index*50}}
                    >
                        <img src={theme.icon_url} width="50px" height="50px" alt="" style={theme.style} />
                    </button>
                {/if}
            {/each}
            {#if available_themes.filter(theme => (theme.theme_url && $base_path === theme.theme_url) || ($theme_index == theme.index && $base_path.length < 1)).length < 1}
                <button
                    on:click={()=>{menu_open = !menu_open}}
                    on:touchend={()=>{menu_open = !menu_open}}
                >
                    ?
                </button>
            {/if}
            {#if menu_open}
                <button
                        title="Lisää teema"
                        aria-label="Lisää teema"
                        on:click={addCustomTheme}
                        transition:animate={{condition: relative, delay: available_themes.length*50}}
                >+</button>
            {/if}
        {/if}
    {:else}
        <button>
            ...
        </button>
    {/if}
</main>

<style>
    main {

        display: flex;
        flex-wrap: wrap;
        flex-direction: column;
        /* we'll use margin-bottom instead, as it works better with slide */
        /* gap: 1em; */


        transition: left 200ms;
    }
    main.relative {
        position: relative;
        left: var(--field-width, 500px);
    }
    main.expandX {
        height: 0;
    }
    main.expandX button { 
        min-height: 52px;
    }
    main.expandY {
        width: 0;
    }
    button {
        padding: 0;
        line-height: 0;
        margin: 0;
        margin-bottom: 1em;

        border-width: 1px;
        cursor: pointer;

        width: 52px;
        height: 52px;
        display: flex;
        justify-content: center;
        align-items: center;

        transition: transform 200ms;
    }
    button, img {
        border-radius: .25rem;
    }

    @media (max-width: 576px) {
        main.expandY {
            display: none;
        }
    }
</style>