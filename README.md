# PoolTogether Tools UI

A collection of tools built on top of the core PoolTogether protocol.

## Setup

Install dependencies:

```bash
$ yarn
```

Make sure you have `direnv` installed and copy `.envrc.example` to `.envrc`:

```bash
$ cp .envrc.example .envrc
```

Fill in your own values for `.envrc`, then run:

```bash
$ direnv allow
```

To run the local server, run:

```
$ yarn dev
```

## Development

`production` deploys to `tools.pooltogether.com`

`staging` deploys to `staging.tools.pooltogether.com`
