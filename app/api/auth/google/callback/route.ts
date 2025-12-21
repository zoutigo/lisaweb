import { NextResponse } from "next/server";

const html = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Google OAuth callback</title>
  </head>
  <body>
    <script>
      // This page is opened as the OAuth redirect target.
      // It extracts the id_token from the URL fragment and posts it to the opener window.
      (function(){
        try {
          const hash = window.location.hash || window.location.search || '';
          // parse both fragment and query
          const paramsString = hash.startsWith('#') ? hash.substring(1) : hash;
          const params = new URLSearchParams(paramsString);
          const id_token = params.get('id_token');
          const access_token = params.get('access_token');
          if (window.opener && (id_token || access_token)) {
            window.opener.postMessage({ id_token: id_token, access_token: access_token }, window.location.origin);
            window.close();
          } else {
            // If opened directly, show a message
            document.body.innerText = 'Authentication complete. You can close this window.';
          }
        } catch (e) {
          console.error(e);
          document.body.innerText = 'Erreur lors du traitement du callback.';
        }
      })();
    </script>
  </body>
</html>`;

export async function GET() {
  return new NextResponse(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
