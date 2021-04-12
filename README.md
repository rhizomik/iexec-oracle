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
docker build . --tag rogargon/yt-oracle:0.0.2
docker push rogargon/yt-oracle:0.0.2
```

Test locally:
```
docker run --rm \
    -v $(pwd)/iexec_out:/iexec_out \
    -e IEXEC_OUT=/iexec_out \
    rogargon/yt-oracle:0.0.2 ZwVNLDIJKVA QmPP8X2rWc2uanbnKpxfzEAAuHPuThQRtxpoY8CYVJxDj8
```

Deploy application:
```
iexec app deploy --chain goerli
iexec wallet getRLC --chain goerli
iexec account deposit 200 --chain goerli
iexec account show --chain goerli
```

Run application:
```
iexec app run --watch --chain goerli --args "ZwVNLDIJKVA QmPP8X2rWc2uanbnKpxfzEAAuHPuThQRtxpoY8CYVJxDj8"
iexec deal show 0x7542fdfdf05356d475449b34df7417015952dd457cf3ae4cfecdbcd346734f58
iexec task show 0x68bea416eb2bdd109c18f191a3054dc02b29424a052a242b521881b4f9f6573a --download my-result --chain goerli
```

