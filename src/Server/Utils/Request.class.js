
export class Request {
  constructor(raw) {
    this.parseFromRaw(raw);
    //this.parseContentRegex = /Content-Disposition\:\ form-data; name="(.*)"\r\n\r\n(.*)/gms;
    //this.parseFileContentRegex = //gms;
  }

  parseFromRaw(raw) {
    let rawArray = raw.split("\n");
    let methodLineArray = rawArray.shift().split(" ");
    this.method = methodLineArray[0];
    this.route = methodLineArray[1];
    this.httpVersion = methodLineArray[2];
    rawArray.pop();
    for(let line of rawArray) {
      if(line == "\r") {
        continue;
      }
      let lineArray = line.split(/:(.+)/);
      let name = lineArray[0].toLowerCase();
      this[name] = lineArray[1];
    }

    let boundary = this["content-type"].split(" multipart/form-data; boundary=")[1];
    this.parseContentRegex = new RegExp("Content-Disposition\:\ form-data; name=\"(.*)\"\r\n\r\n(.*)" + boundary, "gms");
    this.parseFileContentRegex = new RegExp("Content-Disposition\:\ form-data; name=\"([^\n]*)\"; filename=\"([^\n]*)\"\r\nContent-Type\:\ ([^\n]*)(.*)--" + boundary, "gms");
  }

  setContentData(data) {
    this.contentData = {};
    if(this["content-type"].match("multipart/form-data")) {
      this.content = data;
      let m;
      while((m = this.parseContentRegex.exec(data)) !== null) {
        if(m.index === this.parseContentRegex.lastIndex) {
          this.parseContentRegex.lastIndex++;
        }
        this.contentData[m[1]] = {
          "type": "text",
          "data": m[2]
        };
      }

      while((m = this.parseFileContentRegex.exec(data)) !== null) {
        if(m.index === this.parseFileContentRegex.lastIndex) {
          this.parseFileContentRegex.lastIndex++;
        }
        this.contentData[m[1]] = {
          "type": "file",
          "name": m[2],
          "filetype": m[3],
          "data": m[4]
        };
      }
    }else {
      console.log("Content type is actually not supported!");
    }
  }
}
