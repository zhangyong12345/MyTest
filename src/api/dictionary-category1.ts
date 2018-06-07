import * as Router from 'koa-router';
import * as Log4js from 'koa-log4';
import * as uuid from 'uuid';

const router = new Router();
const logger = Log4js.getLogger('dictionary-category1');

router.prefix('/api/dictionary-category1');

//获取指定的类型
router.get('/:id', async (ctx, next) => {
    const id = ctx.params.id;

    let dictionary_category1 = await ctx.models.dictionary_category1.where({id: id}).fetch();

    if (!dictionary_category1) {
        ctx.response.status = 404;
        ctx.response.statusString = '字典类型不存在！';
        return;
    }
    
    ctx.body = dictionary_category1;
});

//获取类型列表
router.get('/', async (ctx, next) => {
    let page = Number(ctx.query.page || 0);
    let limit = Number(ctx.query.rows || 10);
    let offset = Math.max((page - 1) * limit, 0);
    let sort = ctx.query.sort || 'category';
    let order = ctx.query.order || 'ASC';

    let category = ctx.query.category;
    let cat_name = ctx.query.cat_name;

    const where = function(qb) {
        qb.where('deleted', '=', false);
        if (!!category) qb.andWhere('category', 'LIKE', `%${category}%`); 
        if (!!cat_name) qb.andWhere('cat_name', 'LIKE', `%${cat_name}%`);
    }
    
    ctx.body = {'code':0, 'msg':'success'};
    ctx.body.total = await ctx.models.dictionary_category1.query(where).count();
    ctx.body.data = await ctx.models.dictionary_category1.query(where).orderBy(sort, order).fetchPage({limit, offset});

});

//添加一个类型
router.post('/', async (ctx, next) => {
    let fd = ctx.request.body;

    fd.created_by = ctx.state.user.username;
    fd.created_by_who = ctx.state.user.fullname;

    const result = await ctx.models.dictionary_category1.forge().save(fd);

    ctx.body = { 'code': 0, 'msg': 'success', 'data': result || {} };
    ctx.response.status = 201;
    ctx.response.statusString = 'success';
});

//修改一个类型
router.put('/:id', async (ctx, next) => {
    let id = ctx.params.id;
    let fd = ctx.request.body;

    fd.updated_by = ctx.state.user.username;
    fd.updated_by_who = ctx.state.user.fullname;

    const result = await ctx.models.dictionary_category1.forge({id}).save(fd);

    ctx.body = { 'code': 0, 'msg': 'success', 'data': result || {} };
    ctx.response.status = 201;
    ctx.response.statusString = 'success';
});

//删除一个类型
router.delete('/:id', async (ctx, next) => {
    let id = ctx.params.id;
    const updated_by = ctx.state.user.username;
    const updated_by_who = ctx.state.user.fullname;

    const result = await ctx.models.dictionary_category1.forge({id}).save({deleted: true, updated_by, updated_by_who}, {patch: true});

    ctx.body = { 'code': 0, 'msg': 'success'};
    ctx.response.status = 204;
    ctx.response.statusString = 'success';
});

// router.get('/subdept', async (ctx, next) => {

//     let args = { deleted: { $ne: true } };
//     args['type'] = 'subdept';
//     if (ctx.query.code) {
//         args['parent_code'] = ctx.query.code;
//     }

//     ctx.body = {};
//     ctx.body.code = 0;
//     ctx.body.msg = 'success'
//     ctx.body.data = await getCollection(ctx).find(args, { _id: 0 }).toArray();
// });

// router.get('/homearea', async (ctx, next) => {

//     let args = { deleted: { $ne: true } };
//     args['type'] = 'homearea';
//     if (ctx.query.code) {
//         args['area_code'] = ctx.query.code;
//     }

//     ctx.body = {};
//     ctx.body.code = 0;
//     ctx.body.msg = 'success'
//     ctx.body.data = await getCollection(ctx).find(args, { _id: 0 }).toArray();
// });

// router.get('/matters', async (ctx, next) => {

//     let args = { deleted: { $ne: true } };
//     args['type'] = 'matters';
//     if (ctx.query.code) {
//         args['dept_code'] = ctx.query.code;
//     }

//     ctx.body = {};
//     ctx.body.code = 0;
//     ctx.body.msg = 'success'
//     ctx.body.data = await getCollection(ctx).find(args, { _id: 0 }).toArray();
// });

export default router;