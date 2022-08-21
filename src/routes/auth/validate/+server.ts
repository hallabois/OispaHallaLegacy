import { json as json$1 } from '@sveltejs/kit';
import { getAuth } from 'firebase-admin/auth';
import { app } from "$lib/Auth_admin/auth";

export async function POST({ request }) {
    let body = await request.json();
    if(body.token == null) {
        return json$1({
            message: "please include a token",
        }, {
            status: 400
        });
    }
    else {
        let token = body.token;

        try {
            let result = await getAuth(app).verifyIdToken(token);
            let info = {
                name: result.name,
                uid: result.uid,
                email: result.email,
                email_verified: result.email_verified,
                picture: result.picture
            };
            return json$1({
                message: "auth ok",
                info
            });
        }
        catch(e) {
            console.warn("Auth error:", e);
            return json$1({
                message: "invalid token",
            }, {
                status: 403
            });
        }

        
    }
}