import { Server } from "/src/Server/Server.class.js";
import { ModuleParser } from "/src/ModuleParser/ModuleParser.class.js";

let server = new Server();
let moduleParser = new ModuleParser(server);
await moduleParser.loadModulePath(Deno.cwd() + "/", "", true);
await moduleParser.loadModulePath(Deno.cwd() + "/");
await server.listen();
