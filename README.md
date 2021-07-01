# YouTube DOracle

DOracle based on iExec providing YouTube API data on-chain.

Particularly, use the YouTube API to retrieve a video description using its ID. 
Then, check if the description contains the input string, e.g. a content hash.

## Getting Started

iExec quick start (https://docs.iex.ec/for-developers/quick-start-for-developers):
```
iexec wallet create
iexec init --skip-wallet
iexec wallet show --chain goerli
iexec storage init --chain goerli
iexec app init
```

Build application image:
```
docker build . --tag rogargon/yt-oracle:0.0.3
docker push rogargon/yt-oracle:0.0.3
```

NOTE: the digest of the image after pushing should be used as the `app.checkshum` value in `iexec.json`.

To test locally:
```
docker run --rm \
    -v $(pwd)/datasets:/iexec_in \
    -v $(pwd)/iexec_out:/iexec_out \
    -e IEXEC_IN=/iexec_in \
    -e IEXEC_OUT=/iexec_out \
    rogargon/yt-oracle:0.0.3 ZwVNLDIJKVA QmPP8X2rWc2uanbnKpxfzEAAuHPuThQRtxpoY8CYVJxDj8
```

Deploy application:
```
iexec app deploy --chain goerli
iexec wallet getRLC --chain goerli
iexec account deposit 200 --chain goerli
iexec account show --chain goerli
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
iexec dataset init --wallet-file UTC--2021-03-06T19-11-03.152000000Z--ABCD1234
```

And deploy it:
```
iexec dataset deploy --wallet-file UTC--2021-03-06T19-11-03.152000000Z--ABCD1234 --chain goerli
```

The dataset is now deployed at and address, for instance:
```
Deployed new dataset at address 0x5269d1AB2553cBEf5B2951635537c651df809c64
```

Finally push the secret for the encrypted dataset:
```
iexec dataset push-secret 0x5269d1AB2553cBEf5B2951635537c651df809c64 --secret-path .secrets/datasets/dataset.secret --wallet-file=UTC--2021-03-06T19-11-03.152000000Z--ABCD1234 --chain goerli
```

## Run Application

```
iexec app run --tag tee 0x6432775CF26F100fD573241dAAfA81F10333ef28 --dataset 0xFDD49ECd37aa3eBD0Acfb48C8DdA7CDB593932C0 --watch --chain goerli --args "ZwVNLDIJKVA QmPP8X2rWc2uanbnKpxfzEAAuHPuThQRtxpoY8CYVJxDj8"
iexec deal show 0x1ad59e11ec17ef3e2fd20c84c97374a30e4ac84bcc6198583ffc75def442ed54
iexec task show 0x6613028393f078fe0030e6f4bd5e36037c384c73871e61cbd42fc9d50d6695bf --download my-result --chain goerli
```
