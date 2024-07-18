// Load environment variables
require("dotenv").config();

module.exports = [
  {
    name: "MeowRPC",
    url: "https://eth.meowrpc.com",
  },
  {
    name: "EnvioHyperRPC",
    url: "https://eth.rpc.hypersync.xyz",
  },
  {
    name: "dRPCFreetier",
    url: `https://lb.drpc.org/ogrpc?network=ethereum&dkey=${process.env.DRPC_FREE_API_KEY}`,
  },
];
