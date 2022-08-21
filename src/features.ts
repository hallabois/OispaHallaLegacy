import { dev, browser } from "$app/env";

export const enable_multiplayer = dev && browser;
export const enable_leaderboards = browser;