import { type Writable, writable } from "svelte/store";

export let open_popups: Writable<any[]> = writable([]);