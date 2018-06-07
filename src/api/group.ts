import * as Router from 'koa-router';
import * as Log4js from 'koa-log4';
import * as uuid from 'uuid';

const router = new Router()
const logger = Log4js.getLogger('group')

router.prefix('/api/group')

router.get('/', async (ctx, next) => {
    let page = Number(ctx.query.page || 0);
    let limit = Number(ctx.query.rows || 10);
    let offset = Math.max((page - 1) * limit, 0);
    let sort = ctx.query.sort || 'org_code';
    let order = ctx.query.order || 'ASC';

    let name = ctx.query.name;
    let code = ctx.query.code;

    const where = function(qb) {
        qb.where('deleted', '=', false);
        if (!!code) qb.andWhere('org_code', code);
        if (!!name) qb.andWhere('org_name', 'LIKE', `%${name}%`); 
    }

    if (ctx.query.page) {
        ctx.body = { 'code': 0, 'msg': 'success'};
        ctx.body.total = await ctx.models.org.query(where).count();
        let orgList = await ctx.models.org.query(where).orderBy(sort, order).fetchPage({limit, offset});
        let groups = orgList.toJSON().map(org => Object.assign({}, {
            id: org.id,
            code: org.org_code, 
            name: org.org_name, 
            parent: org.parent_node_id,
            divsion_code: org.division_code,
        }));
        ctx.body.data = groups;
    } else {
        let orgList = await ctx.models.org.where(where).orderBy(sort, order).fetchAll();
        let groups = orgList.toJSON().map(org => Object.assign({}, {
            id: org.id,
            code: org.org_code, 
            name: org.org_name, 
            parent: org.parent_node_id,
            divsion_code: org.division_code,
        }));
        ctx.body = groups;
    }
})

router.get('/tree', async (ctx, next) => {
    const items = await ctx.models.org.where('deleted', '=', false).fetchAll();

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

router.get('/:id', async (ctx, next) => {
    const id = ctx.params.id;

    let entity = await ctx.models.org.where({id}).fetch();

    if (!entity) {
        ctx.response.status = 404;
        ctx.response.statusString = '机构不存在！';
        return;
    }
    
    ctx.body = entity;
})

router.delete('/:id', async (ctx, next) => {
    let id = ctx.params.id;

    const updated_by = ctx.state.user.username;
    const updated_by_who = ctx.state.user.fullname;

    const result = await ctx.models.org.forge({id}).save({deleted: true, updated_by, updated_by_who}, {patch: true});

    ctx.body = { 'code': 0, 'msg': 'success'};
    ctx.response.status = 204;
    ctx.response.statusString = 'success';
})

router.put('/:id', async (ctx, next) => {
    let id = ctx.params.id;
    let fd = ctx.request.body;

    fd.updated_by = ctx.state.user.username;
    fd.updated_by_who = ctx.state.user.fullname;

    const result = await ctx.models.org.forge({id}).save(fd);

    ctx.body = { 'code': 0, 'msg': 'success', 'data': result || {} };
    ctx.response.status = 201;
    ctx.response.statusString = 'success';
})

router.post('/', async (ctx, next) => {
    let fd = ctx.request.body;
    fd.deleted = fd.deleted || false;

    fd.created_by = ctx.state.user.username;
    fd.created_by_who = ctx.state.user.fullname;

    const result = await ctx.models.org.forge().save(fd);

    ctx.body = { 'code': 0, 'msg': 'success', 'data': result || {} };
    ctx.response.status = 201;
    ctx.response.statusString = 'success';
})

router.get('/:id/user', async (ctx, next) => {
    let page = Number(ctx.query.page || 0);
    let limit = Number(ctx.query.rows || 10);
    let offset = Math.max((page - 1) * limit, 0);
    let sort = ctx.query.sort || 'uid';
    let order = ctx.query.order || 'ASC';

    let uid = ctx.query.uid;
    let username = ctx.query.username;
    let fullname = ctx.query.fullname;

    // 找出机构下所有用户
    let ids = null;
    let gid = ctx.params.id || '';
    let user_list = await ctx.models.user_org.where({gid, checked: true}).fetchAll();
    user_list = user_list.toJSON();
    if (ctx.query.scop === '2') {
        ids = user_list.map(e => e.uid);
    }

    // TODO: 找出所有子机构的用户

    const where = function(qb) {
        qb.where('deleted', '=', false);
        if (!!ctx.query.uid) qb.andWhere('uid', ctx.query.uid);
        if (!!ctx.query.enabled) qb.andWhere('enabled', ctx.query.enabled);
        if (!!username) qb.andWhere('username', 'LIKE', `%${username}%`); 
        if (!!fullname) qb.andWhere('fullname', 'LIKE', `%${fullname}%`);
        if (!!ids) qb.whereIn('uid', ids);
    }

    // 装载用户列表
    let users = null;
    if (ctx.query.page !== undefined) {
        users = { 'code': 0, 'msg': 'success'};
        users.total = await ctx.models.user.query(where).count();
        let data = await ctx.models.user.query(where).orderBy(sort, order).fetchPage({limit, offset});
        data = data.toJSON();
        data.forEach(u => u.checked = user_list.some(e => e.uid === u.uid));
        users.data = data;
    } else {
        let data = await ctx.models.user.query(where).orderBy(sort, order).fetchAll();
        users = data.toJSON();
        data.forEach(u => u.checked = user_list.some(e => e.uid === u.uid));
    }

    ctx.body = users;
})

router.post('/:id/user', async (ctx, next) => {
    let gid = ctx.params.id;
    let user = ctx.request.body;

    let row = {
        gid: gid,
        uid: user.uid,
        checked: user.checked
    };
    const updated_by = ctx.state.user.username;
    const updated_by_who = ctx.state.user.fullname;

    const result = await ctx.models.user_org.forge(row).save({updated_by, updated_by_who});

    ctx.body = { 'code': 0, 'msg': 'success', 'data': result || {} };
    ctx.response.status = 201;
    ctx.response.statusString = 'success';
})


router.get('/:id/role', async (ctx, next) => {
    // 找出机构下所有角色
    let gid = ctx.params.id || '';
    let user_list = await ctx.models.org_role.where({gid, checked: true}).fetchAll();
    let ids = user_list.toJSON().map(e => e.role_id);

    // TODO: 遍历所有父级机构的角色

    const where = function(qb) {
        qb.where('deleted', '=', false);
        qb.whereIn('id', ids);
    }
    
    // 装载角色列表
    let result = await ctx.models.role.query(where).fetchAll();
    ctx.body = { 'code': 0, 'msg': 'success', 'data': result || {} };

})

router.post('/:id/role', async (ctx, next) => {
    let gid = ctx.params.id;
    let role = ctx.request.body;

    let row = {
        gid: gid,
        role_id: role.id,
        checked: role.checked
    };
    const updated_by = ctx.state.user.username;
    const updated_by_who = ctx.state.user.fullname;

    ctx.body = { 'code': 0, 'msg': 'success'};
    ctx.data = await ctx.models.org_role.forge(row).save({updated_by, updated_by_who});
    ctx.response.status = 201;
    ctx.response.statusString = 'success';
})

export default router;
