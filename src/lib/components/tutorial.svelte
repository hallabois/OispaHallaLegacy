<script lang="ts">
    import { swipe } from 'svelte-gestures';
    import { fly, slide, fade } from "svelte/transition";
    import TutorialSlide from "./tutorial/tutorialSlide.svelte";
    let slides_content = [
        "Slide 1",
        "Slide 2",
        "Slide 3"
    ];
    let active_slide_index = 0;
    let visible = false;
    export function show(){
        visible = true;
    }
    export function hide(){
        visible = false;
    }
    export function toggle(){
        visible = !visible;
    }
    function next(){
        active_slide_index++;
    }
    function prev(){
        active_slide_index--;
    }
    function swipeHandler(event) {
        let swipeDirection = event.detail.direction;
        if(swipeDirection == "left" && active_slide_index != slides_content.length-1){
            next();
        }
        if(swipeDirection == "right" && active_slide_index != 0){
            prev();
        }
    }
</script>

{#if visible}
    <main on:click={hide} transition:fade>
        <div on:click={(e)=>{e.stopPropagation();e.preventDefault();}} class="tutorial-container" in:fly="{{ y: -200, duration: 200 }}" >
            <div class="header">
                <h1>Ohje</h1>
                <div class="close-button">
                    <button on:click={hide} class="button background-none" id="tt-close" title="Sulje Tutoriaali">&times;</button>
                </div>
            </div>
            <div class="karuselli">
                <button class="button background-none" on:click={prev} disabled={active_slide_index == 0}>&lt;</button>
                <div class="tutorial-page" use:swipe={{ timeframe: 300, minSwipeDistance: 55, touchAction: null}} on:swipe={swipeHandler}>
                    {#each slides_content as slide_content, index}
                        <div class="slide-offset" style="--x:{-300*(active_slide_index-index)}px;--y:{0};">
                            <TutorialSlide>
                                {slide_content}
                            </TutorialSlide>
                        </div>
                    {/each}
                </div>
                <button class="button background-none" on:click={next}  disabled={active_slide_index == slides_content.length-1}>&gt;</button>
            </div>
        </div>
    </main>
{/if}

<style>
    main {
        position: fixed;
        left: 0;
        top: 0;
        right: 0;
        bottom: 0;
        display: flex;
        background: rgba(0,0,0,0.69);
        flex-direction: column;
        justify-content: center;
        align-items: center;
        z-index: 999;
    }
    .header {
        display: flex;
        margin-bottom: 1em;
    }
    h1 {
        margin-top: 0;
        margin-bottom: 0;
        flex: 1;
    }
    .close-button {
        font-size: 1.2em;
        display: flex;
        justify-content: center;
        align-items: center;
    }
    button {
        color: var(--color);
    }
    button:disabled {
        opacity: 0.5;
    }
    .tutorial-container {
        display: flex;
        flex-direction: column;
        background: var(--container-background);
        padding: 1em;
        border-radius: .25rem;
    }
    .karuselli {
        display: flex;
    }
    .tutorial-page {
        display: flex;
        width: 300px;
        height: 300px;
        overflow: hidden;
    }
    .slide-offset {
        width: 0;
        height: 0;
        transform: translate(var(--x,0), var(--y,0));
        transition: all .333s;
    }

    @media (max-width: 600px) {
        .tutorial-container {
            flex-direction: column-reverse;
        }
        .header {
            margin-bottom: 0;
            margin-top: 1em;
        }
        button {
            font-size: 1.25em;
        }
    }
</style>