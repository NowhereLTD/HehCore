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

      let httpRequest = Deno.serveHttp(connection);
      for await (let request of httpRequest) {
        this.dispatchEvent(new CustomEvent("handle", {
          detail: {
            connection: connection,
            request: request,
            Server: this
          }
        }));
      }

      /*
      request.loginAPIUser(this, connection);
      if(connection.user == null) {
        connection.user = {};
        connection.user.hasPermission = function() {return false;}
      }
      */
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

  loginAPIUser(server, connection) {
    if(this["authorization"]) {
      let key = this["authorization"].replace(" Bearer ", "");
      let users = server.configData.user ?? {};
      for(let username in users) {
        let user = users[username];
        for(let longkey in user.longkeys) {
          if(longkey == key) {
            let longkeyData = user.longkeys[longkey];
            let checkDate = new Date();
            if(checkDate.setTime(longkeyData.validity) > Date.now()) {
              connection.user = user;

              connection.user.hasPermission = function(checkPerm) {
                let splitPerm = checkPerm.split(".");
                if(this.permissions.includes("*") || this.permissions.includes(checkPerm)) {
                  return true;
                }
                let perm = "";
                for(let permission of splitPerm) {
                  perm = perm + permission + ".";
                  if(this.permissions.includes(perm + "*")) {
                    return true;
                  }
                }
                return false;
              }

            }else {
              delete(user.longkeys[longkey]);
            }
          }
        }
      }
    }
  }
}
