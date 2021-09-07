# Instructions

1. Create a directory of images and manifests. The image and
   manifest file should have the same name with `.png` for images and
   `.json` for manifests.

   ```
   /assets
     0.json
     0.png
     1.json
     1.png
     ...
     {n}.json
     {n}.png
   ```
2. The manifest json files should follow the following schema. 

A few items of note:
- The `properties.files` field should always be `[{"url": "image.png", type: "image/png"}]`. The upload script will replace the index name with the static name of image.png.

```
{
  "name": "Holaplex Test Drop - 0",
  "symbol": "HTD",
  "description": "Simple but satisfying NFT to test Holaplex Drops. Let the drops run free.",
  "seller_fee_basis_points": 200,
  "attributes": [
    {
      "display_type":"string",
      "trait_type": "color",
      "value": "orange"
    },
    {
      "display_type":"string",
      "trait_type": "shape",
      "value": "square"
   }
  ],
  "collection": {
     "name": "Hoplex Drop Test - This is only a test",
     "family": "Holaplex" 
  },
  "properties": {
    "files": [{"uri":"image.png","type":"image/png"}],
    "category": "image",
    "creators": [
      {
        "address": "68mSAEgwwSYpjq3hrCSpHT4jzNW1fBSonktx33vgyp9m",
        "share": 97
      },
      {
        "address": "7riiuVB2JqFfKNZfqMgMmrR8cW6WWwtznUd7qLQARtEe",
        "share": 3
      } 
    ]
  }
  }
```

3. Run the metaplex cli to upload NFTs to Arweave and create Candy Machine Configuration on Solana Blockchain.

```
$ node ~/Code/kespinola/metaplex/js/packages/cli/build/cli.js  upload ./simple-shapes --url https://api.devnet.solana.com --keypair ~/.config/solana/devnet.json

Processing file: 0
Processing file: 1
Processing file: 2
Processing file: 3
Processing file: 4
Started awaiting confirmation for 2JUD1jdU5tTieh982oskX8GaJs73BrLCT914qiqqq2KKyFYzxshgQ8H74wiaBBzYoUYthDeeCT8H8aNMxu5DYTpV
REST null result for 2JUD1jdU5tTieh982oskX8GaJs73BrLCT914qiqqq2KKyFYzxshgQ8H74wiaBBzYoUYthDeeCT8H8aNMxu5DYTpV null
Resolved via websocket { err: null }
Returning status { err: null, slot: 78995512, confirmations: 0 }
Latency 2JUD1jdU5tTieh982oskX8GaJs73BrLCT914qiqqq2KKyFYzxshgQ8H74wiaBBzYoUYthDeeCT8H8aNMxu5DYTpV 0.880000114440918
transaction for arweave payment: {
  txid: '2JUD1jdU5tTieh982oskX8GaJs73BrLCT914qiqqq2KKyFYzxshgQ8H74wiaBBzYoUYthDeeCT8H8aNMxu5DYTpV',
  slot: 78995512
}
File uploaded: https://arweave.net/_dBEwWotNyh1-vVMRk70XTgW3TN2oN5sVFQAhPRRgWI
Processing file: 5
Processing file: 6
Processing file: 7
Writing indices  0 - 7
```

4. Run the `verify` command to ensure the collection creation was successful.

```
node ~/Code/kespinola/metaplex/js/packages/cli/build/cli.js verify                                                                                            
Number 8
Looking at key  0
Name Holaplex Test Drop - 0 with https://arweave.net/vgOD3zynrZvOMSKk-Hh7uA_84TOVD6OPnHCk65iHufw checked out
Looking at key  1
Name Holaplex Test Drop - 1 with https://arweave.net/T_gVksdIUnNhR9-26O8_9FaFOv7sx7anO7D1UjWQ838 checked out
Looking at key  2
Name Holaplex Test Drop - 2 with https://arweave.net/RygCfjCQLp2HsIl9Cp4jSsqlQpval8EuUTwsHZGSWaE checked out
Looking at key  3
Name Holaplex Test Drop - 3 with https://arweave.net/y1FewDj9PwvO3Kh3w893zQmMVMB9u_ke3h8MCNYRIug checked out
Looking at key  4
Name Holaplex Test Drop - 4 with https://arweave.net/_dBEwWotNyh1-vVMRk70XTgW3TN2oN5sVFQAhPRRgWI checked out
Looking at key  5
Name Holaplex Test Drop - 5 with https://arweave.net/2IgPl8Vmq6Pt_k-Kk59IcYNrDnITsWSEt2MV_o0g4uc checked out
Looking at key  6
Name Holaplex Test Drop - 6 with https://arweave.net/bAgHf-GpAMQ638qn6UUuZwtiyM_rYRk7pj0D8cR42Uo checked out
Looking at key  7
Name Holaplex Test Drop - 7 with https://arweave.net/wAKjc8zM_P_Bi30NtlFtSz0bk_y_97GPTJWWkC0PVrk checked out
```

5. Create a candy machine from the collection.

```
$ node ~/Code/kespinola/metaplex/js/packages/cli/build/cli.js  create_candy_machine --keypair ~/.config/solana/devnet.json --price 1

Done: CANDYMACHINE: BkCiHriuoQMyBWTLTmmhy1TL1JQ1UQSLYDSz3hZ4o7hz
```

6. Set a start date for the drop.

```
$ node ~/Code/kespinola/metaplex/js/packages/cli/build/cli.js  set_start_date --keypair ~/.config/solana/devnet.json --date 06 Sep 2021 23:00:00 GMT
Done 991378800 2JEmYv6YNJ2QsXWUKGWXPJ5jhTo38ZXTcmMkbz83Y7vx5DzicnubpBDCg4qVMXvfK1Gef3ErdWNitDcVDpNEWfeK
```