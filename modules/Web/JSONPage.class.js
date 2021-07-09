/**
  * JSONPage - A json example response
  */
export class JSONPage {
  constructor(data) {
    return (async () => {
      let response = new data.Response({filePath: data.Server.file2Path(import.meta.url) + "/View/JSONPage.json"});
      await response.send(data.connection);
    })();
  }
}
