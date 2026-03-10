# Walrus Sites Documentation

## Installing the Site Builder

### Installation

The `site-builder` client binary is provided for macOS, Ubuntu, and Windows.

**Mainnet binaries:**
- [Ubuntu x86_64](https://storage.googleapis.com/mysten-walrus-binaries/site-builder-mainnet-latest-ubuntu-x86_64)
- [macOS arm64](https://storage.googleapis.com/mysten-walrus-binaries/site-builder-mainnet-latest-macos-arm64)
- [Windows x86_64](https://storage.googleapis.com/mysten-walrus-binaries/site-builder-mainnet-latest-windows-x86_64.exe)

**Testnet binaries:**
- [Ubuntu x86_64](https://storage.googleapis.com/mysten-walrus-binaries/site-builder-testnet-latest-ubuntu-x86_64)
- [macOS arm64](https://storage.googleapis.com/mysten-walrus-binaries/site-builder-testnet-latest-macos-arm64)
- [Windows x86_64](https://storage.googleapis.com/mysten-walrus-binaries/site-builder-testnet-latest-windows-x86_64.exe)

### Configuration

The `site-builder` needs a `sites-config.yaml` file.

**Template:**
```yaml
contexts:
  testnet:
    package: 0xf99aee9f21493e1590e7e5a9aea6f343a1f381031a04a732724871fc294be799
    staking_object: 0xbe46180321c30aab2f8b3501e24048377287fa708018a5b7c2792b35fe339ee3
    general:
      wallet_env: testnet
      walrus_context: testnet
      walrus_package: 0xd84704c17fc870b8764832c535aa6b11f21a95cd6f5bb38a9b07d2cf42220c66
  mainnet:
    package: 0x26eb7ee8688da02c5f671679524e379f0b837a12f1d1d799f255b7eea260ad27
    staking_object: 0x10b9d30c28448939ce6c4d6c6e0ffce4a7f8a4ada8248bdad09ef8b70e4a3904
    general:
      wallet_env: mainnet
      walrus_context: mainnet
      walrus_package: 0xfdc88f7d7cf30afab2f82e8380d11ee8f70efb90e863d1de8616fae1bb09ea77
default_context: mainnet
```

Place this file in `~/.config/walrus/sites-config.yaml` or pass it with `--config`.

## Publishing a Walrus Site

Run the deploy command:
```bash
site-builder --config /path/to/sites-config.yaml publish <build-directory-of-a-site>
```

This will create Walrus quilts for your files and return a Site Object ID and a portal URL for previewing.

## Updating a Site

Modify your files and run deploy again. The tool uses `ws-resources.json` to identify the existing site.
```bash
site-builder --context=testnet deploy --epochs 1 ./your-site-dir
```
