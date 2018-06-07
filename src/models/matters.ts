module.exports = function (bookshelf, models) {
    return bookshelf.Model.extend({
        tableName: 'matters',
        idAttribute: 'id',
        hasTimestamps: true,
    });
}
