import type { LoaderArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import invariant from "tiny-invariant";

import oasDocument from "~/specs/githubv3.json";
import type { OpenAPIV3 } from "openapi-types";
import { getTokenUrlForScheme } from "~/specs/utils";

export async function loader({ request }: LoaderArgs) {
  const url = new URL(request.url);

  // Log all the query params
  console.log(url.searchParams);

  // Get the request token
  const code = url.searchParams.get("code");

  invariant(typeof code === "string", "Expected code to be a string");

  const tokenUrl = getTokenUrlForScheme(
    oasDocument as OpenAPIV3.Document,
    "oauth2"
  );

  invariant(tokenUrl, "Expected tokenUrl to be defined");

  console.log(`tokenUrl: ${tokenUrl}`);

  invariant(
    process.env.OAUTH_CLIENT_ID,
    "Expected OAUTH_CLIENT_ID to be defined"
  );
  invariant(
    process.env.OAUTH_CLIENT_SECRET,
    "Expected OAUTH_CLIENT_SECRET to be defined"
  );

  tokenUrl.searchParams.set("client_id", process.env.OAUTH_CLIENT_ID);
  tokenUrl.searchParams.set("client_secret", process.env.OAUTH_CLIENT_SECRET);
  tokenUrl.searchParams.set("code", code);

  const accessTokenResponse = await fetch(tokenUrl.href, {
    method: "POST",
    headers: {
      accept: "application/json",
    },
  });

  if (!accessTokenResponse.ok) {
    console.log(
      `POST ${url.href} status code = ${accessTokenResponse.status}, ${accessTokenResponse.statusText}`
    );
    return redirect("/");
  }

  const responseBody = await accessTokenResponse.json();

  console.log(JSON.stringify(responseBody, null, 2));

  return redirect("/");
}
