module.exports = function (bookshelf, models) {
    return bookshelf.Model.extend({
        tableName: 'user_extra',
        idAttribute: 'uid'
    });
}
