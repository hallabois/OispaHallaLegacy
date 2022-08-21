import { type Writable, writable, get } from "svelte/store";
import { browser, dev } from "$app/env";
import { auth } from "$lib/Auth/authstore";

let leaderboard_endpoint_prod = "https://oispahallalb.herokuapp.com";
let leaderboard_endpoint_dev = true ? leaderboard_endpoint_prod : "http://localhost:5000";
export let leaderboard_endpoint = dev ? leaderboard_endpoint_dev : leaderboard_endpoint_prod;

export let lb_screenName: Writable<string|null> = writable(browser ? localStorage.lb_screenName || null : null);
lb_screenName.subscribe((val)=>{
    if(val == "null") {
        lb_screenName.set(null);
    }
    if(val == null && browser && auth != null) {
        let $auth = get(auth);
        if($auth != null && $auth.email != null) {
            // This is a bit cursed but does the job
            let name = $auth.email.split("@")[0].split(".").map(
                (namep,ind)=> {
                    return namep.slice(0, Math.min(namep.length, Math.max(20-ind*20, 1)));
                }
            ).join("");
            lb_screenName.set(name);
        }
    }
});
lb_screenName.subscribe((value) => {if(browser){localStorage.lb_screenName = value}});

export async function check_server_alive() {
    try {
        const resp = await fetch(`${leaderboard_endpoint}/alive`);
        return resp.ok;
    }
    catch (e) {
        console.warn(e);
        return false;
    }
}

export class scores_ok {
    scores!: any[]
}
export class scores_error {
    error_msg!: string
}
export type scores_response = scores_ok | scores_error
export async function get_all_scores(size: number): Promise<scores_response> {
    try {
        const resp = await fetch(`${leaderboard_endpoint}/scores/size/${size}/`);
        if(resp.ok) {
            try {
                const json_result = await resp.json();
                return json_result;
            }
            catch(e) {
                console.warn(e);
                return {
                    error_msg: "Invalid JSON"
                };
            }
        }
        else {
            console.warn(resp);
            return {
                error_msg: "Failed to contact server."
            };
        }
    }
    catch (e) {
        console.warn(e);
        return {
            error_msg: "Error contacting server."
        };
    }
}

export async function get_top_scores(size: number, threshold: number): Promise<scores_response> {
    try {
        const resp = await fetch(`${leaderboard_endpoint}/scores/size/${size}/${threshold}`);
        if(resp.ok) {
            try {
                const json_result = await resp.json();
                return json_result;
            }
            catch(e) {
                console.warn(e);
                return {
                    error_msg: "Invalid JSON"
                };
            }
        }
        else {
            console.warn(resp);
            return {
                error_msg: "Failed to contact server."
            };
        }
    }
    catch (e) {
        console.warn(e);
        return {
            error_msg: "Error contacting server."
        };
    }
}


export class User {
    _id!: string
    screenName!: string
}
export class Score_ok {
    success!: boolean
    _id!: string
    size!: number
    score!: number
    breaks!: number
    user!: User
    createdAt!: string
    updatedAt!: string
}
export class Score_error {
    success!: boolean
    error_msg!: string
}
export type Score_response = Score_ok | Score_error;
export async function get_my_top_score(size: number, token: string): Promise<Score_response> {
    try {
        const resp = await fetch(`${leaderboard_endpoint}/scores/size/${size}/token/${token}`);
        if(resp.ok) {
            try {
                const json_result = await resp.json();
                return {
                    ...json_result,
                    success: true
                };
            }
            catch(e) {
                console.warn(e);
                return {
                    success: false,
                    error_msg: "Invalid JSON"
                };
            }
        }
        else {
            console.warn(resp);
            return {
                success: false,
                error_msg: "Failed to contact server."
            };
        }
    }
    catch (e) {
        console.warn(e);
        return {
            success: false,
            error_msg: "Error contacting server."
        };
    }
}
export async function get_score_placement(size: number, screenName: string): Promise<string> {
    let all_scores = await get_all_scores(size);
    if(all_scores instanceof scores_error) {
        return "?.";
    }
    else {
        let index = 0;
        for(let score of all_scores.scores) {
            if(score.user.screenName === screenName) {
                return (index + 1) + ".";
            }
            index++;
        }
        return "?.";
    }
}

export class submit_response {
    success!: boolean
    message!: string
    json!: any | null
}
export async function submit_score(size: number, token: string|null, user_screenName: string, run_score: number, run_breaks: number, run_history: string): Promise<submit_response> {
    try {
        const resp = await fetch(`${leaderboard_endpoint}/scores/size/${size}`,
            {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    "user": {
                        "token": token,
                        "screenName": user_screenName
                    },
                    "score": run_score,
                    "breaks": run_breaks,
                    "history": run_history
                })
            }
        );
        if(resp.ok) {
            return {
                success: true,
                message: "Suoritus tallennettu.",
                json: await resp.json()
            }
        }
        else {
            console.warn(resp);
            let json = await resp.json();
            return {
                success: false,
                message: json.message || "Tuntematon virhe",
                json: json
            };
        }
    }
    catch (e) {
        console.warn(e);
        return {
            success: false,
            message: "Error contacting server.",
            json: null
        };
    }
}

export type Scores = {[key: number]: number};
export type Histories = {[key: number]: any[]};
export function get_local_top_scores(): Scores {
    const scores: Scores = {};
    for(const size of [3, 4]) {
        scores[size] = JSON.parse(localStorage.getItem(`HAC_best_score${size}`) || "null");
    }
    console.info(scores);
    return scores;
};
export function get_local_top_histories(): Histories {
    const histories: Histories = {};
    for(const size of [3, 4]) {
        histories[size] = JSON.parse(localStorage.getItem(`HAC_best_history${size}`) || "null");
    }
    console.info(histories);
    return histories;
}
export function update_my_top_score() {
    my_top_scores.set(get_local_top_scores());
    my_top_score_histories.set(get_local_top_histories());
}
export let my_top_scores: Writable<Scores> = writable(browser ? get_local_top_scores() : {});
export let my_top_score_histories: Writable<Histories> = writable(browser ? get_local_top_histories() : {});
export let my_top_submitted_scores: Writable<Scores> = writable(browser ? JSON.parse(localStorage.lb_submitted || "null") || {} : {});
my_top_submitted_scores.subscribe((value) => {if(browser){localStorage.lb_submitted = JSON.stringify(value)}});
