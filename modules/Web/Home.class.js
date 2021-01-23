/**
  * Home - The base home page
  */
export class Home {
  constructor(data) {
    let page = Deno.readTextFileSync(data.Server.file2Path(import.meta.url) + "/View/Home.html");
    let response = new data.Response(page);
    response.send(data.connection);
  }
}
