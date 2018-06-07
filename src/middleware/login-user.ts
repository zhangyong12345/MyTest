/**
 * 从 cookie 中获取用户信息.
 * 如果参数为 array，则取数据组中的值作为 cookie name 和用户的属性名称；
 * 如果参数为 map, 则取 value 作为 cookie name, key 作为用户的属性名称；
 *
 * @export
 * @param {*} [opts={}]
 * @returns {Function}
 */

export default function LoginUser(opts: Array<string> | any): Function  {

    return async (ctx, next) => {
        const attributes = opts;

        if (attributes) {
            let user = {};
            for (let key in attributes) {
                if (attributes.hasOwnProperty(key)) {
                    let element = attributes[key];
                    let value = ctx.cookies.get(element);
                    if (Array.isArray(attributes)) {
                        user[element] = value;
                    } else {
                        user[key] = value;
                    }
                }
            }
            console.log('fda');

            ctx.user = user;
        }

        await next();
    }
}
