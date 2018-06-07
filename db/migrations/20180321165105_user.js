exports.up = function (knex, Promise) {
    return Promise.all([
       knex.schema.createTable('user', (table) => {
            table.string('id').primary();
            table.string('name');
            table.string('email');
            table.string('birthdate');
        })
    ]);
};

exports.down = function (knex, Promise) {
    return knex.schema.dropTable('user');
};