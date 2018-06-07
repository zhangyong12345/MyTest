module.exports = function (bookshelf, models) {
    return bookshelf.Model.extend({
        tableName: 'user_org',
        idAttribute: null,
    });
}
