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
iexec wallet show --chain bellecour
iexec storage init --chain bellecour
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
"mrenclave": "0e938832816e0da3e27a43670316a1b9333cd34112f13dca1546e62608701a37"
```

The image can be now pushed to Docker hub:
```shell
docker push rogargon/yt-oracle:tee-debug
```

NOTE: the digest of the image after pushing should be used as the `app.checkshum` value in `iexec.json`. 
It can be also computed using the command:
```shell
docker pull rogargon/yt-oracle:tee-debug | grep "Digest: sha256:" | sed 's/.*sha256:/0x/'
```

The `app` configuration in `iexec.json` will look like:

```json
{
  "app": {
    "owner": "0xA5F57BDe93496562D63f5ad10a639237ecD48B31",
    "name": "yt-oracle",
    "type": "DOCKER",
    "multiaddr": "docker.io/rogargon/yt-oracle:tee-debug",
    "checksum": "0xc7bbef0dcaadc526a96c7d76b7df49c5f600466f27faa3911727539142da393e",
    "mrenclave": {
      "framework": "SCONE",
      "version": "v5",
      "entrypoint": "node /app/index.js",
      "heapSize": 1073741824,
      "fingerprint": "0e938832816e0da3e27a43670316a1b9333cd34112f13dca1546e62608701a37"
    }
  }
}
```

To test locally, using the non-TEE version of the image:
```shell
docker run --rm \
    -e IEXEC_APP_DEVELOPER_SECRET=<API_KEY> \
    -v $(pwd)/iexec_out:/iexec_out \
    -e IEXEC_IN=/iexec_in \
    -e IEXEC_OUT=/iexec_out \
    rogargon/yt-oracle:temp-non-tee ZwVNLDIJKVA QmPP8X2rWc2uanbnKpxfzEAAuHPuThQRtxpoY8CYVJxDj8
```

Finally, deploy application:
```shell
iexec app deploy --chain bellecour
```

## Push an application developer secret to the SMS

Push the secret API key to the SMS, which will be accessible as `IEXEC_APP_DEVELOPER_SECRET` environment variable:
```shell
iexec app push-secret --chain bellecour
```

The existence of the secret can be checked using:
```shell
iexec app check-secret --chain bellecour
```

## Run Application

Before running the application, initialize the storage:
```shell
iexec storage init --chain bellecour --tee-framework scone
```

To run the application, and send the results to the smart contract address specified by the `callback` parameter,
use the following command:
```shell  
iexec app run 0xe5F19dbf1eeE610E03277797925B22a3855d7448 --tag tee,scone \
  --workerpool debug-v8-bellecour.main.pools.iexec.eth --watch \
  --args "ZwVNLDIJKVA QmPP8X2rWc2uanbnKpxfzEAAuHPuThQRtxpoY8CYVJxDj8" \
  --callback 0x36dA71ccAd7A67053f0a4d9D5f55b725C9A25A3E \
  --chain bellecour
```

The task execution log can be accesses using the command:
```shell
iexec task debug 0x75e60721f4a11af35ca390867e7847c852b5d4036ba48cffda89b3f5571f02a0 --logs
```

Finally, you can inspect the resulting deal and task using the following commands:

```
iexec deal show 0xe52499f478c91af50ba6834675998461f0290a0ca1cc58f82daad400d535cb51
iexec task show 0x75e60721f4a11af35ca390867e7847c852b5d4036ba48cffda89b3f5571f02a0
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
