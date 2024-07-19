// Load environment variables
require("dotenv").config();

module.exports = [
  {
    name: "EnvioHyperRPC", // no spaces as its used as an object field name
    url: "https://eth.rpc.hypersync.xyz",
  },
  {
    name: "MeowRPC",
    url: "https://eth.meowrpc.com",
  },
  // { // doesn't support eth_
  //   name: "Blxrbdn",
  //   url: "https://uk.rpc.blxrbdn.com",
  // },
  {
    name: "dRPCFreetier",
    url: `https://lb.drpc.org/ogrpc?network=ethereum&dkey=${process.env.DRPC_FREE_API_KEY}`,
  },
];
