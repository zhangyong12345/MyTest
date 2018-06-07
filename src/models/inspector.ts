module.exports = function (bookshelf, models) {
    return bookshelf.Model.extend({
        tableName: 'inspector',
        idAttribute: 'uid',
        hasTimestamps: true
    });
}
