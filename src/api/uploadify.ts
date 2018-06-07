import * as Router from 'koa-router';
import * as multer from 'koa-multer';
import * as Log4js from 'koa-log4';
import * as fs from 'fs';
import * as path from 'path';
import * as uuid from 'uuid';

const cfg = {
    path: '/fileupload',
    fileKey: 'files',
    multer: { dest: 'uploaded/' }
};
const router = new Router();
router.prefix('/api/upload');
const logger = Log4js.getLogger('upload');

const upload = multer(cfg.multer);
const type = upload.single(cfg.fileKey);

router.get('/:file/:name', async (ctx, next) => {
    const name = ctx.params.name;
    const fpath = ctx.params.file;
    const p = 'uploaded/' + fpath;

    try {
        const stats = fs.statSync(p);
        if (stats.isFile()) {
            ctx.response.attachment(name);
            ctx.body = await fs.createReadStream(p);
        } else {
            ctx.body = '文件未找到'
        }
    } catch (error) {
        ctx.body = '文件未找到';
    }

});

router.post('/', type, async (ctx, next) => {
    const filePath = ctx.req.file.path;
    const fileName = ctx.req.file.originalname;

    const file: any = {};
    //file[fileName] = filePath;
    file.name = fileName;
    file.status = 'done';
    file.uid = uuid.v4();
    file.url = 'api/upload/' + ctx.req.file.filename + '/' + fileName;
    file.thumbUrl = 'api/upload/' + ctx.req.file.filename + '/' + fileName;
    
    ctx.body = { file };
});

router.delete('/:file', async (ctx, next) => {
    const fileName = ctx.params.file;
    const filePath = 'uploaded/' + fileName;

    // fs.unlink(filePath, async (e) {
    //     // nothing need to do
    // });

    ctx.body = { msg: 'success' };
});

export default router;
