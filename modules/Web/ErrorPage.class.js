/**
  * ErrorPage - The base 404 not found error page
  */
export class ErrorPage {
  constructor(data) {
    let page = Deno.readTextFileSync(data.Server.file2Path(import.meta.url) + "/View/ErrorPage.html");
    let response = new data.Response(page);
    response.send(data.connection);
  }
}
