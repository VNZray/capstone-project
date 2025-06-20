module.exports = {
  webpack: (config) => {
    config.resolve.alias['react-native-maps'] = require.resolve(
      './mocks/react-native-maps'
    );
    return config;
  },
};
