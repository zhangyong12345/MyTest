module.exports = function (bookshelf, models) {
    return bookshelf.Model.extend({
        tableName: 'dictionary_category',
        idAttribute: 'id',
        hasTimestamps: true,
    });
}
