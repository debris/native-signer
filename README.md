![Parity Signer](https://wiki.parity.io/images/logo-parity-signer.jpg)

# Parity Signer - a smartphone as coldstorage

Parity Signer is a secure air-gapped wallet that allows users to use a smartphone as cold storage. It means that, once the App has been installed, users can create Ethereum accounts, sign transactions and [transfer funds](Parity-Signer-Mobile-App-Parity-Wallet-tutorial) from and to these accounts without any sort of connectivity enabled on the device. Wifi, Mobile Network, Bluetooth can be shut down and even removed physically to ensure that the mobile phone containing these accounts will not be exposed to any online threat.

Any data transfer from or to the App will happen using QR code scanning. By doing so, the most sensitive piece of information, the private keys, will never leave the phone. The Parity Signer Mobile App can be used to store any Ethereum account, this includes ETH, ETC as well as Ether from various testnets (Kovan, Ropsten...).

## How to get it and use it?

### Device security
Parity Signer Mobile App is built to be used offline. The mobile device used to run the App will hold important information that needs to be kept securely stored. It is therefore advised to:
- Get a separate mobile device.
- Make a factory reset.
- Enable full-disk encryption on the device, with a reasonable password (might not be on by default, for example for older Android devices).
- Do not use any kind of biometrics such as fingerprint or face recognition for device decryption/unlocking, as those may be less secure than regular passwords.
- Once the App has been installed, enable airplane mode and make sure to switch off Wifi, Bluetooth or any connection ability of the device.
- Only charge the phone on a power outlet that is never connected to the internet. Only charge the phone with the manufacturer's charging adapter. Do not charge the phone on public USB chargers.

## Installation
[![App Store][app-store-badge]][app-store-url]
[![Google Play][google-play-badge]][google-play-url]

[app-store-badge]: ./res/app-store-badge.png
[app-store-url]: https://itunes.apple.com/us/app/parity-signer/id1218174838
[google-play-badge]: ./res/google-play-badge.png
[google-play-url]: https://play.google.com/store/apps/details?id=com.nativesigner

## Screenshots

![Parity Signer Screenshots](https://i.imgur.com/HHnwyAp.jpg)

## Build it
### Requirements

- `node.js` (tested on `v8.4.0`)
- `yarn` (tested on `1.6.0`)
- `rustup` (tested on `rustup 1.5.0 (92d0d1e9e 2017-06-24)`)
- `rustc` (tested on `rustc 1.27.0 (3eda71b00 2018-06-19)`)
- `cargo` (tested on `cargo 1.27.0 (1e95190e5 2018-05-27)`)
- `android_ndk` (tested on `r13b`)
- `Xcode` (only, for iOS, tested on `Version 9.4.1 (9F2000)`)
- `$NDK_HOME` envarionment variable set to ndk home directory (eg. `/usr/local/opt/android-ndk`)
- `$JAVA_HOME` envarionment variable set to java home directory (eg. `/Library/Java/JavaVirtualMachines/jdk1.8.0_60.jdk/Contents/Home`)

### Setup

- macOS

    ```
    ./setup_macos.sh

    echo "ndk.dir=$NDK_HOME" > android/local.properties
    echo "sdk.dir=$ANDROID_HOME" >> android/local.properties
    ```

- linux

    ```
    ./setup_linux.sh

    echo "ndk.dir=$NDK_HOME" > android/local.properties
    echo "sdk.dir=$ANDROID_HOME" >> android/local.properties
    ```

### Usage

- iOS

    ```
    npm run ios
    ```

- Android

    ```
    npm run android
    ```


### Create new account

seed: `this is sparta`

address: `006E27B6A72E1f34C626762F3C4761547Aff1421`

#### Scan qr code


qr:

[![qr][tx_qr]]

data:

```json
{
  "action":"signTransaction",
  "data":
  {
    "rlp":"f85f800182520894095e7baea6a6c7c4c2dfeb977efac326af552d870a801ba048b55bfa915ac795c431978d8a6a992b628d557da5ff759b307d495a36649353a0efffd310ac743f371de3b9f7f9cb56c0b28ad43601b4ab949f53faa07bd2c804",
    "account":"006E27B6A72E1f34C626762F3C4761547Aff1421"
  }
}
```

[tx_qr]: ./docs/tx_qr.png
