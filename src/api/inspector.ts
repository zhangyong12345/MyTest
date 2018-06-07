import * as Router from 'koa-router';
import * as Log4js from 'koa-log4';

const router = new Router();
const logger = Log4js.getLogger('inspector');

router.prefix('/api/inspector');


router.get('/', async (ctx, next) => {
    let page = Number(ctx.query.page || 0);
    let limit = Number(ctx.query.rows || 10);
    let offset = Math.max((page - 1) * limit, 0);
    let sort = ctx.query.sort || 'user_name';
    let order = ctx.query.order || 'ASC';

    let user_name = ctx.query.name;
    let account = ctx.query.account;
    let org_id = ctx.query.group;

    const where = function(qb) {
        qb.where('deleted', '=', false);
        if (!!name) qb.andWhere('name', 'LIKE', `%${name}%`); 
        if (!!account) qb.andWhere('account', 'LIKE', `%${account}%`); 
        // TODO: 按部门查询
    }


    if (ctx.query.page) {
        ctx.body = { 'code': 0, 'msg': 'success'};
        ctx.body.total = await ctx.models.inspector.query(where).count();
        ctx.body.data = await ctx.models.inspector.query(where).orderBy(sort, order).fetchPage({limit, offset});
    } else {
        ctx.body = await ctx.models.inspector.where(where).orderBy(sort, order).fetchAll();
    }
});

router.get('/:id', async (ctx, next) => {
    const id = ctx.params.id;

    let user = await ctx.models.inspector.where({uid: id}).fetch();

    if (!user) {
        ctx.response.status = 404;
        ctx.response.statusString = '用户不存在！';
        return;
    }
    
    ctx.body = user;
});

router.delete('/:id', async (ctx, next) => {
    let id = ctx.params.id;

    const updated_by = ctx.state.user.username;
    const updated_by_who = ctx.state.user.fullname;

    const result = await ctx.models.inspector.forge({'uid': id}).save({deleted: true, updated_by, updated_by_who}, {patch: true});

    ctx.body = { 'code': 0, 'msg': 'success'};
    ctx.response.status = 204;
    ctx.response.statusString = 'success';
});

router.put('/:id', async (ctx, next) => {
    let uid = ctx.params.id;
    let fd = ctx.request.body;

    fd.updated_by = ctx.state.user.username;
    fd.updated_by_who = ctx.state.user.fullname;

    const result = await ctx.models.inspector.forge({uid: uid}).save(fd);

    ctx.body = { 'code': 0, 'msg': 'success', 'data': result || {} };
    ctx.response.status = 201;
    ctx.response.statusString = 'success';
});

router.post('/', async (ctx, next) => {
    let fd = ctx.request.body;
    fd.deleted = fd.deleted || false;

    // fd.created_by = ctx.state.user.username;
    // fd.created_by_who = ctx.state.user.fullname;

    const result = await ctx.models.inspector.forge().save(fd);

    ctx.body = { 'code': 0, 'msg': 'success', 'data': result || {} };
    ctx.response.status = 201;
    ctx.response.statusString = 'success';
});

export default router;