module.exports = function (bookshelf, models) {
    return bookshelf.Model.extend({
        tableName: 'exception_enterprise',
        idAttribute: 'id',
        hasTimestamps: true,
    });
}
