/**
  * ErrorPage - The base 404 not found error page
  */
export class AssetOrErrorPage {
  constructor(data) {
    return (async () => {
      let assetPath = "/" + data.request.route;
      try {
        let assetsFolder = data.settings.resourceDirectory ?? "assets";
        let filePath = data.Server.basePath + assetsFolder + assetPath;
        let contentType = data.request.getMime(filePath);
        data.request.respondWith(new Response(Deno.readFileSync(filePath), {status: 200, headers: {"Content-Type": contentType}}));
      }catch (e) {
        data.request.respondWith(new Response(Deno.readFileSync(data.Server.file2Path(import.meta.url) + "/View/ErrorPage.html"), {status: 404}));
      }
    })();
  }
}
