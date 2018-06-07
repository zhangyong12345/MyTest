import * as Router from 'koa-router';
import * as Log4js from 'koa-log4';

const router = new Router()
const logger = Log4js.getLogger('menu')

router.prefix('/api/menu')

router.get('/', async (ctx, next) => {
    let text = ctx.query.text;

    const where = function(qb) {
        qb.where('deleted', '=', false);
        if (!!text) qb.andWhere('text', 'LIKE', `%${text}%`); 
    }

    ctx.body = { 'code': 0, 'msg': 'success'};
    ctx.body.data = await ctx.models.menu.query(where).orderBy('code', 'ASC').fetchAll();
})


router.get('/tree', async (ctx, next) => {
    const items = await ctx.models.menu.where('deleted', '=', false).fetchAll();

    const tree = makeTree(items.toJSON());

    ctx.body = { 'code': 0, 'msg': 'success', data: tree};
});

router.get('/:id', async (ctx, next) => {
    const id = ctx.params.id;

    let entity = await ctx.models.menu.where({id}).fetch();

    if (!entity) {
        ctx.response.status = 404;
        ctx.response.statusString = '菜单不存在！';
        return;
    }
    
    ctx.body = entity;
})

router.delete('/:id', async (ctx, next) => {
    let id = ctx.params.id;

    const updated_by = ctx.state.user.username;
    const updated_by_who = ctx.state.user.fullname;

    const result = await ctx.models.menu.forge({id}).save({deleted: true, updated_by, updated_by_who}, {patch: true});

    ctx.body = { 'code': 0, 'msg': 'success'};
    ctx.response.status = 204;
    ctx.response.statusString = 'success';
})

router.put('/:id', async (ctx, next) => {
    let id = ctx.params.id;
    let fd = ctx.request.body;

    fd.updated_by = ctx.state.user.username;
    fd.updated_by_who = ctx.state.user.fullname;

    const result = await ctx.models.menu.forge({id}).save(fd);

    ctx.body = { 'code': 0, 'msg': 'success', 'data': result || {} };
    ctx.response.status = 201;
    ctx.response.statusString = 'success';
})

router.post('/', async (ctx, next) => {
    let fd = ctx.request.body;
    fd.deleted = fd.deleted || false;

    fd.created_by = ctx.state.user.username;
    fd.created_by_who = ctx.state.user.fullname;

    const result = await ctx.models.menu.forge().save(fd);

    ctx.body = { 'code': 0, 'msg': 'success', 'data': result || {} };
    ctx.response.status = 201;
    ctx.response.statusString = 'success';
})

router.get('/:id/children', async (ctx, next) => {
    const id = ctx.params.id;

    ctx.body = { 'code': 0, 'msg': 'success'};
    ctx.body.data = await ctx.models.menu.where({parent: id}).where('deleted', '=', false).orderBy('sn', 'ASC').fetchAll();
})

router.delete('/:id/role/:role', async (ctx, next) => {
    let role_id = ctx.params.role;
    let menu_id = ctx.params.id;

    const updated_by = ctx.state.user.username;
    const updated_by_who = ctx.state.user.fullname;

    const result = await ctx.models.role_menu.forge({role_id, menu_id}).save({deleted: true, updated_by, updated_by_who}, {patch: true});

    ctx.body = { 'code': 0, 'msg': 'success'};
    ctx.response.status = 204;
    ctx.response.statusString = 'success';
})

router.post('/:id/role', async (ctx, next) => {
    let role = ctx.request.body;
    let menu_id = ctx.params.id;

    let relation = {role_id: role.id, menu_id: menu_id, checked: true};
    const updated_by = ctx.state.user.username;
    const updated_by_who = ctx.state.user.fullname;

    const result = await ctx.models.role_menu.forge(relation).save({updated_by, updated_by_who});
    ctx.body = { 'code': 0, 'msg': 'success'};
    ctx.response.status = 201;
    ctx.response.statusString = 'success';
})


function makeTree(items: any[], p?: any) {
    const _items = [];

    if (!p) {
        // 找出根元素
        items.filter(item => !item.parent).forEach(item => _items.push(item));
    } else {
        // 找出 p 的所有子元素
        items.filter(item => item.parent === p.id).forEach(item => _items.push(item));
    }

    _items.sort((a, b) => (!!a.sn ? a.sn : 1000) - (!!b.sn ? b.sn : 1000));

    // 找出每个元素的子元素
    _items.forEach(item => {
        const children = makeTree(items, item);
        if(children.length > 0) item['children'] = children;
    });

    return _items;
}

export default router;
