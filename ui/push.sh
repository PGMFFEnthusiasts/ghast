#!/usr/bin/env bash

bun format
bun lint:fix

bun run build

rsync -avz --delete ./dist/ tb:caddy/site/
