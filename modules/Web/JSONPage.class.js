/**
  * JSONPage - A json example response
  */
export class JSONPage {
  constructor(data) {
    return (async () => {
      data.request.respondWith(new Response(Deno.readFileSync(data.Server.file2Path(import.meta.url) + "/View/JSONPage.json"), {status: 200}));
    })();
  }
}
