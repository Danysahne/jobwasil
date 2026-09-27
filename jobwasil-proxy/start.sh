#!/bin/bash
set -a
source "$(dirname "$0")/.env"
set +a
PORT=3001 node "$(dirname "$0")/index.js"
