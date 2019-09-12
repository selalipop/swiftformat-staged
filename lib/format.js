"use strict";

var nodeGit = require("nodegit");

var childProcess = require("child_process");

const readFile = require("fs-readfile-promise");
var str = require("string-to-stream");

var range = require("range").range;
var fs = require("fs");
const path = require("path");
const swiftLintIgnoreString = "// swiftformat:disable:next all ‌‌";

var args = process.argv.slice(2);
const repoDir = args[0];

async function formatStagedChanges(repoPath) {
  const repository = await nodeGit.Repository.open(repoPath);
  const head = await repository.getHeadCommit();
  const diff = await nodeGit.Diff.treeToIndex(
    repository,
    await head.getTree(),
    null
  );
  const patches = await diff.patches();
  console.log(
    patches.length > 0
      ? `${patches.length} staged patch(es) found`
      : "No changes staged"
  );

  patches.forEach(async patch => {
    const hunks = await patch.hunks();
    let pathToFile = path.join(repoDir, patch.newFile().path());

    if (!pathToFile.endsWith("swift")) {
      console.log(
        `Ignoring staged file ${pathToFile} because it does not have a .swift extension`
      );
      return;
    }

    console.log(`Formatting "${pathToFile}"`);

    let fileContentsRaw = await readFile(pathToFile);
    let fileContents = [];
    let originalFileContents = fileContentsRaw.toString().split("\n");

    let modifiedLines = [];
    hunks.forEach(hunk => {
      let firstLine = hunk.newStart() - 1;
      let lastLine = hunk.newStart() + hunk.newLines() - 1;
      modifiedLines = modifiedLines.concat(range(firstLine, lastLine));
    });

    for (
      let currentLine = 0;
      currentLine < originalFileContents.length;
      currentLine++
    ) {
      const lineContent = originalFileContents[currentLine];

      if (!modifiedLines.includes(currentLine)) {
        fileContents.push(swiftLintIgnoreString);
      }
      fileContents.push(lineContent);
    }

    let processedContents = fileContents.join("\n");

    var child = (0, childProcess.exec)(
      "swiftformat --allman false --wraparguments beforefirst --wrapelements beforefirst --removelines disabled --self remove --header ignore --binarygrouping none --octalgrouping none --patternlet inline --indentcase false --trimwhitespace always --decimalgrouping none --commas inline --semicolons inline --indent 4 --exponentcase lowercase --operatorfunc nospace --elseposition same-line --insertlines disabled --empty void --ranges nospace --hexliteralcase uppercase --linebreaks lf --hexgrouping none --comments ignore --ifdef indent --stripunusedargs closure-only --disable unusedArguments --enable trailingClosures",
      function(error, stdout, stderr) {
        if (error) {
          console.log(error);
          return;
        }

        if (stderr && !stderr.trim()) {
          console.warn(`SwiftFormat had output for ${pathToFile}:\n${stderr}`);
        }

        let lines = stdout.split("\n");
        let output = lines
          .filter((element, index) => {
            return (
              element.trim() !== swiftLintIgnoreString &&
              index != lines.length - 1
            );
          })
          .join("\n");
        fs.writeFileSync(pathToFile, output);
      }
    );

    str(processedContents).pipe(child.stdin);
  });
}

exports.formatStagedChanges = formatStagedChanges;
