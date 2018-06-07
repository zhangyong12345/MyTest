module.exports = function (bookshelf, models) {
    return bookshelf.Model.extend({
        tableName: 'section',
        idAttribute: 'id',
        hasTimestamps: true,
        uuid: true
    });
}
