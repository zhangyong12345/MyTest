
exports.seed = function(knex, Promise) {
  // Deletes ALL existing entries
  return knex('user').del()
    .then(function () {
      // Inserts seed entries
      return knex('user').insert([
        {id:'001', name:'Jim', email:'jim@email.com', birthdate: '2018-03-21'},
        {id:'002', name:'Leo', email:'leo@email.com', birthdate: '2018-03-21'},
        {id:'003', name:'Rose', email:'rose@email.com', birthdate: '2018-03-21'}
      ]);
    });
};
