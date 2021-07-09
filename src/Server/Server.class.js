import { Response } from "/src/Server/Utils/Response.class.js";
import { Request } from "/src/Server/Utils/Request.class.js";
import { ModuleParser } from "/src/ModuleParser/ModuleParser.class.js";

/**
  * Server - The Heh core server
  * @extends EventTarget
  */
export class Server extends EventTarget {
  constructor(basePath) {
    super();
    this.basePath = this.file2Path(basePath);
    this.decoder = new TextDecoder("utf-8");
    let rawConfigData = Deno.readFileSync(this.basePath + "config.json");
    this.configData = JSON.parse(this.decoder.decode(rawConfigData));
    this.hostname = this.configData.settings.hostname ?? "localhost";
    this.port = this.configData.settings.port ?? "80";
    this.protocol = this.configData.settings.protocol ?? "tcp";
    this.connections = [];
    this.maxRequestSize = this.configData.settings.maxRequestSize ?? 1024;
    this.version = this.configData.settings.version ?? 1;

    this.moduleParser = new ModuleParser(this);
    return (async function () {
      await this.moduleParser.loadModulePath(this.basePath, "", true);
      await this.moduleParser.loadModulePath(this.basePath);
      await this.listen();
    }.bind(this)());
  }

  /**
   * listen - Start the server listener
   */
  async listen() {
    this.listener = Deno.listen({ hostname: this.hostname, port: this.port, transport: this.protocol });
    while(!this.closing) {
      let connection = await this.listener.accept();
      this.connections[connection.rid] = connection;

      let dataArray = [];
      let data = "";
      let requestSize = 0;
      while (dataArray[dataArray.length-1] != "\r" && requestSize != this.maxRequestSize) {
        let requestBuffer = new Uint8Array(1);
        await connection.read(requestBuffer);
        data = data + this.decoder.decode(requestBuffer);
        dataArray = data.split("\n");
        requestSize = requestSize +1;
      }

      let request = new Request(data);
      this.dispatchEvent(new CustomEvent("handle", {
        detail: {
          connection: connection,
          request: request,
          Response: Response,
          Server: this
        }
      }));
    }
  }

  /**
   * close - Close the server
   *
   * @returns {Boolean}
   */
  close() {
    this.listener.close();
    for(let connection of this.connections) {
      try {
        connection.close();
      } catch (e) {
        if(!(e instanceof Deno.errors.BadResource)) {
          throw e;
          return false;
        }
      }
    }
    return true;
  }

  file2Path(path) {
    path = path.replace("file://", "");
    path = path.substr(0, path.lastIndexOf("/"));
    path = path + "/";
    return path;
  }
}
