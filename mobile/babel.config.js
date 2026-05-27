module.exports = function (api) {
  api.cache(true);

  return {
    presets: ["babel-preset-expo"],
    plugins: [
      "expo-router/babel",
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
    ],
  };
};
