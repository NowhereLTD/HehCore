/**
  * JSONPage - A json example response
  */
export class JSONPage {
  constructor(data) {
    let json = Deno.readTextFileSync("./modules/Web/View/JSONPage.json");
    let response = new data.Response(json);
    response.send(data.connection);
  }
}
