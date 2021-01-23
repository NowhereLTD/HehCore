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

      if(this.routes[requestRoute] != null) {
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
          await this.handleRouting(this.routes[route], e.detail);
          return true;
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
    let Router = new RoutingModule[module.name](data);
  }

  /**
   * run - First init module default method
   *
   * @param {String} modulePath The path to the module
   * @param {JSON}   data       The module data
   */
  async run(modulePath, data) {
    if(data.type == "Router") {
      for(let route in data.routes) {
        this.routes[route] = {
          "name": data.routes[route].name,
          "path": modulePath + data.routes[route].path
        }
      }
    }
  }
}
