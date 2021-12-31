/**
  * ErrorPage - The base 404 not found error page
  */
export class AssetOrErrorPage {
  constructor(data) {
    return (async () => {
      let assetPath = "/" + data.requestURL.pathname;
      try {
        let assetsFolder = data.settings.resourceDirectory ?? "assets";
        let filePath = data.Server.basePath + assetsFolder + assetPath;
        let contentType = data.request.request.getMime(filePath);
        await data.request.respondWith(new Response(Deno.readFileSync(filePath), {status: 200, headers: {"Content-Type": contentType}}));
      }catch (e) {
        let response = Deno.readFileSync(data.Server.file2Path(import.meta.url) + "/View/ErrorPage.html");
        await data.request.respondWith(new Response(response, {status: 404}));
      }
    })();
  }
}
