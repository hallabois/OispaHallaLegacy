<script lang="ts">
    import { marked } from 'marked';
    import { onMount } from "svelte";

    import Announcer from '$lib/components/tournaments/announcer.svelte';
    import Leaderboards from "$lib/components/leaderboard.svelte";
    import Tutorial from "$lib/components/tutorial.svelte";
    import Tournaments from "$lib/components/tournaments.svelte";
    import Icon from "$lib/components/common/icon/icon.svelte";
    import { leaderboardIconData } from "$lib/components/common/icon/iconData";
    import ThemeChooser from '$lib/components/common/theme-chooser/themeChooser.svelte';


    let app_name = "";
    let app_description = "";
    let app_notice = "";
    let app_name_newgame = "";
    let app_name_score = "";
    let app_name_hiscore = "";

    let app_name_default = "Oispa Halla";
    let app_description_default = "Yhdistä opettajat ja saavuta **Halla!**";
    let app_notice_default = "**HUOMIO**: Pelin lista opettajista on tehty täysin sattumanvaraisesti, eikä opettajia ole laitettu minkäänlaiseen paremmuusjärjestykseen. Rakastamme kaikkia opettajia sekä arvostamme kaikkien heidän työtänsä yhtä paljon ❤️.";
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

    $: if(mounted && base_path != null && base_path != ""){
      fetch(base_path + "/manifest.json")
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
    else{
      setDefaultMetaValues();
    }

    let mounted = false;
    onMount( ()=>{
        if(onInitDone != null){
            onInitDone();
        }
        mounted = true;
        // let score_size = lbInstance.hasUnsavedScore();
        // if( score_size != null && lbInstance.connected ){
        //   lbInstance.show(score_size);
        // }
    } );

    let AnnouncerInstance: Announcer;
    let lbInstance: Leaderboards;
    let TtInstance: Tournaments;
</script>

<svelte:head>
  <title>{app_name}</title>
</svelte:head>

<main>
  <div class="container">
    <Announcer bind:this={AnnouncerInstance} />
    <Leaderboards bind:this={lbInstance} announcer={AnnouncerInstance} />
    <Tournaments bind:this={TtInstance} announcer={AnnouncerInstance} />
    <div class="new-above-game">
      <div class="above-game-left">
        <a href="https://hallabois.github.io/invite/" target="_blank">
          <h1 class="title">{app_name}</h1>
        </a>
        <p class="game-intro">{@html marked.parse(app_description)}</p>
      </div>
      <div class="above-game-right">
        <div class="HAC-container" title="HAC:n tila" style="display:none;">
          <div class="HAC-status">...</div>
        </div>
        <div class="score-container" style="--c:'{app_name_score}'">0</div>
        <div class="best-container"  style="--c:'{app_name_hiscore}'">0</div>
        <div class="restart-button button">
          <div class="uusi-jakso">{app_name_newgame}</div>
          <div class="size-selector">
            <button>&lt;</button>
            <button class="restart-3x3">3x3</button>
            <button class="restart-4x4">4x4</button>
          </div>
        </div>
      </div>
    </div>
    <!-- <div class="heading">
      <a href="https://discord.gg/7x25Jxrkvr" target="_blank">
        <h1 class="title">Oispa Halla</h1>
      </a>
      <div class="scores-container">
      	<div class="HAC-container" title="HAC:n tila" style="display:none;">
          <div class="HAC-status">...</div>
        </div>
        <div class="score-container">0</div>
        <div class="best-container">0</div>
      </div>
    </div>

    <div class="above-game">
      <p class="game-intro">Yhdistä opettajat ja saavuta <strong>Halla!</strong></p>
      <a class="restart-button">
        <div class="uusi-jakso">Uusi Jakso</div>
        <div class="size-selector">
          <button>&lt;</button>
          <button class="restart-3x3">3x3</button>
          <button class="restart-4x4">4x4</button>
        </div>
      </a>
    </div> -->

    <div class="game-container">
      <div class="kurin-palautus-viesti"></div>
      <div class="game-message">
        <p class="tilanne"></p>
        <p class="kurinpalautukset"></p>
        <div class="lower">
	        <button class="button keep-playing-button">Jatka pelaamista</button>
          <button class="button retry-button">Yritä uudelleen</button>
        </div>
      </div>

      <div class="grid-container">
        <!-- Standard 4x4 -->
        <div class="grid-cell"></div>
        <div class="grid-cell"></div>
        <div class="grid-cell"></div>
        <div class="grid-cell"></div>
        <div class="grid-cell"></div>
        <div class="grid-cell"></div>
        <div class="grid-cell"></div>
        <div class="grid-cell"></div>
        <div class="grid-cell"></div>
        <div class="grid-cell"></div>
        <div class="grid-cell"></div>
        <div class="grid-cell"></div>
        <div class="grid-cell"></div>
        <div class="grid-cell"></div>
        <div class="grid-cell"></div>
        <div class="grid-cell"></div>
        <!-- In case we need more -->
        <!-- 5x5 -->
        <div class="grid-cell"></div>
        <div class="grid-cell"></div>
        <div class="grid-cell"></div>
        <div class="grid-cell"></div>
        <div class="grid-cell"></div>
        <div class="grid-cell"></div>
        <div class="grid-cell"></div>
        <div class="grid-cell"></div>
        <div class="grid-cell"></div>
        <!-- 6x6 -->
        <div class="grid-cell"></div>
        <div class="grid-cell"></div>
        <div class="grid-cell"></div>
        <div class="grid-cell"></div>
        <div class="grid-cell"></div>
        <div class="grid-cell"></div>
        <div class="grid-cell"></div>
        <div class="grid-cell"></div>
        <div class="grid-cell"></div>
        <div class="grid-cell"></div>
        <div class="grid-cell"></div>
      </div>

      <div class="tile-container">

      </div>
      <ThemeChooser />
    </div>
    <div class="underbar-container">
      <!-- <button class="button background-none color-button" on:click={TtInstance.show()} title="Ohje">
        <img src="img/svg/help.svg" alt="?">
      </button> -->
      <button class="button background-none color-button" on:click={()=>{TtInstance.show()}} title="Tournament Mode">
        ⚔
      </button>
      <div class="kurin-palautus-container">
        <button class="button kurin-palautus kurin-palautus-color">
          <span class="parin-kulautus" title="Vai parin kulautus? Lahjot opettajia pois ruudulta, mutta menetät arvosanojasi! Voit lahjoa opettajia vain kolme kertaa ennen kun Halla saa kuulla tilanteesta.">KURINPALAUTUS</span>
        </button>
      </div>
      <div class="button-container">
        <div class="lb-container">
          <button on:click={ ()=>{lbInstance.show()}} id="lb-button" class="color-button button background-none icon-button" title="Leaderboards">
            <!-- <img src="img/svg/leaderboard.svg" alt="Leaderboard icon"> -->
            <Icon stroke="var(--color)" d={leaderboardIconData} />
          </button>
        </div>
        <!-- <div class="event-container">
          <!-- svelte-ignore a11y-missing-attribute --> <!-- TODO: CONVERT TO BUTTON --.>
          <button class="event-button button background-none icon-button" style="font-size: 1rem;" title="Toggle Dark Theme">
            <!-- <img src="./img/no_snow.svg" id="event-icon"> --.>
            <!-- <p id="darkmode-icon">🔆</p> --.>
            <Icon text_id="darkmode-icon" stroke="var(--color)" text="🔆" />
          </button>
        </div> -->
      </div>
    </div>
    <div class="pwa-container" style="width: 100%;z-index: 500;display: flex;justify-content: center;margin-top: 30px;margin-bottom: -50px;">
      <button class="pwa-add-button" style="display: none;border: none;margin: .5em;cursor: pointer;">Asenna sovelluksena</button>
    </div>
    <div class="disclaimer">
      <p>
        {@html marked.parse(app_notice)}
      </p>
      <p>
        Alkuperäisen projektin <a href="https://github.com/gabrielecirulli/2048" target="_blank">2048</a> on tehnyt <a href="http://gabrielecirulli.com" target="_blank">Gabriele Cirulli.</a>
      </p>
      <p>
        Made by <a href="https://hallabois.github.io/invite">Hallabois</a>
      </p>
      <p>
        <a href="https://simpleanalytics.com/oispahalla.com" target="_blank">Simpleanalytics</a>
      </p>
    </div>
    <div class="preload-container"></div>
  </div>

  <script src="/js/local_storage_manager.js"></script>
	<script src="/js/HAC.js"></script>
	<script src="/js/bind_polyfill.js"></script>
	<script src="/js/classlist_polyfill.js"></script>
	<script src="/js/animframe_polyfill.js"></script>
	<script src="/js/keyboard_input_manager.js"></script>
	<script src="/js/html_actuator.js"></script>
	<script src="/js/grid.js"></script>
	<script src="/js/tile.js"></script>
	<script src="/js/game_manager.js"></script>
	<script src="/js/application.js"></script>
	<!-- <script src="js/leaderboard.js"></script> -->
	<script src="/pwa_promoter.js"></script>
</main>