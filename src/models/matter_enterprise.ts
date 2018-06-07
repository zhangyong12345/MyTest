module.exports = function (bookshelf, models) {
    return bookshelf.Model.extend({
        tableName: 'matter_enterprise',
        idAttribute: 'id',
        hasTimestamps: true,
    });
}
