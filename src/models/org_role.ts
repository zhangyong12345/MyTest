module.exports = function (bookshelf, models) {
    return bookshelf.Model.extend({
        tableName: 'org_role',
        idAttribute: null,
        hasTimestamps: true
    });
}
