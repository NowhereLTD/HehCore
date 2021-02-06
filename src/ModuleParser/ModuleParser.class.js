import { ModuleType } from "/src/Enums/ModuleType.enum.js";


/**
  * ModuleParser - Parse modules
  */
export class ModuleParser {
  constructor(server) {
    this.decoder = new TextDecoder("utf-8");
    this.extensions = [];
    this.server = server;
  }


  /**
   * loadModulePath - Load all modules from configuration
   *
   * @param {String}    modulePath          The path with modules
   * @param {String}  [parentPath=]         The last path to parent module
   * @param {boolean} [extensionLoad=false] Load only extension modules
   *
   * @returns {type} Description
   */
  async loadModulePath(modulePath, importPath = "", extensionLoad = false) {
    try {
      let configData = Deno.readFileSync(modulePath + "config.json");
      let data = JSON.parse(this.decoder.decode(configData));
      if(data.modules != null) {
        for(let subModule of data.modules) {
          await this.loadModulePath(modulePath + subModule, importPath + subModule, extensionLoad);
        }
      }
      if(extensionLoad) {
        if(data.type == ModuleType.MODULE_EXTENSION && data.path != null && data.name != null) {
          let ModuleImport = await import("/" + importPath + data.path);
          let extension = new ModuleImport[data.name](this.server);
          this.extensions.push(extension);
          if(extension.init != null) {
            await extension.init();
          }
        }
      }else {
        for(let extension of this.extensions) {
          if(extension.run != null) {
            await extension.run(modulePath, data);
          }
        }
      }
      return true;
    } catch (e) {
      console.log(e);
      console.log("Error: Cannot Load Module '" + importPath + "' .");
      return false;
    }
  }
}
