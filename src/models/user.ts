module.exports = function (bookshelf, models) {
    return bookshelf.Model.extend({
        tableName: 'user_base',
        idAttribute: 'uid',
        hasTimestamps: true,

        user_role: function() {
            return this.hasMany(models['user_role']);
        }
    });
}
