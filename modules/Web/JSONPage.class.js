/**
  * JSONPage - A json example response
  */
export class JSONPage {
  constructor(data) {
    let json = Deno.readTextFileSync(data.Server.file2Path(import.meta.url) + "/View/JSONPage.json");
    let response = new data.Response(json);
    response.send(data.connection);
  }
}
