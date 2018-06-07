import * as Koa from 'koa'
import * as Log4js from 'koa-log4'
import * as Nunjucks from 'koa-nunjucks-promise'
import * as Path from 'path'
import * as Mount from 'koa-mount'
import * as Server from 'koa-static'
import * as BodyParser from 'koa-bodyparser'
import * as Session from 'koa-session2'
import * as onerror from 'koa-onerror'
import * as jwt from 'koa-jwt';
// import { cacheControl} from 'koa-cache-control';
import Csrf from 'koa-csrf'
import bookshelf from './middleware/bookshelf'

import config from './config/config'

// Routers
import routers from './routers/routers'
import api from './api/routers'

// Web Environment
const isProdEnv: boolean = process.env.NODE_ENV === 'production';
console.log("enviriment NODE_ENV is %s", process.env.NODE_ENV)

const logger = Log4js.getLogger('app');

const app = new Koa();
onerror(app); // error handler
app.context.config = config; // binding application config

app.use(bookshelf('./src/models', config.bookshelf));


// Static Path of Web
app.use(Server(Path.resolve('./static')));

// http logs
app.use(Log4js.koaLogger(Log4js.getLogger('http'), { level: 'auto' }))

// Request Body Parse
app.use(BodyParser())

// request CSRF
// app.use(new Csrf({
//     invalidSessionSecretMessage: 'Invalid session secret',
//     invalidSessionSecretStatusCode: 403,
//     invalidTokenMessage: 'Invalid CSRF token',
//     invalidTokenStatusCode: 403,
//     excludedMethods: ['GET', 'HEAD', 'OPTIONS'],
//     disableQuery: false
// }))
// app.use(async (ctx, next) => {
//     if (ctx.method === 'GET') {
//         ctx.cookies.set('csrftoken', ctx.csrf, { httpOnly: false })
//     }
//     await next()
// })

// Custom 401 handling if you don't want to expose koa-jwt errors to users
app.use(function(ctx, next){
    return next().catch((err) => {
        if (401 === err.status) {
        ctx.status = 401;
        ctx.body = 'Unauthorization!\n';
        } else {
        throw err;
        }
    });
});

app.use(jwt({ secret: config.secret }).unless({ path: [/^\/api\/auth/] }));

// routers(app); // map all controller handlers
api(app);

const server = app.listen(config.port, () =>
    logger.info('[worker:%s] web server start listen on %s', process.pid, config.port)
)

export {server};
