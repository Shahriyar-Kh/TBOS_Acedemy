const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const outputServer = path.join(root, ".output", "server", "index.mjs");
const outputPublic = path.join(root, ".output", "public");
const distServer = path.join(root, "dist", "server");
const distClient = path.join(root, "dist", "client");

if (!fs.existsSync(outputServer)) {
  console.error("Error: .output/server/index.mjs does not exist. Please run npm run build first.");
  process.exit(1);
}

fs.mkdirSync(distServer, { recursive: true });
fs.mkdirSync(distClient, { recursive: true });

if (fs.existsSync(outputPublic)) {
  fs.cpSync(outputPublic, distClient, { recursive: true });
}

const serverBridgeCode = `import handler from "../../.output/server/index.mjs";

export default {
  async fetch(req) {
    const overrides = new Map();
    const proxyReq = new Proxy(req, {
      get(t, prop) {
        if (prop === "headers") return t.headers;
        const val = overrides.has(prop) ? overrides.get(prop) : t[prop];
        if (typeof val === "function") {
          return val.bind(t);
        }
        return val;
      },
      set(t, prop, val) {
        overrides.set(prop, val);
        return true;
      },
    });
    return handler.fetch(proxyReq, {}, { waitUntil() {} });
  },
};
`;

fs.writeFileSync(path.join(distServer, "server.js"), serverBridgeCode, "utf8");
console.log("Preview bridge prepared successfully.");
