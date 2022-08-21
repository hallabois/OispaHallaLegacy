<script lang="ts">
  import ThemeChooser from '$lib/components/common/theme-chooser/themeChooser.svelte';
</script>
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

<style>
  .game-container {
    margin: 0;
  }
</style>