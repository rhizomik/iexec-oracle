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
iexec app init
```

Build application image:
```
docker image build . --tag rogargon/yt-oracle:0.0.4 --progress plain
```

The image build output includes the result of generating the fingerprint that allows the verification of the application,
called the `mrenclave`. It should be copied to `iexec.json` and looks like:
```
"mrenclave": "d6db85f3ef064946fb28f5b03ef59f5fa2db8b332a576a2be39f5e9ba502bf1d|4d5c4c0721339aef80f12339c2c85b38|b0e6db6e6e092428331c5203de6e65aee694bed0a6c7a4728bddce137e217d65|node /app/index.js"
```

The image can be now pushed to Docker hub:
```
docker push rogargon/yt-oracle:0.0.4
```

NOTE: the digest of the image after pushing should be used as the `app.checkshum` value in `iexec.json`.

To test locally:
```
docker run --rm \
    -v $(pwd)/datasets:/iexec_in \
    -v $(pwd)/iexec_out:/iexec_out \
    -e IEXEC_IN=/iexec_in \
    -e IEXEC_OUT=/iexec_out \
    rogargon/yt-oracle:0.0.4 ZwVNLDIJKVA QmPP8X2rWc2uanbnKpxfzEAAuHPuThQRtxpoY8CYVJxDj8
```

Deploy application:
```
iexec app deploy --chain bellecour
iexec wallet getRLC --chain bellecour
iexec account deposit 20000000 --chain bellecour
iexec account show --chain bellecour
```

## Encrypted Dataset for API Key

Initialize encrypted dataset:
```
iexec dataset init --encrypted
```

Add file `datasets/original/key.txt` with the API Key. Then, encrypt it:
```
iexec dataset encrypt --algorithm scone
```

Init the dataset:
```
iexec dataset init
```

Complete the definition of the dataset in `iexec.json`: 

- Set `multiaddr` to a URI pointing to the encrypted dataset, for instance:
```
"multiaddr": "https://github.com/rhizomik/yt-oracle/raw/main/datasets/encrypted/dataset_key.txt.zip", 
```

- And the dataset `checksum` computed using sha246sum:
```
sha256sum datasets/encrypted/dataset_key.txt.zip
```

And deploy it:
```
iexec dataset deploy --chain bellecour
```

The dataset is now deployed at and address, for instance:
```
Deployed new dataset at address 0x66685654E2D19C67969b23c0E6F04669180e82C4
```

Finally push the secret for the encrypted dataset:
```
iexec dataset push-secret 0x66685654E2D19C67969b23c0E6F04669180e82C4 --secret-path .secrets/datasets/dataset.secret --chain bellecour
```

## Run Application

```
iexec app run --tag tee 0x4B7791607BDb72cfA01E67Aed68c702FEB100985 --dataset 0x66685654E2D19C67969b23c0E6F04669180e82C4 --watch --chain bellecour --args "ZwVNLDIJKVA QmPP8X2rWc2uanbnKpxfzEAAuHPuThQRtxpoY8CYVJxDj8"
iexec deal show 0x731d239ce7f8cb725a2f369f48945cb98ec8a9a339c635c11e33c25b75aa9fd5
iexec task show 0x33f3c70144cd008f6613ae425291673cf1e0c49eb32f58b85cf9ff53c361132c --download my-result --chain bellecour
```
