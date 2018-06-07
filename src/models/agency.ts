module.exports = function (bookshelf, models) {
    return bookshelf.Model.extend({
        tableName: 'agency',
        idAttribute: 'id',
        hasTimestamps: true,
        uuid: true
    });
}
