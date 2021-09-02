# YouTube DOracle

DOracle based on iExec providing YouTube API data on-chain.

Particularly, use the YouTube API to retrieve a video description using its ID. 
Then, check if the description contains the input string, e.g. a content hash.

Following guidelines for confidential computing at: https://docs.iex.ec/for-developers/confidential-computing

## Getting Started

iExec quick start (https://docs.iex.ec/for-developers/quick-start-for-developers):
```
iexec wallet create
iexec init --skip-wallet
iexec wallet show --chain viviani
iexec storage init --chain viviani
```

## Build Trusted Application

Initialize trusted application using TEE:

```
iexec app init --tee
```

Implement the application following the instructions at: 
https://docs.iex.ec/for-developers/confidential-computing/create-your-first-sgx-app

Build the TEE docker image using the `sconify.sh` template adapted to your case:
```
docker login registry.scontain.com:5050
./sconify.sh
```

The image build output includes the result of generating the fingerprint that allows the verification of the application,
called the `mrenclave`. It should be copied to `iexec.json` and looks like:
```
"mrenclave": "b17ca46661524cad37dd940604a07d30673138bf00ebdbd7baabcb0786ff6342"
```

The image can be now pushed to Docker hub:
```
docker push rogargon/yt-oracle:tee-debug
```

NOTE: the digest of the image after pushing should be used as the `app.checkshum` value in `iexec.json`.

The `app` configuration in `iexec.json` will look like:

```json
{
  "app": {
    "owner": "0xA5F57BDe93496562D63f5ad10a639237ecD48B31",
    "name": "yt-oracle",
    "type": "DOCKER",
    "multiaddr": "docker.io/rogargon/yt-oracle:tee-debug",
    "checksum": "0x79cc1c9ebb0eabde94490e3bd519ba0d8e3f685dce8c54a939d3003a7212ffdc",
    "mrenclave": {
      "provider": "SCONE",
      "version": "v5",
      "entrypoint": "node /app/index.js",
      "heapSize": 1073741824,
      "fingerprint": "b17ca46661524cad37dd940604a07d30673138bf00ebdbd7baabcb0786ff6342"
    }
  }
}
```

To test locally:
```
docker run --rm \
    -v $(pwd)/datasets:/iexec_in \
    -v $(pwd)/iexec_out:/iexec_out \
    -e IEXEC_IN=/iexec_in \
    -e IEXEC_OUT=/iexec_out \
    rogargon/yt-oracle:tee-debug ZwVNLDIJKVA QmPP8X2rWc2uanbnKpxfzEAAuHPuThQRtxpoY8CYVJxDj8
```

Deploy application:
```
iexec app deploy --chain viviani
```

## Encrypted Dataset for API Key

Initialize encrypted dataset:
```
iexec dataset init --encrypted
```

Add file `datasets/original/key.txt` with the API Key. Then, encrypt it:
```
iexec dataset encrypt
```

Init the dataset:
```
iexec dataset init
```

Complete the definition of the dataset in `iexec.json`: 

- Set `multiaddr` to a URI pointing to the encrypted dataset, for instance, if pushed to GitHub:
```
"multiaddr": "https://raw.githubusercontent.com/rhizomik/yt-oracle/main/datasets/encrypted/key.txt.enc", 
```

- And the dataset `checksum` computed using sha246sum:
```
sha256sum datasets/encrypted/key.txt.enc
```

And deploy it:
```
iexec dataset deploy --chain viviani
```

The dataset is now deployed at and address, for instance:
```
Deployed new dataset at address 0x4dd80de288BA06c95a7246f3418fe7B38fe6C293
```

Add to `chain.json` the SMS for chain viviani:

```
   "viviani": { "sms": "https://v6.sms.debug-tee-services.viviani.iex.ec" },
```

Finally push the secret for the encrypted dataset
```
iexec dataset push-secret --chain viviani
iexec dataset check-secret --chain viviani
```

## Run Application

To run the application, and send the results to the smart contract address specified by the `callback` parameter,
use the following command (Note: chain parameter not defined so using default as set in `chain.json`, viviani)

```shell
iexec app run 0x345B8215b629cD0c4D97F53A24D3de14706d26EB --tag tee \
  --dataset 0x4dd80de288BA06c95a7246f3418fe7B38fe6C293 --workerpool 0xe6806E69BA8650AF23264702ddD43C4DCe35CcCe \
  --callback 0x0C22D575B783CE85322533f11334855dD24Ef936 \
  --watch --args "ZwVNLDIJKVA QmPP8X2rWc2uanbnKpxfzEAAuHPuThQRtxpoY8CYVJxDj8"
```

Finally, you can inspect the resulting deal and task using the following commands:

```
iexec deal show 0xfc3faed714deab11de1ca27038efa85acae655e08d7f120db6f82e8813ebda60
iexec task show 0xf58caf12e2ef8df8907b851765e1f631e467b84d111289ac4b1097008b474142
```

The output for the task includes the `resultsCallback` field with the ABI encoding of the output, for instance:

```
resultsCallback:      0x000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000a00000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000000b5a77564e4c44494a4b5641000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002e516d50503858327257633275616e626e4b7078667a45414175485075546851527478706f59384359564a78446a38000000000000000000000000000000000000
```

If the output is ABI decoded, for instance using https://adibas03.github.io/online-ethereum-abi-encoder-decoder/#/decode
and providing as `Argument Types` the input `string,string,bool`, the output should be:

```
ZwVNLDIJKVA,QmPP8X2rWc2uanbnKpxfzEAAuHPuThQRtxpoY8CYVJxDj8,true
```
