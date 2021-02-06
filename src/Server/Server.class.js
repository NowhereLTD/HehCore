import { Response } from "/src/Server/Utils/Response.class.js";
import { Request } from "/src/Server/Utils/Request.class.js";

/**
  * Server - The Heh core server
  * @extends EventTarget
  */
export class Server extends EventTarget {
  constructor(hostname = "localhost", port = 80, protocol = "tcp") {
    super();
    this.hostname = hostname;
    this.port = port;
    this.protocol = protocol;
    this.connections = [];
    this.maxRequestSize = 1024;
  }

  /**
   * listen - Start the server listener
   */
  async listen() {
    this.listener = Deno.listen({ hostname: this.hostname, port: this.port, transport: this.protocol });
    while(!this.closing) {
      let connection = await this.listener.accept();
      this.connections[connection.rid] = connection;
      let decoder = new TextDecoder();

      let dataArray = [];
      let data = "";
      let requestSize = 0;
      while (dataArray[dataArray.length-1] != "\r" && requestSize != this.maxRequestSize) {
        let requestBuffer = new Uint8Array(1);
        await connection.read(requestBuffer);
        data = data + decoder.decode(requestBuffer);
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
    return path;
  }
}
