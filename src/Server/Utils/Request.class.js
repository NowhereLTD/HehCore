
export class Request {
  constructor(raw) {
    this.parseFromRaw(raw)
  }

  parseFromRaw(raw) {
    let rawArray = raw.split("\n");
    let methodLineArray = rawArray.shift().split(" ");
    this.method = methodLineArray[0];
    this.route = methodLineArray[1];
    this.httpVersion = methodLineArray[2];
    rawArray.pop();
    for(let line of rawArray) {
      let lineArray = line.split(/:(.+)/);
      let name = lineArray[0].toLowerCase();
      this[name] = lineArray[1];
    }
  }
}
