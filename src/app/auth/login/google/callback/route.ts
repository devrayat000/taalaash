// app/login/github/callback/route.ts
import { google, lucia } from "@/lib/lucia";
import { cookies } from "next/headers";
import { OAuth2RequestError } from "arctic";
import { generateIdFromEntropySize } from "lucia";
import db from "@/lib/db";
import { accounts, users } from "@/db/auth";
import { eq } from "drizzle-orm";

export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const storedState = cookies().get("google_oauth_state")?.value ?? null;
  const codeVerifier =
    cookies().get("google_oauth_code_verifier")?.value ?? null;

  if (
    !code ||
    !state ||
    !storedState ||
    state !== storedState ||
    !codeVerifier
  ) {
    console.log("something missing");
    return new Response(null, {
      status: 400,
    });
  }

  try {
    const tokens = await google.validateAuthorizationCode(code, codeVerifier);
    const googleUserResponse = await fetch(
      "https://openidconnect.googleapis.com/v1/userinfo",
      {
        headers: {
          Authorization: `Bearer ${tokens.accessToken}`,
        },
      }
    );
    const googleUser: GoogleUser = await googleUserResponse.json();
    console.log("google user:", googleUser);

    // Replace this with your own DB client.
    // const existingUser = await db
    //   .table("user")
    //   .where("github_id", "=", githubUser.id)
    //   .get();
    const existingUsers = await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
      })
      .from(users)
      .innerJoin(accounts, eq(accounts.providerAccountId, googleUser.sub));

    if (!!existingUsers.length) {
      const existingUser = existingUsers[0];
      const session = await lucia.createSession(existingUser.id, {
        email: existingUser.email,
        name: existingUser.name ?? googleUser.name,
      });
      const sessionCookie = lucia.createSessionCookie(session.id);
      cookies().set(
        sessionCookie.name,
        sessionCookie.value,
        sessionCookie.attributes
      );
      return Response.redirect("http://localhost:3000/demo/login", 302);
    }

    // // Replace this with your own DB client.
    const [newUser] = await db
      .insert(users)
      .values({
        id: crypto.randomUUID(),
        email: googleUser.email,
        name: googleUser.name,
        image: googleUser.picture,
        emailVerified: googleUser.email_verified ? new Date() : null,
      })
      .returning({ id: users.id });
    await db.insert(accounts).values({
      userId: newUser.id,
      provider: "google",
      type: "oauth",
      providerAccountId: googleUser.sub,
      access_token: tokens.accessToken,
      refresh_token: tokens.refreshToken,
      expires_at: tokens.accessTokenExpiresAt.getMilliseconds(),
      token_type: "Bearer",
      scope: ["openid", "profile", "email"].join(","),
      id_token: tokens.idToken,
      session_state: storedState,
    });

    const session = await lucia.createSession(newUser.id, {
      email: googleUser.email,
      name: googleUser.name,
    });
    const sessionCookie = lucia.createSessionCookie(session.id);
    cookies().set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes
    );
    return Response.redirect("http://localhost:3000/demo/login", 302);
  } catch (e) {
    // the specific error message depends on the provider
    if (e instanceof OAuth2RequestError) {
      // invalid code
      console.log(e.message);
      return new Response(null, {
        status: 400,
      });
    }
    console.log(e);
    return new Response(null, {
      status: 500,
    });
  }
}

export interface GoogleUser {
  sub: string;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
  email: string;
  email_verified: boolean;
  locale: string;
}
