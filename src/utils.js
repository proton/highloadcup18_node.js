module.exports = class Utils {
  static timeToYear(ts) {
    return (new Date(ts * 1000)).getFullYear();
  }

  static log(text) {
    const ts = +new Date() / 1000 | 0;
    console.log([ts, text]);
  }
};