// app-test.js
process.env.NODE_ENV = 'development';

import 'mocha';
import * as assert from 'assert';
import * as request from 'supertest';
import { server } from '../../src/app';

describe('#test sqlite demo with supertest', () => {

    before(async () => {
        // await server
    });

    after(() => {
        server.close()
    });

    it('#test GET /sqlite3/0', (done) => {
        request(server)
            .get('/sqlite3/0')
            .expect('Content-Type', /json/)
            .expect(200, { id: 0, name: 'test' }, done);
    });

    it('#test GET /sqlite3/1', (done) => {
        request(server)
            .get('/sqlite3/1')
            .expect('Content-Type', /json/)
            .expect(res => {
                res.body = res.body[0];
            })
            .expect(200, {"id":1,"info":"11"}, done)
    });

    it.skip('#test GET /sqlite3/2', async () => {
        await request(server)
            .get('/sqlite3/2')
            // .set('Accept', 'application/json')
            // .expect('Content-Type', /text\/html/)
            .expect('Content-Type', /json/)
            .expect(200, '{"id":1,"info":"11"}')
    });

    it('#test GET /sqlite3/3', (done) => {
        request(server)
            .get('/sqlite3/3')
            .expect(200)
            .end((err, res) => {
                if (err) return done(err);
                done();
            });
    });

    it('#test GET TEXT /sqlite3/4', () => {
        return request(server)
            .get('/sqlite3/4')
            .then(res => {
                console.log(res.body);
                assert.deepStrictEqual(res.text, '<html><body>1: 11<br/>2: 22<br/></body></html>')
            });
    });

    it.skip('#test GET 百度', () => {
        return request('http://www.baidu.com')
            .get('/')
            .expect(200)
            .then(res => {
                // console.log(res);
            })
    });
});