import * as Router from 'koa-router';
import * as Log4js from 'koa-log4';

/**
 * 行政区划管理
 */

const router = new Router();
const logger = Log4js.getLogger('division');

router.prefix('/api/division');

router.get('/', async (ctx, next) => {
    let page = Number(ctx.query.page || 0);
    let limit = Number(ctx.query.rows || 10);
    let offset = Math.max((page - 1) * limit, 0);
    let sort = ctx.query.sort || 'code';
    let order = ctx.query.order || 'ASC';

    let name = ctx.query.name;

    const where = function(qb) {
        qb.where('deleted', '=', false);
        if (!!name) qb.andWhere('name', 'LIKE', `%${name}%`); 
    }

    if (ctx.query.page) {
        ctx.body = { 'code': 0, 'msg': 'success'};
        ctx.body.total = await ctx.models.division.query(where).count();
        ctx.body.data = await ctx.models.division.query(where).orderBy(sort, order).fetchPage({limit, offset});
    } else {
        ctx.body = await ctx.models.division.query(where).orderBy(sort, order).fetchAll();
    }
})

router.get('/tree', async (ctx, next) => {
    const items = await ctx.models.division.where('deleted', '=', false).fetchAll();

    const tree = makeTree(items.toJSON());

    ctx.body = { 'code': 0, 'msg': 'success', data: tree};
});

function makeTree(items: any[], p?: any) {
    const _items = [];

    if (!p) {
        // 找出根元素
        items.filter(item => !item.parent).forEach(item => _items.push(item));
    } else {
        // 找出 p 的所有子元素
        items.filter(item => item.parent === p.code).forEach(item => _items.push(item));
    }

    _items.sort((a, b) => (!!a.sn ? a.sn : 1000) - (!!b.sn ? b.sn : 1000));

    // 找出每个元素的子元素
    _items.forEach(item => {
        const children = makeTree(items, item);
        if(children.length > 0) item['children'] = children;
    });

    return _items;
}

router.get('/:code', async (ctx, next) => {
    const code = ctx.params.code;

    let division = await ctx.models.division.where({code}).fetch();

    if (!division) {
        ctx.response.status = 404;
        ctx.response.statusString = '指定的行政区划不存在！';
        return;
    }
    
    ctx.body = division;
});

router.get('/:code/children', async (ctx, next) => {
    const code = ctx.params.code;

    ctx.body = { 'code': 0, 'msg': 'success'};
    ctx.body.data = await ctx.models.division.where({parent: code}).where('deleted', '=', false).orderBy('sn', 'ASC').fetchAll();
})


router.delete('/:code', async (ctx, next) => {
    let code = ctx.params.code;

    const updated_by = ctx.state.user.username;
    const updated_by_who = ctx.state.user.fullname;

    const result = await ctx.models.division.forge({code}).save({deleted: true, updated_by, updated_by_who}, {patch: true});

    ctx.body = { 'code': 0, 'msg': 'success'};
    ctx.response.status = 204;
    ctx.response.statusString = 'success';
});

router.put('/:code', async (ctx, next) => {
    let code = ctx.params.code;
    let fd = ctx.request.body;

    fd.updated_by = ctx.state.user.username;
    fd.updated_by_who = ctx.state.user.fullname;

    const result = await ctx.models.division.forge({code}).save(fd);

    ctx.body = { 'code': 0, 'msg': 'success', 'data': result || {} };
    ctx.response.status = 201;
    ctx.response.statusString = 'success';
});

router.post('/', async (ctx, next) => {
    let fd = ctx.request.body;

    fd.created_by = ctx.state.user.username;
    fd.created_by_who = ctx.state.user.fullname;

    const result = await ctx.models.division.forge().save(fd);

    ctx.body = { 'code': 0, 'msg': 'success', 'data': result || {} };
    ctx.response.status = 201;
    ctx.response.statusString = 'success';
});

export default router;