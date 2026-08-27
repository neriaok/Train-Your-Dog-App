// Learn more https://docs.expo.dev/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// @supabase/supabase-js (and its sub-packages, e.g. @supabase/auth-js) ship
// only a modern "exports" map in their package.json - Metro doesn't follow
// that by default, so it can't resolve them without this on.
config.resolver.unstable_enablePackageExports = true;

module.exports = config;
