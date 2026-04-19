const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

const { resolver: { sourceExts, assetExts } } = config;

config.resolver = {
  ...config.resolver,
  sourceExts: [...sourceExts, 'cjs'],
  resolverMainFields: ['sbmodern', 'browser', 'main'],
};

module.exports = config;
