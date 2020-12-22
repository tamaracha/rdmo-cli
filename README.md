# rdmo-cli

A cli tool for authoring RDMO catalogs

## Requirements

You need to have [Node.js] installed for using this tool.

## Installation

### Local

You can setup your catalog repo as NPM package and add rdmo-cli to its dependencies.

```shell
# Go to your contents directory
cd dir/to/catalog/contents
# Initialize NPM package with standard settings
npm init -y
# Add rdmo-cli to dev dependencies
npm i -D tamaracha/rdmo-cli
# Run the cli
npx rdmo --help
```

### Global

If you don't want to setup your contents as NPM package,
you can install rdmo-cli globally.

```shell
# Install rdmo-cli in your global path
npm i -g tamaracha/rdmo-cli
# Run the cli
npx rdmo --help
# or directly (not recommended)
rdmo --help
```

[Node.js]: nodejs.org
