module.exports = function (api) {
  api.cache(true);

  return {
    presets: ["babel-preset-expo"],
    plugins: [
      [
        "module-resolver",
        {
          root: ["."],
          alias: {
            // tsconfig paths와 동일하게 맞춤
            "@": ".",
            "@package-shared": "../package-shared/src",
          },
        },
      ],   
      "react-native-reanimated/plugin",
    ],
  };
};
