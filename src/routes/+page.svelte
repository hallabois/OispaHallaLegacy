<script lang="ts">
    import { marked } from 'marked';
    import { onMount } from "svelte";

    import { enable_multiplayer, enable_leaderboards } from '../features';

    import Preloader from '$lib/components/common/image-preloader/Preloader.svelte';

    import Settings from '$lib/components/settings.svelte';
    import Tournaments from "$lib/components/tournaments.svelte";
    import Leaderboards from "$lib/components/leaderboard.svelte";

    import Board from "$lib/components/board/board.svelte";
    import Announcer from '$lib/components/tournaments/announcer.svelte';
    import type KeyboardInputManager from '$lib/gamelogic/keyboard_input_manager';
    import type GameManager from "$lib/gamelogic/game_manager";
    import Icon from "$lib/components/common/icon/icon.svelte";
    import { leaderboardIconData } from "$lib/components/common/icon/iconData";
    import { base_path } from "$lib/themestore";

    let app_name = "";
    let app_description = "";
    let app_notice = "";
    let app_name_newgame = "";
    let app_name_score = "";
    let app_name_hiscore = "";

    let app_name_default = "Oispa Halla";
    let app_description_default = "Yhdistä opettajat ja saavuta **Halla!**";
    let app_notice_default = "";
    let app_name_newgame_default = "Uusi Jakso";
    let app_name_score_default = "arvosana";
    let app_name_hiscore_default = "paras halla";

    function setDefaultMetaValues(){
        app_name = app_name_default;
        app_description = app_description_default;
        app_notice = app_notice_default;
        app_name_newgame = app_name_newgame_default;
        app_name_score = app_name_score_default;
        app_name_hiscore = app_name_hiscore_default;
    }

    $: if(mounted && $base_path != null && $base_path != ""){
        fetch($base_path + "/manifest.json")
            .then(response => response.json())
            .then( data=>{
                    app_name = data.name;
                    app_description = data.subtitle;
                    app_name_score = data.score;
                    app_name_hiscore = data.best_score;
                    app_name_newgame = data.newgame;
                }
            ).catch( () => {
                setDefaultMetaValues();
            }
        ).finally( () => {
            app_notice = "This is a custom pack and as such is not endorsed in any way by the original team.";
        } );
    }
    else {
        setDefaultMetaValues();
    }

    let mounted = false;
    let GameManagerInstance: GameManager;
    onMount( ()=>{
        inputRoot = document.querySelector("html") as HTMLElement;
        mounted = true;
        // inputManager = new KeyboardInputManager(inputRoot);
        // inputManager.on("move", move);
        BoardInstance.setDocumentRoot(inputRoot);
        BoardInstance.initcomponents();
        GameManagerInstance = BoardInstance.getGameManagerInstance();
    } );

    let enableKIM = true;

    function move(direction: number) {
        BoardInstance.getGameManagerInstance().move(direction);
    }

    let inputManager: KeyboardInputManager|null = null;
    let inputRoot: HTMLElement;
    let TtInstance: Tournaments;
    let lbInstance: Leaderboards;
    let SettingsInstance: Settings;
    let AnnouncerInstance: Announcer;
    let BoardInstance: Board;

    let restartbtn: HTMLElement;
    function restartGame(size: number) {
        let GameManagerInstance = BoardInstance.getGameManagerInstance();
        GameManagerInstance.restartplus(size);
    }
    function paritaKuli() {
        let GameManagerInstance = BoardInstance.getGameManagerInstance();
        GameManagerInstance.paritaKuli();
    }
</script>

<Preloader />

<div class="container">
    <Announcer bind:this={AnnouncerInstance} />
    <Settings bind:this={SettingsInstance} announcer={AnnouncerInstance} />
    <Leaderboards bind:this={lbInstance} announcer={AnnouncerInstance} {GameManagerInstance} />
    <Tournaments bind:this={TtInstance} announcer={AnnouncerInstance} />
    <div class="new-above-game">
        <div class="above-game-left">
            <a href="https://hallabois.github.io/invite/" target="_blank">
                <h1 class="title">{app_name}</h1>
            </a>
            {@html marked.parse(app_description)}
        </div>
        <div class="above-game-right">
            <div class="score-container" style="--c:'{app_name_score}'">0</div>
            <div class="best-container"  style="--c:'{app_name_hiscore}'">0</div>
            <div class="restart-button button"
                bind:this={restartbtn}
                on:click={()=>{
                    if(!restartbtn.classList.contains("open")){
                        restartbtn.classList.add("open");
                    }
                    else{
                        restartbtn.classList.remove("open");
                    }
                }}
            >
                <div class="uusi-jakso">{app_name_newgame}</div>
                <div class="size-selector">
                    <button>&lt;</button>
                    <button on:click={()=>{restartGame(3)}} class="restart-3x3">3x3</button>
                    <button on:click={()=>{restartGame(4)}} class="restart-4x4">4x4</button>
                </div>
            </div>
        </div>
    </div>
    <div class="board-container">
        <Board {enableKIM} enableLSM={true} enableRng={true} documentRoot={inputRoot} initComponentsOnMount={false} bind:this={BoardInstance} />
        <div class="underbar-container">
            <div class="button-container" style="margin-top: 0;flex: 1;justify-content: start;">
                <!-- <ThemeChooser relative={false} expandY={false} expandX={true} /> -->
                <button class="button background-none color-button" on:click={()=>{SettingsInstance.show()}} title="Asetukset">
                    ⚙️
                </button>
            </div>
            <div class="kurin-palautus-container" style="flex: 1;">
                <button class="button kurin-palautus kurin-palautus-color"
                    on:click={paritaKuli}
                >
                    <span class="parin-kulautus" title="Vai parin kulautus? Lahjot opettajia pois ruudulta, mutta menetät arvosanojasi! Voit lahjoa opettajia vain kolme kertaa ennen kun Halla saa kuulla tilanteesta.">KURINPALAUTUS</span>
                </button>
            </div>
            <div class="button-container" style="margin-top: 0;flex: 1;justify-content: end;">
                {#if enable_multiplayer}
                    <button class="button background-none color-button" on:click={()=>{TtInstance.show()}} title="Moninpeli">
                        ⚔
                    </button>
                {/if}
                {#if enable_leaderboards}
                <button on:click={ ()=>{lbInstance.show()}} id="lb-button" class="color-button button background-none icon-button" title="Leaderboards" style="display: flex;">
                    <Icon stroke="var(--color)" d={leaderboardIconData} />
                    <!-- <img src="img/svg/leaderboard.svg" alt="Leaderboard icon"> -->
                </button>
                {/if}
            </div>
        </div>
    </div>
    <div class="pwa-container" style="width: 100%;z-index: 500;display: flex;justify-content: center;margin-top: 30px;margin-bottom: -50px;">
        <button class="pwa-add-button" style="display: none;border: none;margin: .5em;cursor: pointer;">Asenna sovelluksena</button>
    </div>
    <div class="disclaimer">
        <p>
            {@html marked.parse(app_notice)}
        </p>
    </div>
</div>


<style>
    .board-container {
        margin-top: 40px;
        display: grid;
        place-items: center;
    }
    .underbar-container {
        margin-top: 15px;
    }
    .kurin-palautus-container {
        margin-top: 0 !important;
    }
    .underbar-container .button-container > * {
        width: auto !important;
    }
    :global(.mini-container .tile-inner) {
        animation: none !important;
        -moz-animation: none !important;
        -webkit-animation: none !important;
    }
    .patches {
        height: 0;
        width: 0;
    }
</style>
<div class="patches">
    <!-- <script src="/js/application.js"></script>
    <script src="/js/HAC.js"></script> -->
    <div class="preload-container" />
</div>