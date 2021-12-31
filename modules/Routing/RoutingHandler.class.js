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
      let requestURL = new URL(e.detail.request.request.url);
      e.detail.requestURL = requestURL;
      e.detail.request.request.getMime = function(filePath) {
        let fileBase = filePath.split(".");
        let fileMime = fileBase[fileBase.length-1].toUpperCase();
        let contentType = MIMEType[fileMime];
        if(contentType == null) {
          contentType = MIMEType.DEFAULT;
        }
        return contentType;
      }
      if(this.routes[requestURL.pathname] != null) {
        if(this.routes[requestURL.pathname].data.method == requestURL.method || this.routes[requestURL.pathname].data.method == "*") {
          e.detail.settings = this.routes[requestURL.pathname].settings;
          await this.handleRouting(this.routes[requestURL.pathname], e.detail);
          return true;
        }
      }

      let splitRoute = requestURL.pathname.split("/").reverse();
      let requestRouteReplacement = requestURL.pathname;
      splitRoute.push("");

      for(let routePart of splitRoute) {
        requestRouteReplacement = requestRouteReplacement.replace(new RegExp("\/$"), "");
        let route = requestRouteReplacement;
        if(this.routes[route] == null && this.routes[route + "*"] != null) {
          route = route + "*";
        }
        if(this.routes[route] != null) {
          if(this.routes[route].data.method == requestURL.method || this.routes[route].data.method == "*") {
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
