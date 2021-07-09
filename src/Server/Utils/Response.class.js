import { MIMEType } from "/src/Enums/MIMEType.enum.js";

/**
  * Response - A http response
  */
export class Response {
  constructor(params = {body: null, filePath: null}) {
    this.encoder = new TextEncoder();
    if(params.filePath != null) {
      let fileBase = params.filePath.split(".");
      let fileMime = fileBase[fileBase.length-1].toUpperCase();
      this.contentType = MIMEType[fileMime];
      if(this.contentType == null) {
        this.contentType = MIMEType.DEFAULT;
      }
      if(this.contentType.match("text") || this.contentType.match("json")) {
        this.body = this.encoder.encode(Deno.readTextFileSync(params.filePath));
      }else {
        this.body = Deno.readFileSync(params.filePath);
      }
    }else {
      this.body = this.encoder.encode(params.body);
      try {
        let json = JSON.parse(params.body);
        this.contentType = "application/json";
      } catch (e) {
        this.contentType = "text/html";
      }
    }
    this.httpVersion = "2.0";
    this.status = 200;
    this.statusText = "OK";
    this.serverName = "Heh";
    this.serverVersion = "1.0";
  }


  /**
   * send - Send this response to a connection
   *
   * @param {Connection} connection A tcp socket connection
   */
  async send(connection) {
    await this.sendHeader(connection);
    await this.sendBody(connection);
    await connection.close();
  }


  /**
   * sendHeader - Send the header response to a connection
   *
   * @param {Connection} connection A tcp socket connection
   */
  async sendHeader(connection) {
    await connection.write(this.encoder.encode("HTTP/" + this.httpVersion + " " + this.status + " " + this.statusText + "\r\n"));
    await connection.write(this.encoder.encode("Server: " + this.serverName + this.serverVersion + "\r\n"));
    await connection.write(this.encoder.encode("Content-Length: " +   this.body.length + "\r\n"));
    await connection.write(this.encoder.encode("Content-Type: " + this.contentType + "\r\n"));
  }

  /**
   * sendBody - Send the body response to a connection
   *
   * @param {Connection} connection A tcp socket connection
   */
  async sendBody(connection) {
    await connection.write(this.encoder.encode("\r\n"));
    await connection.write(this.body);
  }
}
