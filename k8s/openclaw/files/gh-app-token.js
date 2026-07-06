// GitHub App の秘密鍵で JWT を発行し、installation access token (短命・約1時間) を
// 標準出力に返す。gh/git から使う際は `export GH_TOKEN=$(node gh-app-token.js)` の形で
// 呼び出しごとに再発行する想定(トークンをファイルに永続化しない)。
const crypto = require("node:crypto");

function base64url(input) {
  return Buffer.from(input)
    .toString("base64")
    .replace(/[=]/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

async function main() {
  const appId = process.env.GITHUB_APP_ID;
  const installationId = process.env.GITHUB_APP_INSTALLATION_ID;
  const privateKey = process.env.GITHUB_APP_PRIVATE_KEY;

  if (!appId || !installationId || !privateKey) {
    throw new Error(
      "GITHUB_APP_ID, GITHUB_APP_INSTALLATION_ID, GITHUB_APP_PRIVATE_KEY must be set",
    );
  }

  const now = Math.floor(Date.now() / 1000);
  const header = base64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const payload = base64url(JSON.stringify({ iat: now - 60, exp: now + 540, iss: appId }));
  const signingInput = `${header}.${payload}`;
  const signature = crypto.sign("RSA-SHA256", Buffer.from(signingInput), privateKey);
  const jwt = `${signingInput}.${base64url(signature)}`;

  const res = await fetch(
    `https://api.github.com/app/installations/${installationId}/access_tokens`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${jwt}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
    },
  );

  if (!res.ok) {
    throw new Error(`GitHub API error: ${res.status} ${await res.text()}`);
  }

  const data = await res.json();
  process.stdout.write(data.token);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
