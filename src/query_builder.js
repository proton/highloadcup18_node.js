module.exports = class QueryBuilder {
  constructor(orm) {
    this.orm = orm;
    this.selects = new Set;
    this.wheres = [];
    this.groups = [];
    this.orders = [];
    this.limit = null;
    this.bindings = {};
  }

  call() {
    let sql_parts = [];
    sql_parts.push(`SELECT ${[...this.selects].join(', ')} FROM accounts`);
    if (this.wheres.length) sql_parts.push('WHERE ' + this.wheres.join(' AND '));
    if (this.groups.length) sql_parts.push('GROUP BY ' + this.groups.join(', '));
    if (this.orders.length) sql_parts.push('ORDER BY ' + this.orders.join(', '));
    if (this.limit) sql_parts.push(`LIMIT ${this.limit}`);
    const sql = sql_parts.join(' ');
    try {
      const query = this.orm.db.prepare(sql);
      return query.bind(this.bindings);
    } catch (e) {
     console.log([e, sql, this.bindings]);
    }
  }
};