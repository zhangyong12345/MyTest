import * as Router from 'koa-router';
import * as Log4js from 'koa-log4';

/**
 * 科室信息管理
 */

const router = new Router();
const logger = Log4js.getLogger('section');

router.prefix('/api/section');


router.get('/', async (ctx, next) => {
    let sort = ctx.query.sort || 'code';
    let order = ctx.query.order || 'ASC';

    let code = ctx.query.code;
    let name = ctx.query.name;
    let org_id = ctx.query.group;
    let division = ctx.query.division;

    const where = function(qb) {
        qb.where('deleted', '=', false);
        if (!!code) qb.andWhere('name', 'LIKE', `%${code}%`); 
        if (!!name) qb.andWhere('name', 'LIKE', `%${name}%`); 
        if (!!org_id) qb.andWhere('org_id', org_id);
        if (!!division) qb.andWhere('division_code', division);
    }

    ctx.body = {code: 0, msg: 'success'};
    ctx.body.data = await ctx.models.section.where(where).orderBy(sort, order).fetchAll();
});

router.get('/:id', async (ctx, next) => {
    const id = ctx.params.id;

    let entity = await ctx.models.section.where({id}).fetch();

    if (!entity) {
        ctx.response.status = 404;
        ctx.response.statusString = '科室不存在！';
        return;
    }
    
    ctx.body = entity;
});


router.delete('/:id', async (ctx, next) => {
    const id = ctx.params.id;

    const updated_by = ctx.state.user.username;
    const updated_by_who = ctx.state.user.fullname;

    const result = await ctx.models.section.forge({id}).save({deleted: true, updated_by, updated_by_who}, {patch: true});

    ctx.body = { 'code': 0, 'msg': 'success'};
    ctx.response.status = 204;
    ctx.response.statusString = 'success';
});

router.put('/:id', async (ctx, next) => {
    let id = ctx.params.id;
    let fd = ctx.request.body;

    fd.updated_by = ctx.state.user.username;
    fd.updated_by_who = ctx.state.user.fullname;

    const result = await ctx.models.section.forge({id}).save(fd);

    ctx.body = { 'code': 0, 'msg': 'success', 'data': result || {} };
    ctx.response.status = 201;
    ctx.response.statusString = 'success';
});

router.post('/', async (ctx, next) => {
    let fd = ctx.request.body;
    fd.deleted = fd.deleted || false;

    fd.created_by = ctx.state.user.username;
    fd.created_by_who = ctx.state.user.fullname;

    const result = await ctx.models.section.forge().save(fd);

    ctx.body = { 'code': 0, 'msg': 'success', 'data': result || {} };
    ctx.response.status = 201;
    ctx.response.statusString = 'success';
});

export default router;