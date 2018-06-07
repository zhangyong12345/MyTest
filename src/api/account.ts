import * as Router from 'koa-router';
import * as Log4js from 'koa-log4';
import * as uuid from 'uuid';

const router = new Router();
const logger = Log4js.getLogger('account');
const DEFAULT_COLLETION = 'account';

router.prefix('/api/account')

function getCollection(ctx, collection: string = DEFAULT_COLLETION) {
    return ctx.mongo.db('demo').collection(collection);
}

router.get('/', async (ctx, next) => {
    let page = Number(ctx.query.page || 0);
    let rows = Number(ctx.query.rows || 0);
    let offset = Math.max((page - 1) * rows, 0);
    let sort = ctx.query.sort;
    let order = ('asc' === ctx.query.order) ? 1 : -1;

    let args = { deleted: { $ne: true } };
    if (!!ctx.query.uid) { args['uid'] = ctx.query.uid; }
    if (!!ctx.query.identity) { args['identity'] = ctx.query.identity; }
    if (!!ctx.query.enabled) { args['enabled'] = (ctx.query.enabled === 'true'); }

    let sortArg = {};
    if (sort) {
        sortArg[sort] = order;
    } else {
        sortArg['id'] = -1;
    }

    if (ctx.query.page) {
        ctx.body = {};
        ctx.body.total = await getCollection(ctx).find(args).count();
        ctx.body.data = await getCollection(ctx).find(args, { _id: 0 }).sort(sortArg).limit(rows).skip(offset).toArray();
    } else {
        ctx.body = await getCollection(ctx).find(args, { _id: 0 }).sort(sortArg).limit(rows).skip(offset).toArray();
    }
})

router.get('/:id', async (ctx, next) => {
    let id = ctx.params.id;
    ctx.body = await getCollection(ctx).findOne({ 'id': id });
})

router.put('/:id', async (ctx, next) => {
    let id = ctx.params.id;
    let fd = ctx.request.body;
    if (fd._id) {
        delete ctx.fd._id;
    }

    fd.update_user = ctx.user;
    fd.update_time = ctx.updatetime;
    const result = await getCollection(ctx).findOneAndReplace({ 'uid': id }, fd, { new: true, upsert: true, returnOriginal: false });

    ctx.body = { 'code': 0, 'msg': 'success', 'data': result.value || {} };
    ctx.response.status = 201;
    ctx.response.statusString = 'success';
})

router.post('/', async (ctx, next) => {
    let fd = ctx.request.body;
    let id = fd.id;
    if (fd._id) {
        delete ctx.fd._id;
    }

    fd.update_user = ctx.user;
    fd.update_time = ctx.updatetime;

    // tslint:disable-next-line:max-line-length
    const result = await getCollection(ctx).findOneAndUpdate({ 'uid': id }, { $set: fd }, { new: true, upsert: true, returnOriginal: false });

    ctx.body = { 'code': 0, 'msg': 'success', 'data': result.value || {} };
    ctx.response.status = 201;
    ctx.response.statusString = 'success';
})

router.delete('/:id', async (ctx, next) => {
    let id = ctx.params.id;

    const result = await getCollection(ctx).findOneAndUpdate(
        { 'id': id },
        { $set: { deleted: true, update_user: ctx.user, update_time: ctx.updatetime } },
        { returnOriginal: true }
    );

    ctx.body = { 'code': 0, 'msg': 'success', 'data': result.value || {} };
    ctx.response.status = 201;
    ctx.response.statusString = 'success';
})

export default router;
