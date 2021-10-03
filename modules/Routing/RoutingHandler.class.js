import { MIMEType } from "/src/Enums/MIMEType.enum.js";

/**
  * RoutingHandler - The routing handler module extension
  */
export class RoutingHandler {
  constructor(server) {
    this.server = server;
    this.routes = {};
    this.server.RoutingHandler = this;

    this.server.addEventListener("handle", async function(e) {
      let requestRoute = e.detail.request.request.url;
      requestRoute = requestRoute.replace("http://", "");
      requestRoute = requestRoute.replace(e.detail.request.request.headers.get("host") + "/", "");
      let requestMethod = e.detail.request.request.method;
      e.detail.request.route = requestRoute;
      e.detail.request.getMime = function(filePath) {
        let fileBase = filePath.split(".");
        let fileMime = fileBase[fileBase.length-1].toUpperCase();
        let contentType = MIMEType[fileMime];
        if(contentType == null) {
          contentType = MIMEType.DEFAULT;
        }
        return contentType;
      }
      if(this.routes[requestRoute + "/"] != null) {
        if(this.routes[requestRoute + "/"].data.method == requestMethod || this.routes[requestRoute + "/"].data.method == "*") {
          e.detail.settings = this.routes[requestRoute + "/"].settings;
          await this.handleRouting(this.routes[requestRoute + "/"], e.detail);
          return true;
        }
      }

      let splitRoute = requestRoute.split("/").reverse();
      let requestRouteReplacement = requestRoute;
      splitRoute.push("");

      for(let routePart of splitRoute) {
        requestRouteReplacement = requestRouteReplacement.replace(new RegExp("\/$"), "");
        let route = requestRouteReplacement;
        if(this.routes[route] == null && this.routes[route + "*"] != null) {
          route = route + "*";
        }
        if(this.routes[route] != null) {
          if(this.routes[route].data.method == requestMethod || this.routes[route].data.method == "*") {
            e.detail.settings = this.routes[route].settings;
            await this.handleRouting(this.routes[route], e.detail);
            return true;
          }
        }
        requestRouteReplacement = requestRouteReplacement.replace(new RegExp(routePart + "$"), "");
      }
    }.bind(this));
  }

  /**
   * handleRouting - Handle a single routing request
   *
   * @param {JSON} module JSON module data
   * @param {JSON} data   JSON route data
   */
  async handleRouting(module, data) {
    let RoutingModule = await import(module.path);
    let Router = await new RoutingModule[module.data.name](data);
  }

  /**
   * run - First init module default method
   *
   * @param {String} modulePath The path to the module
   * @param {JSON}   data       The module data
   */
  async run(modulePath, importPath, data) {
    if(data.type == "Router") {
      for(let route in data.routes) {
        this.routes[route] = {
          "data": data.routes[route],
          "path": "/" + importPath + data.routes[route].path,
          "settings": data.settings
        }
      }
    }
  }
}
