import * as Log4js from 'koa-log4'

const logger = Log4js.getLogger('main')

export class LorenService {

    constructor(private db) {

    }
}
