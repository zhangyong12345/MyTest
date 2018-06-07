import * as Router from 'koa-router';
import * as Log4js from 'koa-log4';
import * as uuid from 'uuid';

const router = new Router();
const logger = Log4js.getLogger('matter-enterprise');

router.prefix('/api/matterEnterprises');

//获取指定的企业信息
router.get('/:id', async (ctx, next) => {
    const id = ctx.params.id;

    let matter_enterprise = await ctx.models.matter_enterprise.where({id: id}).fetch();

    if (!matter_enterprise) {
        ctx.response.status = 404;
        ctx.response.statusString = '字典条目不存在！';
        return;
    }
    
    ctx.body = matter_enterprise;
});

//获取企业信息列表
router.get('/', async (ctx, next) => {
    let page = Number(ctx.query.page || 0);
    let limit = Number(ctx.query.rows || 10);
    let offset = Math.max((page - 1) * limit, 0);
    let sort = ctx.query.sort || 'ep_no';
    let order = ctx.query.order || 'ASC';

    let org_code = ctx.query.org_code;
    let org_name = ctx.query.org_name;
    let ep_no = ctx.query.ep_no;
    let ep_name = ctx.query.ep_name;

    const where = function(qb) {
        qb.where('deleted', '=', false);
        if (!!org_code) qb.andWhere('org_code', 'LIKE', `%${org_code}%`); 
        if (!!org_name) qb.andWhere('org_name', 'LIKE', `%${org_name}%`); 
        if (!!ep_no) qb.andWhere('ep_no', 'LIKE', `%${ep_no}%`); 
        if (!!ep_name) qb.andWhere('ep_name', 'LIKE', `%${ep_name}%`); 
    }

    ctx.body = {'code':0, 'msg':'success'};
    ctx.body.total = await ctx.models.matter_enterprise.query(where).count();
    ctx.body.data = await ctx.models.matter_enterprise.query(where).orderBy(sort, order).fetchPage({limit, offset});
});

//添加一家企业
router.post('/', async (ctx, next) => {
    let fd = ctx.request.body;

    fd.created_by = ctx.state.user.username;
    fd.created_by_who = ctx.state.user.fullname;

    const result = await ctx.models.matter_enterprise.forge().save(fd);

    ctx.body = { 'code': 0, 'msg': 'success', 'data': result || {} };
    ctx.response.status = 201;
    ctx.response.statusString = 'success';
});

//修改一家企业
router.put('/:id', async (ctx, next) => {
    let id = ctx.params.id;
    let fd = ctx.request.body;

    fd.updated_by = ctx.state.user.username;
    fd.updated_by_who = ctx.state.user.fullname;

    const result = await ctx.models.matter_enterprise.forge({id}).save(fd);

    ctx.body = { 'code': 0, 'msg': 'success', 'data': result || {} };
    ctx.response.status = 201;
    ctx.response.statusString = 'success';
});

//删除一家企业
router.delete('/:id', async (ctx, next) => {
    let id = ctx.params.id;
    const updated_by = ctx.state.user.username;
    const updated_by_who = ctx.state.user.fullname;

    const result = await ctx.models.matter_enterprise.forge({id}).save({deleted: true, updated_by, updated_by_who}, {patch: true});

    ctx.body = { 'code': 0, 'msg': 'success'};
    ctx.response.status = 204;
    ctx.response.statusString = 'success';
});

export default router;