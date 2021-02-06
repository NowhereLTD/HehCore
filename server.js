import { Server } from "/src/Server/Server.class.js";
import { ModuleParser } from "/src/ModuleParser/ModuleParser.class.js";

let server = new Server();
let moduleParser = new ModuleParser(server);
await moduleParser.loadModulePath(server.file2Path(import.meta.url) + "/", "", true);
await moduleParser.loadModulePath(server.file2Path(import.meta.url) + "/");
await server.listen();
