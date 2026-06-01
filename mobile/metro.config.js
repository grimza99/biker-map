// Learn more https://docs.expo.io/guides/customizing-metro
/** @type {import('expo/metro-config').MetroConfig} */
const path = require("path");
const { getDefaultConfig } = require("expo/metro-config");

const { withNativewind } = require("nativewind/metro");

const projectRoot = __dirname;

const config = getDefaultConfig(projectRoot);

// package-shared 소스 변경을 감지하기 위해 해당 디렉토리만 watch
config.watchFolders = [path.resolve(projectRoot, "../package-shared")];
module.exports = withNativewind(config);

