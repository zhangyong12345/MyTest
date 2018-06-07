import * as path from 'path';
import * as Bookshelf from 'bookshelf'
import * as Knex from 'knex';
import * as BookshelfUUID from 'bookshelf-uuid';

export default function (dir, config): Function {
    // 处理路径
    //   if (typeof ((config || {}).connection || {}).filename !== 'undefined') {
    //     config.connection.filename = path.join(path.dirname(module.parent.filename), config.connection.filename);
    //   }

    const knex = Knex(config);
    const bookshelf = Bookshelf(knex);

    // Add the plugin
    bookshelf.plugin('pagination');
    bookshelf.plugin(BookshelfUUID);

    const models = new Proxy({}, {
        get: function (obj, prop) {
            if (typeof obj[prop] === 'undefined') {
                let modelPath = path.join(process.cwd(), dir, prop.toString());
                try {
                    let modelImport = require(modelPath);
                    obj[prop] = modelImport(bookshelf, models);
                } catch (err) {
                    err.message = 'Cannot find model ' + prop.toString() + ' \'' + modelPath + '\'';
                    throw (err);
                }

            }

            return obj[prop];
        }
    });

    if (config.migrate) {
        knex.migrate.latest()
            .then(function () {
                if (config.seeds) {
                    return knex.seed.run();
                }
            })
            .then(function () {
                // migrations are finished
                console.log('migrations are finished');
            });
    }

    return async function (ctx, next) {
        ctx.knex = knex;
        ctx.bookshelf = bookshelf;
        ctx.models = models;
        await next();
    };
};
