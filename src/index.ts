import fetch from "node-fetch";
import fs from "fs";
import { performance } from "perf_hooks";
import rpcProviders from "./config";

console.log("rpcProviders", rpcProviders);

// Load environment variables
require("dotenv").config();

const seedBlock = 18118338;
const seedBlockHex = "0x" + seedBlock.toString(16);

interface RPCRequest {
  id: number;
  jsonrpc: string;
  method: string;
  params: any[];
}

const ethBlockNumberRPCRequest = (): RPCRequest => {
  return {
    id: 1,
    jsonrpc: "2.0",
    method: "eth_blockNumber",
    params: [],
  };
};

const ethGetLogsRPCRequest = (randomBlockNumber: number): RPCRequest => {
  const startBlock = randomBlockNumber;
  const blockRange = process.env.ETH_GETLOGS_BLOCKRANGE || 100;
  const endBlock = Number(startBlock) + Number(blockRange);
  const startBlockHex = "0x" + startBlock.toString(16);
  const endBlockHex = "0x" + endBlock.toString(16);

  return {
    id: 1,
    method: "eth_getLogs",
    jsonrpc: "2.0",
    params: [
      {
        address: ["0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"], // usdc
        fromBlock: startBlockHex,
        toBlock: endBlockHex,
        topics: [
          "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef", // transfer events
        ],
      },
    ],
  };
};

const ethGetBlockReceiptsRPCRequest = (
  randomBlockNumber: number
): RPCRequest => {
  let blockNumberHex = "0x" + randomBlockNumber.toString(16);

  return {
    id: 1,
    jsonrpc: "2.0",
    method: "eth_getBlockReceipts",
    params: [blockNumberHex],
  };
};

// Function to make RPC request
async function makeRPCRequest(
  endpoint: string,
  request: RPCRequest
): Promise<number | null> {
  const startTime = performance.now();
  try {
    let resp = await fetch(endpoint, {
      method: "POST",
      body: JSON.stringify(request),
      headers: { "Content-Type": "application/json" },
    });
    if (!resp.ok) {
      console.warn("Request failed", resp);
      return -1; // null / undefined may be better
    }

    if (process.env.VERBOSE == "true") {
      console.log(
        "rpc response length",
        (await resp.json())["result"]["length"]
      );
    }

    const endTime = performance.now();
    return endTime - startTime; // Return time taken in milliseconds
  } catch (error) {
    console.error(`Error making request to ${endpoint}:`, error);
    return null;
  }
}

// Function to get random block number to shift the range of blocks to query to prevent caching impacting results
function getRandomBlock(seedBlock: string): number {
  const seedBlockNumber = parseInt(seedBlock, 16);
  const entropy = 100_000;
  const randomNumberWithinEntropy = Math.floor(Math.random() * entropy);
  const randomBlock = randomNumberWithinEntropy + seedBlockNumber;
  return randomBlock;
}

function saveAndLogBenchmarkResults(rawResults: any, summaryResults: any) {
  //   Save raw results to file
  const timestamp = new Date().toISOString();
  const rawResultsFilePath = `data/raw/results-${timestamp}.json`;
  const rawResultsContents = JSON.stringify(rawResults, null, 2);
  fs.writeFileSync(rawResultsFilePath, rawResultsContents);
  console.log(`Raw results saved to ${rawResultsFilePath}`);

  // Save summary results to file
  const summaryResultsFilePath = `data/results-${timestamp}.json`;
  fs.writeFileSync(
    summaryResultsFilePath,
    JSON.stringify(summaryResults, null, 2)
  );
  console.log(`Summary results saved to ${summaryResultsFilePath}`);

  // Save latest results to results.txt
  const latestResultsFilePath = "results.txt";

  fs.writeFileSync(
    latestResultsFilePath,
    JSON.stringify(summaryResults, null, 2)
  );
  console.log(`Latest results saved to ${latestResultsFilePath}`);
  console.log("\n");
  console.log("Summary results");
  console.log("----------");
  console.log(summaryResults);
}

// Main function to run benchmarks
async function runBenchmarks() {
  type MethodName = "eth_blockNumber" | "eth_getLogs" | "eth_getBlockReceipts";

  interface Method {
    name: MethodName;
    method: (randomBlockNumber: number) => RPCRequest;
  }

  const methods: Method[] = [
    {
      name: "eth_blockNumber",
      method: () => ethBlockNumberRPCRequest(),
    },
    {
      name: "eth_getLogs",
      method: (randomBlockNumber: number) =>
        ethGetLogsRPCRequest(randomBlockNumber),
    },
    {
      name: "eth_getBlockReceipts",
      method: (randomBlockNumber: number) =>
        ethGetBlockReceiptsRPCRequest(randomBlockNumber),
    },
  ];

  const rawResults: Record<MethodName, number[][]> = {
    eth_blockNumber: [],
    eth_getLogs: [],
    eth_getBlockReceipts: [],
  };

  const summaryResults: Record<
    MethodName,
    Record<string, { averageTime: number; successRate: string }>
  > = {
    eth_blockNumber: {},
    eth_getLogs: {},
    eth_getBlockReceipts: {},
  };

  for (let method of methods) {
    console.log(`\n`);
    console.log(`Benchmarking ${method.name}`);
    console.log(`--------`);

    // Iterate over RPC providers
    for (let { name, url } of rpcProviders) {
      console.log(`Benchmarking ${name}...`);
      const requestTimes: number[] = [];

      // Make 30 iterations of RPC requests by default unless overridden by ITERATIONS environment variable
      const iterations = process.env.ITERATIONS || 30;

      for (let i = 0; i < Number(iterations); i++) {
        // Make eth_getLogs RPC request
        let blockNumber = getRandomBlock(seedBlockHex);

        const requestTime = await makeRPCRequest(
          url,
          method.method(blockNumber)
        );
        if (requestTime !== null) {
          requestTimes.push(requestTime);
          if (process.env.VERBOSE == "true") {
            console.log(`${i + 1}/${iterations}: ${requestTime.toFixed(2)} ms`);
          }
        }
      }

      // Store raw results
      rawResults[method.name].push(requestTimes);

      const successfulRequests = requestTimes.filter((time) => time !== -1);
      // Calculate average request time
      const averageRequestTime =
        successfulRequests.reduce((acc, curr) => acc + curr, 0) /
        successfulRequests.length;

      summaryResults[method.name][name] = {
        averageTime: averageRequestTime,
        successRate: `${successfulRequests.length}/${iterations}`,
      };

      console.log(
        `\n Average request time for ${name}: ${averageRequestTime.toFixed(
          2
        )} ms \n`
      );
    }
  }

  console.log("benchmarks complete");

  saveAndLogBenchmarkResults(rawResults, summaryResults);
}

// Run benchmarks
runBenchmarks();
