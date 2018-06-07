module.exports = function (bookshelf, models) {
    return bookshelf.Model.extend({
        tableName: 'role_menu',
        idAttribute: null,
    });
}
