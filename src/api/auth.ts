import * as Router from 'koa-router';
import * as Log4js from 'koa-log4';
import * as jwt from 'jsonwebtoken';
import * as crypto from 'crypto';

const router = new Router()
const logger = Log4js.getLogger('api.auth')
const DEFAULT_SECRET = 'NIFOO';

router.prefix('/api/auth')

router.post('/', async (ctx, next) => {
    const pass = ctx.request.body;
    
    const identity = pass.identity || pass.username || pass.email || pass.mobile;
    const credential = crypto.createHash('md5').update(pass.password).digest("hex");
    
    let args = { identity, credential, enabled: true };
    
    let account = await ctx.models.account.forge().where(args).fetch();
    
    let result = null;
    if (account) {
        let user = await ctx.models.user.where({uid: account.get('uid')}).fetch();
        let profile = user && user.toJSON();
        
        Object.assign(profile, {identity: identity});
        const secret = ctx.config.secret || DEFAULT_SECRET;
        const jwtOptions = ctx.config.jwt || {};
        const token = jwt.sign(profile, secret, jwtOptions);

        result = { code: 0, msg: 'success', token: token,
            uid: profile.uid, username: profile.username, fullname: profile.fullname, identity: identity };
    } else {
        result = { code: 1, msg: '用户名或密码错误', success: false };
    }
    ctx.body = result;
})

export default router;
