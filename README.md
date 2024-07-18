# Basic rpc latency script for benchmarking

In this script we run a very simple vanilla JS script to run iterations of of different rpc providers across a few interested rpc read methods

> Note: currently results arnt factoring failed requests and hence if a req fails which happens quite often with bad rpc's the time is averaged from the failed requests too

## Run

`pnpm i`
`pnpm start`
`ITERATIONS=100 pnpm start` Run with 100 iterations
`ETH_GETLOGS_BLOCKRANGE=1000 pnpm start` Run with a block range of 1000 for eth_getLogs // note many endpoints will fail for large blockranges
`VERBOSE=true pnpm start` for extra logging, useful for slow network tests to see the progress

## How it works

The raw results from the run are saved into the folder `data/raw` and are saved in a file named by the timestamp it was created, similarily a summary of the results is saved to a file in the `data` folder named results-(timestamp).json, where timestamp is the timestamp generated when the script was run. The latest results are also save to a file `results.txt` in the root directory as the results from the latest run.

The following rpc methods are tested;

`eth_blockNumber`
`eth_getLogs`
`eth_getBlockReceipts`

Configure the config.js file to specify which rpc endpoints you would like to test, use the .env file if you would like to add api keys etc

The raw data files stored in results-(timestamp).json as an object per rpc method which has an entry for each rpc endpoint and the values are is an array of the time taken in milliseconds of each iteration.

By default the script makes 30 iterations, you can adjust this with an env variable

The results.txt file displays this as a table for each rpc method with the average time in milliseconds for each rpc endpoint.

The script uses the native node-fetch library and makes the following requests

## eth_getLogs

(eth_getLogs of USDT transfers)

```json
{
  "id": 1,
  "method": "eth_getLogs",
  "jsonrpc": "2.0",
  "params": [
    {
      "address": "0xdAC17F958D2ee523a2206206994597C13D831ec7",
      "fromBlock": "0x989610",
      "toBlock": "0x989684",
      "topics": [
        "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef"
      ]
    }
  ]
}
```

Except where the fromBlock value and toBlock value are randomized with the same block range of 100 blocks to prevent cached rpc requests from influencing the results. The block range is in hex values.

## eth_blockNumber (susceptible to caching)

```json
{
  "id": 1,
  "jsonrpc": "2.0",
  "method": "eth_blockNumber"
}
```

## eth_getBlockReceipts (with rnd block num)

{
"id": 1,
"jsonrpc": "2.0",
"method": "eth_getBlockReceipts",
"params": [
"latest"
]
}

# Furtherwork

- Add additional data to the raw data & summaries such as the number of iterations, the system run on and possibly the internet speed etc
