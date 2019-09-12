#!/usr/bin/env node

const format = require("../lib/format");
var args = process.argv.slice(2);
const repoDir = args[0];

if (!repoDir) {
  console.log("Usage: swift-format-staged project/src");
} else {
  format.formatStagedChanges(repoDir);
}
