module.exports = function (bookshelf, models) {
    return bookshelf.Model.extend({
        tableName: 'role',
        idAttribute: 'id',
        uuid: true,
        users: function() {
            return this.belongsToMany('user');
        }
    });
}
