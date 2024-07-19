import dotenv from "dotenv";

dotenv.config();

interface RPCProvider {
  name: string;
  url: string;
}

const rpcProviders: RPCProvider[] = [
  {
    name: "EnvioHyperRPC",
    url: "https://eth.rpc.hypersync.xyz",
  },
  {
    name: "MeowRPC",
    url: "https://eth.meowrpc.com",
  },
  {
    name: "dRPCFreetier",
    url: `https://lb.drpc.org/ogrpc?network=ethereum&dkey=${process.env.DRPC_FREE_API_KEY}`,
  },
];

export default rpcProviders;
