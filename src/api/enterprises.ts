import * as Router from 'koa-router';
import * as Log4js from 'koa-log4';
import * as uuid from 'uuid';

const router = new Router();
const logger = Log4js.getLogger('enterprise');

router.prefix('/api/enterprises');

//获取指定的企业信息
router.get('/:id', async (ctx, next) => {
    const id = ctx.params.id;

    let enterprise = await ctx.models.commercial_subject.where({id: id}).fetch();

    if (!enterprise) {
        ctx.response.status = 404;
        ctx.response.statusString = '字典条目不存在！';
        return;
    }
    
    ctx.body = enterprise;
});

//获取企业信息列表
router.get('/', async (ctx, next) => {
    let page = Number(ctx.query.page || 0);
    let limit = Number(ctx.query.rows || 10);
    let offset = Math.max((page - 1) * limit, 0);
    let sort = ctx.query.sort || 'ep_no';
    let order = ctx.query.order || 'ASC';

    let unisc_code = ctx.query.unisc_code;
    let ep_no = ctx.query.ep_no;
    let ep_name = ctx.query.ep_name;

    const where = function(qb) {
        //qb.where('unisc_code', 'like', '%');
        if (!!unisc_code) qb.andWhere('unisc_code', 'LIKE', `%${unisc_code}%`); 
        if (!!ep_no) qb.andWhere('code', 'LIKE', `%${ep_no}%`); 
        if (!!ep_name) qb.andWhere('name', 'LIKE', `%${ep_name}%`); 
    }

    ctx.body = {'code':0, 'msg':'success'};
    ctx.body.total = await ctx.models.commercial_subject.query(where).count();
    ctx.body.data = await ctx.models.commercial_subject.query(where).orderBy(sort, order).fetchPage({limit, offset});
});

export default router;