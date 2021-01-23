/**
  * Response - A http response
  */
export class Response {
  constructor(body) {
    this.encoder = new TextEncoder();
    this.body = this.encoder.encode(body);
    this.contentType = "application/json";
    try {
      let json = JSON.parse(body);
    } catch (e) {
      this.contentType = "text/html";
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
