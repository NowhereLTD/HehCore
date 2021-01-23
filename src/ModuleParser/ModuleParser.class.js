import { ModuleType } from "../Enums/ModuleType.enum.js";


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
  async loadModulePath(modulePath, parentPath = "", extensionLoad = false) {
    try {
      modulePath = parentPath + modulePath;
      let configData = Deno.readFileSync(modulePath + "config.json");
      let data = JSON.parse(this.decoder.decode(configData));
      if(data.modules != null) {
        for(let subModule of data.modules) {
          await this.loadModulePath(subModule, modulePath, extensionLoad);
        }
      }
      if(extensionLoad) {
        if(data.type == ModuleType.MODULE_EXTENSION && data.path != null && data.name != null) {
          let ModuleImport = await import(modulePath + data.path)
          this.extensions.push(new ModuleImport[data.name](this.server));
        }
      }else {
        for(let extension of this.extensions) {
          await extension.run(modulePath, data);
        }
      }
      return true;
    } catch (e) {
      console.log(e);
      console.log("Error: Cannot Load Module.");
      return false;
    }
  }
}
