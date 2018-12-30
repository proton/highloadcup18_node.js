module.exports = class QueryBuilder {
  constructor(orm) {
    this.orm = orm;
    this.selects = new Set;
    this.from = 'accounts';
    this.joins = [];
    this.wheres = [];
    this.groups = [];
    this.orders = [];
    this.limit = null;
    this.join_interests = false;
    this.bindings = {};
  }

  call() {
    const generated_sql = this.sql();
    try {
      const query = this.orm.db.prepare(generated_sql);
      return query.bind(this.bindings);
    } catch (e) {
     console.log([e, generated_sql, this.bindings]);
    }
  }

  sql() {
    if (this.join_interests)
      this.joins.push('INNER JOIN account_interests ON accounts.id = account_interests.account_id');

    let sql_parts = [];
    sql_parts.push(`SELECT ${[...this.selects].join(', ')} FROM ${this.from}`);
    if (this.joins.length)  sql_parts = sql_parts.concat(this.joins);
    if (this.wheres.length) sql_parts.push('WHERE ' + this.wheres.join(' AND '));
    if (this.groups.length) sql_parts.push('GROUP BY ' + this.groups.join(', '));
    if (this.orders.length) sql_parts.push('ORDER BY ' + this.orders.join(', '));
    if (this.limit) sql_parts.push(`LIMIT ${this.limit}`);

    return sql_parts.join(' ');
  }
};