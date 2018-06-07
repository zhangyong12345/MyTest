import * as Router from 'koa-router';
import * as Log4js from 'koa-log4';

const router = new Router()
const logger = Log4js.getLogger('role')

router.prefix('/api/role')

router.get('/', async (ctx, next) => {
    let page = Number(ctx.query.page || 0);
    let limit = Number(ctx.query.rows || 10);
    let offset = Math.max((page - 1) * limit, 0);
    let sort = ctx.query.sort || 'code';
    let order = ctx.query.order || 'ASC';

    let name = ctx.query.name;
    let code = ctx.query.code;

    const where = function(qb) {
        qb.where('deleted', '=', false);
        if (!!code) qb.andWhere('code', code);
        if (!!name) qb.andWhere('name', 'LIKE', `%${name}%`); 
    }

    if (ctx.query.page) {
        ctx.body = {};
        ctx.body.total = await ctx.models.role.query(where).count();
        ctx.body.data = await ctx.models.role.query(where).orderBy(sort, order).fetchPage({limit, offset});
    } else {
        ctx.body = await ctx.models.role.where(where).orderBy(sort, order).fetchAll();
    }
})

router.get('/:id', async (ctx, next) => {
    const id = ctx.params.id;

    let entity = await ctx.models.role.where({id}).fetch();

    if (!entity) {
        ctx.response.status = 404;
        ctx.response.statusString = '角色不存在！';
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

    const result = await ctx.models.role.forge({id}).save(fd);

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

// TODO: 遍历所有父级机构，并构造成树
router.get('/:id/group', async (ctx, next) => {
    let role_id = ctx.params.id;

    ctx.body = { 'code': 0, 'msg': 'success' };
    ctx.body.data = await ctx.models.org_role.where({role_id, checked: true}).fetchAll();
})

router.post('/:id/group', async (ctx, next) => {
    let role_id = ctx.params.id;
    let group = ctx.request.body;


    const updated_by = ctx.state.user.username;
    const updated_by_who = ctx.state.user.fullname;

    let row = {
        gid: group.id,
        role_id: role_id,
        checked: !!group.checked,
        update_user: ctx.user,
        update_time: ctx.updatetime
    }
    let org_role = await ctx.models.org_role.save(row);

    ctx.body = { 'code': 0, 'msg': 'success'};
    ctx.response.status = 201;
    ctx.response.statusString = 'success';
})

router.get('/:id/user', async (ctx, next) => {
    let page = Number(ctx.query.page || 0);
    let limit = Number(ctx.query.rows || 10);
    let offset = Math.max((page - 1) * limit, 0);
    let sort = ctx.query.sort || 'uid';
    let order = ctx.query.order || 'ASC';

    let role_id = ctx.params.id || '';

        // 找出该角色所有用户
        let ids = [];
        let user_list = await ctx.models.user_role.where({role_id, checked: true}).fetchAll();
        ids = user_list.toJSON().map(e => e.uid);
    
        const where = function(qb) {
            qb.where('deleted', '=', false);
            if (!!ids) qb.whereIn('uid', ids);
        }
    
        // 装载用户列表
        let users = null;
        if (page) {
            users = { 'code': 0, 'msg': 'success'};
            users.total = await ctx.models.user.query(where).count();
            users.data = await ctx.models.user.query(where).orderBy(sort, order).fetchPage({limit, offset});
        } else {
            users = await ctx.models.user.query(where).orderBy(sort, order).fetchAll();
        }
    
        ctx.body = users;

    // const where = qb => {
    //     // qb.join('user_role', function() {
    //     //     this.on('user_base.uid', '=', 'user_role.uid').andOn('user_role.checked','=', true)
    //     // }).where('deleted', '=', false).andWhere('user_role.role_id', '=', role_id);
    //     qb.innerJoin('user_base', 'user_base.uid', 'user_role.uid'); //.where('user_role.checked','=', true);
    //     // qb.join('user_role', 'user_base.uid', 'user_role.uid').where('user_role.checked','=', true);
    //     // qb.where('user_role.checked','=', true);
    //     // qb.andWhere('user_role.role_id', '=', role_id);
    //     // qb.where('user_role.checked', '=', true);
    //     qb.where('user_base.deleted', '=', false);
    // }

    // if (ctx.query.page) {
    //     ctx.body = {};
    //     ctx.body.total = await ctx.models.user.query(where).count();
    //     ctx.body.data = await ctx.models.user.query(where).orderBy(sort, order).fetchPage({limit, offset});
    // } else {
    //     const result = await ctx.models.user_role.where(where).orderBy(sort, order).fetchAll({withRelated: [{ user: qb => qb.where('deleted', '=', false)} ]});
    //     ctx.body = result.map(e => e.related('user'));

    //     // ctx.knex.select('user_base.*').from('user_role').join('user_base', 'user_base.uid', 'user_role.uid')
    // }
})

router.post('/:id/user', async (ctx, next) => {
    let rid = ctx.params.id;
    let users = ctx.request.body || [];

    const updated_by = ctx.state.user.username;
    const updated_by_who = ctx.state.user.fullname;

    // 提交的是用户数组
    // TODO: 需要优化，使用bulk方式
    users.forEach(async user =>  {
        
        let row = {
            uid: user.uid,
            role_id: rid,
            checked: !!user.checked,
            update_user: ctx.user,
            update_time: ctx.updatetime
        }
        let role_list = await ctx.models.user_role.save(row);
    });

    ctx.body = { 'code': 0, 'msg': 'success' };
    ctx.response.status = 201;
    ctx.response.statusString = 'success';
})

export default router;
