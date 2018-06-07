module.exports = function (bookshelf, models) {
    return bookshelf.Model.extend({
        tableName: 'dictionary',
        idAttribute: 'id',
        hasTimestamps: true,
        uuid: true
    });
}
