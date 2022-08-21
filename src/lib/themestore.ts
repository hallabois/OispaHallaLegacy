import { browser } from "$app/env";
import { type Writable, writable, get } from "svelte/store";

export let defaultTheme = 1;
export function setDefaultTheme(theme: number) {
    defaultTheme = theme;
}
export let currentImageThemeVersion = 5;

export let theme_index: Writable<number> = writable(defaultTheme);
export let theme_loaded = false;
theme_index.subscribe((themeID) => {
    if(browser) {
        // Save choice to localstorage
        try {
            if(theme_loaded) {
                localStorage.imageTheme = themeID;
                localStorage.imageThemeLastVersion = currentImageThemeVersion;
            }
        }catch{}
        // Save choice as a cookie
        try {
            document.cookie = `theme=${themeID};SameSite=Strict;expires=Fri, 31 Dec 9999 23:59:59 GMT"max-age=31536000;path=/;`;
        }catch{}
        // Apply theme
        let html = document.querySelector("html");
        if(html) {
            html.classList = ["theme-" + themeID];
        }
        theme_loaded = true;
    }
})
export let base_path: Writable<string> = writable("");

export function get_base_path(): string {
    return get(base_path);
}

// Load theme from storage
if(browser) {
    if(localStorage.imageTheme){
        if(localStorage.imageThemeLastVersion && localStorage.imageThemeLastVersion == currentImageThemeVersion){
            theme_index.set(+localStorage.imageTheme);
        }
        else{
            theme_index.set( defaultTheme );
        }
    }
    else{
        theme_index.set( defaultTheme );
    }
}