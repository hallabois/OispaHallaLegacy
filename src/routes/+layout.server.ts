import { defaultTheme } from "$lib/themestore";

/** @type {import('./$types').LayoutServerLoad} */
export async function load({ request, setHeaders }) {

    // Check for theme cookie
    let cookie = request.headers.get('cookie');
    let theme = defaultTheme;
    if (cookie) {
        let matching = cookie.match(/theme=\d{1,5}/) || []; // qualifies theme:[0-99999]
        if(matching.length > 0) {
            theme = +matching[0].split("=")[1];
        }
    }

    console.log(`Serving theme ${theme}`);

    return {
        theme
    };
}