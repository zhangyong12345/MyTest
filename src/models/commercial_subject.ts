module.exports = function (bookshelf, models) {
    return bookshelf.Model.extend({
        tableName: 'commercial_subject',
        idAttribute: 'id',
        hasTimestamps: false,
    });
}
