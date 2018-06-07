module.exports = function (bookshelf, models) {
    return bookshelf.Model.extend({
        tableName: 'user_role',
        idAttribute: null,
        user: function() {
            return this.belongsTo( models['user']);
        }
    });
}
