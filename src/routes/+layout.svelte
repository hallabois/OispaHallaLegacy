<script lang="ts">
    import type { LayoutData } from './$types';
    export let data: LayoutData;
    $: ({ theme_override } = data);

	import { browser } from "$app/env";
	import "../app.scss";
    import PopupScrolllock from "$lib/components/common/popup/popup_scrolllock.svelte";
	import { theme_index } from "$lib/themestore";
    //export let theme_override: number | null;
    if(!browser && theme_override != null) {
    	theme_index.set(theme_override);
    }
</script>

<PopupScrolllock />
<slot />

<style lang="scss" global>
	
</style>