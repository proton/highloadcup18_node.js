module.exports = class Utils {
  static timeToYear(ts) {
    return (new Date(ts * 1000)).getFullYear();
  }

  static yearToTimestamps(year) {
    year = +year;
    return {
      from: +Date.UTC(year) / 1000 | 0,
      to: +Date.UTC(year + 1) / 1000 | 0
    }
  }

  static log(text) {
    const ts = +new Date() / 1000 | 0;
    console.log([ts, text]);
  }

  static escapeString(val) {
    return val.replace(/[\0\n\r\b\t\\'"\x1a]/g, s => {
      switch (s) {
        case "\0":
          return "\\0";
        case "\n":
          return "\\n";
        case "\r":
          return "\\r";
        case "\b":
          return "\\b";
        case "\t":
          return "\\t";
        case "\x1a":
          return "\\Z";
        case "'":
          return "''";
        case '"':
          return '""';
        default:
          return "\\" + s;
      }
    });
  };
};

module.exports.accountAttrs =
  new Set(['id', 'email', 'fname', 'sname', 'status', 'country', 'city', 'phone', 'sex', 'joined', 'birth']);
module.exports.accountAttrsExtended =
  new Set(['id', 'email', 'fname', 'sname', 'status', 'country', 'city', 'phone', 'sex', 'joined', 'birth', 'likes', 'interests']);