<script lang="ts">
    import { slide, fade } from "svelte/transition";
    
    class announcement {
        msg: string;
        time: Date;
    }
    let announcements: announcement[] = [];

    export function announce(msg: string) {
        console.info("ANNOUNCER announcing", msg);
        announcements.push({
            "msg": msg,
            "time": new Date()
        });
        announcements = announcements;
        setTimeout(
            ()=>{
                announcements.shift();
                announcements = announcements;
            },
            2000
        )
    }
</script>

<main>
    {#each announcements as announcement, index}
        <p in:slide out:fade={{duration: 2000}}>{announcement.msg}</p>
    {/each}
</main>

<style>
    main {
        z-index: 217;
        position: absolute;
        top: 0;
        left: 0;
        right: 0;

        display: flex;
        flex-direction: column;
    }
    main p {
        text-align: center;
        background-color: var(--color);
        color: var(--background);
        margin: 0;
    }
</style>