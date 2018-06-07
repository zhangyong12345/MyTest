module.exports = function (bookshelf, models) {
    return bookshelf.Model.extend({
        tableName: 'org',
        idAttribute: 'id',
        hasTimestamps: true,
        uuid: true
    });
}
