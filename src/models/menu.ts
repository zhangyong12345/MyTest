module.exports = function (bookshelf, models) {
    return bookshelf.Model.extend({
        tableName: 'menu',
        idAttribute: 'id',
        hasTimestamps: true,
        uuid: true,
    });
}
