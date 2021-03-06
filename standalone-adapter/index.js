import http from "http";
import { BaseAdapter } from "@ritley/core";

export default class StandaloneAdapter extends BaseAdapter {
  constructor(config) {
    super(config);
    this.server = this.createServer();
    if(this.config.static && this.config.base) {
      this.setStaticSrv();
    }
  }

  createServer() {
    const nodeInstance = http.createServer();
    nodeInstance.listen(this.config.port);
    nodeInstance.on("request", (...args) => this.handle(...args));
    return nodeInstance;
  }

  setStaticSrv() {
    const ecstatic = require("ecstatic");
    const staticMiddleware = ecstatic({ root: `${this.config.static}`, handleError: false });
    this.server.on("request", (req, res) =>
      !req.url.startsWith(this.config.base) && staticMiddleware(req, res));
  }
}
