
export class Request {
  constructor(raw) {
    this.parseFromRaw(raw);
    this.parseContentRegex = new RegExp("Content-Disposition\:\ form-data; name=\"([^\n]*)\"\r\n\r\n(.*)", "gms");
    this.parseFileContentRegex = new RegExp("Content-Disposition\:\ form-data; name=\"([^\n]*)\"; filename=\"([^\n]*)\"\r\nContent-Type\:\ ([^\n]*)(.*)", "gms");
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

    if(this["route"]) {
      this["getraw"] = this["route"].split("?")[1];
      this["route"] = this["route"].replace(/\?(.*)/, "");
    }

    if(this["content-type"] != null) {
      this.boundary = this["content-type"].split(" multipart/form-data; boundary=")[1];
    }
  }

  setContentData(data) {
    this.content = {};

    if(this["content-type"].match("multipart/form-data")) {
      this.contentData = data;
      let contentArray = this.contentData.split("\r\n--" + this.boundary + "\r\n");
      contentArray.shift();

      for(let line of contentArray) {
        line = line.replaceAll("\r\n--" + this.boundary, "");
        let isFile = false;
        let m;
        while((m = this.parseFileContentRegex.exec(line)) !== null) {
          isFile = true;
          if(m.index === this.parseFileContentRegex.lastIndex) {
            this.parseFileContentRegex.lastIndex++;
          }
          this.content[m[1]] = {
            "type": "file",
            "name": m[2],
            "filetype": m[3],
            "data": m[4]
          };
        }

        if(!isFile) {
          while((m = this.parseContentRegex.exec(line)) !== null) {
            if(m.index === this.parseContentRegex.lastIndex) {
              this.parseContentRegex.lastIndex++;
            }
            this.content[m[1]] = {
              "type": "text",
              "data": m[2]
            };
          }
        }
      }
    }else {
      console.log("Content type is actually not supported!");
    }
  }

  loginAPIUser(server, connection) {
    if(this["authorization"]) {
      let key = this["authorization"].replace(" Bearer ", "");
      let users = server.configData.user ?? {};
      for(let username in users) {
        let user = users[username];
        for(let longkey in user.longkeys) {
          if(longkey == key) {
            let longkeyData = user.longkeys[longkey];
            let checkDate = new Date();
            if(checkDate.setTime(longkeyData.validity) > Date.now()) {
              connection.user = user;

              connection.user.hasPermission = function(checkPerm) {
                let splitPerm = checkPerm.split(".");
                if(this.permissions.includes("*") || this.permissions.includes(checkPerm)) {
                  return true;
                }
                let perm = "";
                for(let permission of splitPerm) {
                  perm = perm + permission + ".";
                  if(this.permissions.includes(perm + "*")) {
                    return true;
                  }
                }
                return false;
              }

            }else {
              delete(user.longkeys[longkey]);
            }
          }
        }
      }
    }
  }
}
