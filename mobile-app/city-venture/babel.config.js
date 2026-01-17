export default function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          alias: {
            '@': './', // This makes `@` point to the root directory
          },
        },
      ],
      'react-native-reanimated/plugin', // Keep this last in the list
    ],
  };
};
