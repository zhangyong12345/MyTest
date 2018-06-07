module.exports = function (bookshelf, models) {
    return bookshelf.Model.extend({
        tableName: 'basic_data',
        idAttribute: 'id',
        hasTimestamps: true,
    });
}
