// pnpm configuration file
// This ensures compatibility with the project structure

module.exports = {
  hooks: {
    readPackage(pkg) {
      return pkg;
    }
  }
};
