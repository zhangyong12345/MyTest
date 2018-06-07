module.exports = function (bookshelf, models) {
    return bookshelf.Model.extend({
        tableName: 'org_enterprise',
        idAttribute: 'id',
        hasTimestamps: true,
    });
}
