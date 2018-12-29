module.exports = class Utils {
  static timeToYear(ts) {
    return (new Date(ts * 1000)).getFullYear();
  }
};