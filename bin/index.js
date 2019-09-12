#!/usr/bin/env node

const format = require("../lib/format");
var args = process.argv.slice(2);
const repoDir = args[0] || ".";

format.formatStagedChanges(repoDir);
