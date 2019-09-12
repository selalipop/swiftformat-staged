# swiftformat-staged

Formats staged swift code using `swift-format`

# Install

    npm install -g swiftformat-staged

# Usage

    swiftformat-staged [pathToProjectRoot]

_Path to project root is optional and defaults to current path._
Path must be the root of a valid git project with at least one commit
Staged changes are formatted:

    1 staged patch(es) found
    Formatting "App/Login/LoginViewController.swift"

**Formatted changes are not staged automatically**

## Status

This is a beta project. Because it operates on staged files, there is no risk of data loss on applied files.

However to make it easier to undo formatting operations, it is recommended to stage all changes before running.

This way all formatting can be undone by discarding all unstaged changes

## TODO

- Add support for passing `swiftformat` arguments
