import * as Path from 'path'

let Config = (function () {

    const CONFIG: string = process.env.CONFIG;
    const CONFIG_DIR: string = process.env.CONFIG_DIR || './config';
    const PROFILE: string = process.env.NODE_ENV || 'dev';

    let file = null;
    if (CONFIG) {
        file = Path.resolve(CONFIG);
    } else if (PROFILE === 'prod' || PROFILE === 'production') {
        file = Path.resolve(CONFIG_DIR, 'prod.json');
    } else if (PROFILE === 'test') {
        file = Path.resolve(CONFIG_DIR, 'test.json');
    } else if (PROFILE === 'dev' || PROFILE === 'development') {
        file = Path.resolve(CONFIG_DIR, 'dev.json');
    } else {
        file = Path.resolve(CONFIG_DIR, 'dev.json');
    }

    let conf = require(file);
    conf.path = file;

    if (!conf.port) {
        conf.port = 3000;
    }

    return conf;
})();

export default Config;
