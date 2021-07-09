/**
  * RoutingHandler - The routing handler module extension
  */
export class RoutingHandler {
  constructor(server) {
    this.server = server;
    this.routes = {};
    this.server.RoutingHandler = this;

    this.server.addEventListener("handle", async function(e) {
      let requestRoute = e.detail.request.route;
      let requestMethod = e.detail.request.method;

      if(this.routes[requestRoute] != null) {
        e.detail.settings = this.routes[requestRoute].settings;
        await this.handleRouting(this.routes[requestRoute], e.detail);
        return true;
      }

      let splitRoute = requestRoute.split("/").reverse();
      let requestRouteReplacement = requestRoute;

      for(let routePart of splitRoute) {
        requestRouteReplacement = requestRouteReplacement.replace(new RegExp("\/$"), "");
        requestRouteReplacement = requestRouteReplacement.replace(new RegExp(routePart + "$"), "");
        let route = requestRouteReplacement + "*";
        if(this.routes[route] != null) {
          if(this.routes[route].data.method == requestMethod || this.routes[route].data.method == "*") {
            e.detail.settings = this.routes[route].settings;
            await this.handleRouting(this.routes[route], e.detail);
            return true;
          }
        }
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
