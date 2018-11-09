# FAQ

1. Installation

When installing `npm` packages for the **Mantle** an error may occurred.
Mantle use `ganahe-core` which in turn is dependent on `scrypt` does compile before installing package. The installation fails if the dependency are not right.

## Required Confirmation
Mantle uses `ganache-core` just for testing but is required in `Mantle` project. However, `scrypt` error is being observed when installing mantle as dependency (ex. `base-app-mantle`). I believe that mantle should have `ganache-core` to be installed as `devDependencies` only.


Refer: [Ganache-Core](https://www.npmjs.com/package/ganache-core)

Required:

```shell
npm install -g node-gyp
```

[StackOverflow](
https://stackoverflow.com/questions/48095296/unable-to-install-node-js-package-scrypt-using-npm-on-windows)

- MacOS

```shell
xcode-select --install
```

Refer: https://github.com/schnerd/d3-scale-cluster/issues/7

- Windows

```shell
npm install --global windows-build-tools
```
