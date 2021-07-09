/**
  * Home - The base home page
  */
export class Home {
  constructor(data) {
    return (async () => {
      let page = Deno.readTextFileSync(data.Server.file2Path(import.meta.url) + "/View/Home.html");
      let parsedPage = await data.Server.Schenu.parse(page, {"version": data.Server.version});
      let response = new data.Response({body: parsedPage});
      await response.send(data.connection);
    })();
  }
}
