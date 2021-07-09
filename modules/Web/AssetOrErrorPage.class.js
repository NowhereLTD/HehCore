/**
  * ErrorPage - The base 404 not found error page
  */
export class AssetOrErrorPage {
  constructor(data) {
    return (async () => {
      let assetPath = data.request.route;
      try {
        let assetsFolder = data.settings.resourceDirectory ?? "assets";
        let response = new data.Response({filePath: data.Server.basePath + assetsFolder + assetPath});
        await response.send(data.connection);
      }catch (e) {
        let response = new data.Response({filePath: data.Server.file2Path(import.meta.url) + "/View/ErrorPage.html"});
        await response.send(data.connection);
      }
    })();
  }
}
