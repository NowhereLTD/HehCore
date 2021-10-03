import { Schenu } from "https://raw.githubusercontent.com/NowhereLTD/Schenu/master/Schenu.class.js";

/**
  * Home - The base home page
  */
export class Home {
  constructor(data) {
    return (async () => {
      let page = Deno.readTextFileSync(data.Server.file2Path(import.meta.url) + "/View/Home.html");
      let parsedPage = await Schenu.parse(page, {"version": data.Server.version});
      data.request.respondWith(new Response(parsedPage, {status: 200, headers: {"Content-Type": "text/html"}}));
    })();
  }
}
