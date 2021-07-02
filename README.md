# YouTube DOracle

DOracle based on iExec providing YouTube API data on-chain.

Particularly, use the YouTube API to retrieve a video description using its ID. 
Then, check if the description contains the input string, e.g. a content hash.

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
# docker image build . --tag rogargon/yt-oracle:0.0.4 --progress plain
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
iexec app run --tag tee 0x977b662995B54D49BEA3e3A46296C525986EAC6E --dataset 0x66685654E2D19C67969b23c0E6F04669180e82C4 --watch --chain bellecour --args "ZwVNLDIJKVA QmPP8X2rWc2uanbnKpxfzEAAuHPuThQRtxpoY8CYVJxDj8"
iexec deal show 0x474d61096e31c937c46acc3fcd7bc113c0b8a265c75dd1d332b74c7fa1d528dc
iexec task show 0xcb800430fe9c026e9490f9f68984b9510b5b3e29916db92564afebd2aaa7e513 --download my-result --chain bellecour
```
