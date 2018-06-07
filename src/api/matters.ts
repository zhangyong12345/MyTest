import * as Router from 'koa-router';
import * as Log4js from 'koa-log4';
import * as uuid from 'uuid';

const router = new Router();
const logger = Log4js.getLogger('matters');

router.prefix('/api/matters');

//获取指定的事项
router.get('/:id', async (ctx, next) => {
    const id = ctx.params.id;

    let matters = await ctx.models.matters.where({id: id}).fetch();

    if (!matters) {
        ctx.response.status = 404;
        ctx.response.statusString = '字典条目不存在！';
        return;
    }
    
    ctx.body = matters;
});

router.get('/', async (ctx, next) => {
    let page = Number(ctx.query.page || 0);
    let limit = Number(ctx.query.rows || 10);
    let offset = Math.max((page - 1) * limit, 0);
    let sort = ctx.query.sort || 'update_time';
    let order = ctx.query.order || 'ASC';

    let name = ctx.query.name || '';
    let org_code = ctx.query.org_code;

    const where = function(qb) {
        qb.where('deleted', '=', false);
        if (!!name) qb.andWhere('name', 'LIKE', `%${name}%`); 
        if (!!org_code) qb.andWhere('org_code', 'LIKE', `%${org_code}%`); 
    }

    ctx.body = {'code':0, 'msg':'success'};
    ctx.body.total = await ctx.models.matters.query(where).count();
    ctx.body.data = await ctx.models.matters.query(where).orderBy(sort, order).fetchPage({limit, offset});
});

//添加一个事项
router.post('/', async (ctx, next) => {
    let fd = ctx.request.body;

    fd.created_by = ctx.state.user.username;
    fd.created_by_who = ctx.state.user.fullname;

    const result = await ctx.models.matters.forge().save(fd);

    ctx.body = { 'code': 0, 'msg': 'success', 'data': result || {} };
    ctx.response.status = 201;
    ctx.response.statusString = 'success';
});

//修改一个事项
router.put('/:id', async (ctx, next) => {
    let id = ctx.params.id;
    let fd = ctx.request.body;

    fd.updated_by = ctx.state.user.username;
    fd.updated_by_who = ctx.state.user.fullname;

    const result = await ctx.models.matters.forge({id}).save(fd);

    ctx.body = { 'code': 0, 'msg': 'success', 'data': result || {} };
    ctx.response.status = 201;
    ctx.response.statusString = 'success';
});

//删除一个事项
router.delete('/:id', async (ctx, next) => {
    let id = ctx.params.id;
    const updated_by = ctx.state.user.username;
    const updated_by_who = ctx.state.user.fullname;

    const result = await ctx.models.matters.forge({id}).save({deleted: true, updated_by, updated_by_who}, {patch: true});

    ctx.body = { 'code': 0, 'msg': 'success'};
    ctx.response.status = 204;
    ctx.response.statusString = 'success';
});

// router.get('/:id/history', async (ctx, next) => {
//     let page = Number(ctx.query.page || 0);
//     let rows = Number(ctx.query.rows || 0);
//     let offset = Math.max((page - 1) * rows, 0);
//     let sort = ctx.query.sort;
//     let order = ('asc' === ctx.query.order) ? 1 : -1;

//     let id = ctx.params.id || '';

//     let args = {};
//     if (!!id) { args['id'] = id; }

//     // 排序，默认按“修改时间”降排列
//     let sortArg = {};
//     if (sort) {
//         sortArg[sort] = order;
//     } else {
//         sortArg['update_time'] = -1;
//     }
 
//     ctx.body = {};
//     ctx.body.code = 0;
//     ctx.body.msg = 'success'
//     ctx.body.total = await getCollection(ctx).find(args).count();
//     ctx.body.data = await getCollection(ctx).find(args, { _id: 0 }).sort(sortArg).limit(rows).skip(offset).toArray();

//     ctx.response.status = 201;
//     ctx.response.statusString = 'success';
// });

export default router;