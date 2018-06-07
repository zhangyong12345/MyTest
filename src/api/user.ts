import * as Router from 'koa-router';
import * as Log4js from 'koa-log4';
import * as crypto from 'crypto';

const router = new Router();
const logger = Log4js.getLogger('user');

router.prefix('/api/user')

router.get('/', async (ctx, next) => {
    let page = Number(ctx.query.page || 0);
    let limit = Number(ctx.query.rows || 10);
    let offset = Math.max((page - 1) * limit, 0);
    let sort = ctx.query.sort || 'uid';
    let order = ctx.query.order || 'ASC';

    let username = ctx.query.username;
    let fullname = ctx.query.fullname;
    let uid = ctx.query.uid;

    const where = function(qb) {
        qb.where('deleted', '=', false);
        if (!!ctx.query.enabled) qb.andWhere('enabled', ctx.query.enabled);
        if (!!uid) qb.andWhere('uid', uid);
        if (!!username) qb.andWhere('username', 'LIKE', `%${username}%`); 
        if (!!fullname) qb.andWhere('fullname', 'LIKE', `%${fullname}%`);
    }

    if (ctx.query.page) {
        ctx.body = {};
        ctx.body.total = await ctx.models.user.query(where).count();
        ctx.body.data = await ctx.models.user.query(where).orderBy(sort, order).fetchPage({limit, offset});
    } else {
        ctx.body = await ctx.models.user.where(where).orderBy(sort, order).fetchAll();
    }
})

router.get('/whoami', async (ctx, next) => {
    let user = ctx.state.user;

    if (!user) {
        ctx.response.status = 404;
        ctx.response.statusString = '用户不存在！';
        return;
    }

    user = await ctx.models.user.where({uid: user.uid}).fetch();
    
    ctx.body = user;
})

router.get('/:id', async (ctx, next) => {
    const id = ctx.params.id;

    let user = await ctx.models.user.where({uid: id}).fetch();

    if (!user) {
        ctx.response.status = 404;
        ctx.response.statusString = '用户不存在！';
        return;
    }
    
    ctx.body = user;
})


router.delete('/:id', async (ctx, next) => {
    let id = ctx.params.id;

    const updated_by = ctx.state.user.username;
    const updated_by_who = ctx.state.user.fullname;

    const result = await ctx.models.user.forge({'uid': id}).save({deleted: true, updated_by, updated_by_who}, {patch: true});

    ctx.body = { 'code': 0, 'msg': 'success'};
    ctx.response.status = 204;
    ctx.response.statusString = 'success';
})

router.put('/:id', async (ctx, next) => {
    let uid = ctx.params.id;
    let fd = ctx.request.body;

    fd.updated_by = ctx.state.user.username;
    fd.updated_by_who = ctx.state.user.fullname;

    const result = await ctx.models.user.forge({uid: uid}).save(fd);

    ctx.body = { 'code': 0, 'msg': 'success', 'data': result || {} };
    ctx.response.status = 201;
    ctx.response.statusString = 'success';
})

router.post('/', async (ctx, next) => {
    let fd = ctx.request.body;
    fd.deleted = fd.deleted || false;

    fd.created_by = ctx.state.user.username;
    fd.created_by_who = ctx.state.user.fullname;

    const result = await ctx.models.user.forge().save(fd);

    ctx.body = { 'code': 0, 'msg': 'success', 'data': result || {} };
    ctx.response.status = 201;
    ctx.response.statusString = 'success';
})

router.get('/:id/role', async (ctx, next) => {
    let uid = ctx.params.id;
    let cascaded = !!ctx.query.cascaded;

    let role_list = await ctx.models.user_role.where({uid, checked: true}).fetchAll();
    let ids = role_list.toJSON().map(e => e.role_id);

    // 取用户所在机构的角色
    // TODO: 遍历所有父级机构
    if (cascaded) {
        let user_org = await ctx.models.user_org.where({uid, checked: true}).fetchAll();;
        let gIds = user_org.toJSON().map(e => e.gid);

        if (gIds && gIds.length > 0) {
            let group_role = await ctx.models.org_role.query(qb => {
                qb.qb.where('checked', '=', true).whereIn('gid', gIds);
            }).fetchAll();;
            group_role.forEach(e => ids.push(e.role_id));
        }
    }

    const where = function(qb) {
        qb.where('deleted', '=', false);
        if (!!ids) qb.whereIn('id', ids);
    }

    let result = await ctx.models.role.query(where).fetchAll();
    ctx.body = { 'code': 0, 'msg': 'success', 'data': result || {} };
})

router.post('/:id/role', async (ctx, next) => {
    let uid = ctx.params.id;
    let role = ctx.request.body;

    let row = {
        uid: uid,
        role_id: role.id,
        checked: role.checked
    };
    const updated_by = ctx.state.user.username;
    const updated_by_who = ctx.state.user.fullname;

    const result = await ctx.models.user_role.forge(row).save({updated_by, updated_by_who});

    ctx.body = { 'code': 0, 'msg': 'success', 'data': result || {} };
    ctx.response.status = 201;
    ctx.response.statusString = 'success';
})

router.get('/:id/group', async (ctx, next) => {
    let uid = ctx.params.id;

    let group_list = await ctx.models.user_org.where({uid, checked: true}).fetchAll();
    group_list = group_list.toJSON();
    let ids = group_list.map(e => e.gid);

    const where = function(qb) {
        qb.where('deleted', '=', false);
        if (!!ids) qb.whereIn('gid', ids);
    }

    let result = await ctx.models.org.query(where).fetchAll();
    ctx.body = { 'code': 0, 'msg': 'success', 'data': result || {} };
})

router.post('/:id/group', async (ctx, next) => {
    let uid = ctx.params.id;
    let group = ctx.request.body;

    let row = {
        gid: group.id,
        uid: uid,
        checked: group.checked
    };
    const updated_by = ctx.state.user.username;
    const updated_by_who = ctx.state.user.fullname;

    const result = await ctx.models.user_org.forge(row).save({updated_by, updated_by_who});

    ctx.body = { 'code': 0, 'msg': 'success', 'data': result || {} };
    ctx.response.status = 201;
    ctx.response.statusString = 'success';
})

router.get('/:id/account', async (ctx, next) => {
    let uid = ctx.params.id;
    const result = await ctx.models.account.where({uid}).fetchAll();

    ctx.body = { 'code': 0, 'msg': 'success', 'data': result || {} };
})


router.post('/:id/account', async (ctx, next) => {
    let uid = ctx.params.id;
    let _account = ctx.request.body;
    let identity = _account.identity;
    let account = !!_account.id ? _account : makeDefaultAccount(uid, identity);

    const updated_by = ctx.state.user.username;
    const updated_by_who = ctx.state.user.fullname;

    const result = await ctx.models.account.forge({uid, identity}).save({updated_by, updated_by_who}, {patch: true});
    delete result.credential; // 删掉凭证

    ctx.body = { 'code': 0, 'msg': 'success', 'data': result || {} };
    ctx.response.status = 201;
    ctx.response.statusString = 'success';
})

function makeDefaultAccount(uid, identity) {
    let credential = crypto.createHash('md5').update('123456').digest("hex");

    let account = {
        uid,
        identity,
        credential,
        account_type: '1',
        is_default: true,
        enabled: true
    }

    return account;
}

router.delete('/:id/account/:account', async (ctx, next) => {
    let uid = ctx.params.id;
    let identity = ctx.params.account;

    const updated_by = ctx.state.user.username;
    const updated_by_who = ctx.state.user.fullname;

    const result = await ctx.models.account.forge({uid, identity}).save({deleted: true, updated_by, updated_by_who}, {patch: true});

    ctx.body = { 'code': 0, 'msg': 'success'};
    ctx.response.status = 204;
    ctx.response.statusString = 'success';
})

router.put('/:id/password', async (ctx, next) => {
    let uid = ctx.params.id;
    let identity = ctx.request.body;
    const credential = crypto.createHash('md5').update(identity.password).digest("hex");

    const updated_by = ctx.state.user.username;
    const updated_by_who = ctx.state.user.fullname;

    const result = await ctx.models.account.forge({ 'uid': uid, 'account_type': 1 }).save({credential, updated_by, updated_by_who});

    ctx.body = { 'code': 0, 'msg': 'success'};
    ctx.response.status = 201;
    ctx.response.statusString = 'success';
})


// 获取用户头像
router.get('/:id/avatar', async (ctx, next) => {
    let uid = ctx.params.id;
    let entity = await ctx.models.user_extra.where({uid}).fetch();

    ctx.body = !!entity ? {uid, avatar: entity.get('avatar')} : {uid};
})

// 保存或修改用户头像
router.put('/:id/avatar', async (ctx, next) => {
    let uid = ctx.params.id; 
    let avatar = ctx.request.body;

    const result = await ctx.models.user_extra.forge({uid}).save(avatar);

    ctx.body = { 'code': 0, 'msg': 'success', 'data': result || {} };
    ctx.response.status = 201;
    ctx.response.statusString = 'success';
})

// // 保存或修改用户头像
// router.post('/:id/avatar', async (ctx, next) => {
//     // do nothing

//     ctx.body = { 'code': 0, 'msg': 'success' };
//     ctx.response.status = 200;
//     ctx.response.statusString = 'success';
// })


export default router;
