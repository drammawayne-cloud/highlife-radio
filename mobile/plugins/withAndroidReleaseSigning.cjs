const { withAppBuildGradle } = require("expo/config-plugins");
module.exports = function withAndroidReleaseSigning(config) {
  return withAppBuildGradle(config, (config) => {
    const marker = "// High Life release upload signing";
    if (!config.modResults.contents.includes(marker)) {
      config.modResults.contents = config.modResults.contents.replace(
        /release \{([\s\S]*?)signingConfig signingConfigs\.debug/,
        "release {$1signingConfig null"
      );
      config.modResults.contents += `
${marker}
def highlifeUploadStore = System.getenv("HIGHLIFE_UPLOAD_STORE")
if (highlifeUploadStore) {
    android.signingConfigs.create("highlifeUpload") {
        storeFile file(highlifeUploadStore)
        storePassword System.getenv("HIGHLIFE_UPLOAD_STORE_PASSWORD")
        keyAlias System.getenv("HIGHLIFE_UPLOAD_ALIAS")
        keyPassword System.getenv("HIGHLIFE_UPLOAD_KEY_PASSWORD")
    }
    android.buildTypes.release.signingConfig = android.signingConfigs.highlifeUpload
}
`;
    }
    return config;
  });
};
