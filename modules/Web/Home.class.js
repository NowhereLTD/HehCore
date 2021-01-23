/**
  * Home - The base home page
  */
export class Home {
  constructor(data) {
    let page = Deno.readTextFileSync("./modules/Web/View/Home.html");
    let response = new data.Response(page);
    response.send(data.connection);
  }
}
