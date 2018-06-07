module.exports = function (bookshelf, models) {
    return bookshelf.Model.extend({
        tableName: 'account',
        idAttribute: 'id',
        hasTimestamps: true,
        uuid: true
    });
}
