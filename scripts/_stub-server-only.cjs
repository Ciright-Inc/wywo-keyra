// Pre-loaded before scripts to neutralise `import "server-only"` so we can
// exercise WYWO lib modules from a Node entry point. The runtime guard exists
// only to prevent React Client Component bundles from pulling in server code,
// which does not apply to a CLI smoke test.
const Module = require("module");
const path = require("path");

const STUBS = {
  "server-only": path.join(__dirname, "_server-only-noop.cjs"),
  "libphonenumber-js": path.join(__dirname, "_libphonenumber-stub.cjs"),
};

const originalResolve = Module._resolveFilename;
Module._resolveFilename = function (request, parent, ...rest) {
  if (STUBS[request]) return STUBS[request];
  return originalResolve.call(this, request, parent, ...rest);
};
