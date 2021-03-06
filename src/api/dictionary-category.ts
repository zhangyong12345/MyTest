import * as Router from 'koa-router';
import * as Log4js from 'koa-log4';
import * as uuid from 'uuid';

const router = new Router();
const logger = Log4js.getLogger('dictionary-category');

router.prefix('/api/dictionary-category');

//获取指定的字典类型
router.get('/:id', async (ctx, next) => {
    const id = ctx.params.id;

    let dictionary_category = await ctx.models.dictionary_category.where({id: id}).fetch();

    if (!dictionary_category) {
        ctx.response.status = 404;
        ctx.response.statusString = '字典类型不存在！';
        return;
    }
    
    ctx.body = dictionary_category;
});

//获取字典类型列表
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
    ctx.body.total = await ctx.models.dictionary_category.query(where).count();
    ctx.body.data = await ctx.models.dictionary_category.query(where).orderBy(sort, order).fetchPage({limit, offset});

});

// 添加一个字典类型
router.post('/', async (ctx, next) => {
    let fd = ctx.request.body;

    fd.created_by = ctx.state.user.username;
    fd.created_by_who = ctx.state.user.fullname;

    const result = await ctx.models.dictionary_category.forge().save(fd);

    ctx.body = { 'code': 0, 'msg': 'success', 'data': result || {} };
    ctx.response.status = 201;
    ctx.response.statusString = 'success';
})


//修改数据字典
router.put('/:id', async (ctx, next) => {
    let id = ctx.params.id;
    let fd = ctx.request.body;

    fd.updated_by = ctx.state.user.username;
    fd.updated_by_who = ctx.state.user.fullname;

    const result = await ctx.models.dictionary_category.forge({id}).save(fd);

    ctx.body = { 'code': 0, 'msg': 'success', 'data': result || {} };
    ctx.response.status = 201;
    ctx.response.statusString = 'success';
})

// 删除数据字典
router.delete('/:id', async (ctx, next) => {
    let id = ctx.params.id;
    const updated_by = ctx.state.user.username;
    const updated_by_who = ctx.state.user.fullname;

    const result = await ctx.models.dictionary_category.forge({id}).save({deleted: true, updated_by, updated_by_who}, {patch: true});

    ctx.body = { 'code': 0, 'msg': 'success'};
    ctx.response.status = 204;
    ctx.response.statusString = 'success';
})


export default router;