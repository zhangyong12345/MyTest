module.exports = function (bookshelf, models) {
    return bookshelf.Model.extend({
        tableName: 'division',
        idAttribute: 'code',
        hasTimestamps: true,
    });
}
