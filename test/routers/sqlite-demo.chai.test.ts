// app-test.js
process.env.NODE_ENV = 'development';

import 'mocha';
import * as chai from 'chai';
import { server } from '../../src/app';

import * as chaiHttp from 'chai-http';
// const chaiHttp = require('chai-http');

// 支持3种风格
chai.use(chaiHttp);
const should = chai.should();
const expect = chai.expect;
const assert = chai.assert;

describe('#routes: sqlite', () => {

    before(async () => {
        // await server
    });

    after(() => {
        server.close()
    });

    it('#test GET /sqlite3/0', (done) => {
        chai.request(server)
            .get('/sqlite3/0')
            .end((err, res) => {
                should.not.exist(err);
                res.status.should.eql(200);
                done();
            });
    });

    it('#test GET /sqlite3/1', (done) => {
        chai.request(server)
            .get('/sqlite3/1')
            .end((err, res) => {
                should.not.exist(err);
                res.status.should.eql(200);
                done();
            });
    });

    it('#test GET /sqlite3/2', async () => {
        chai.request(server)
            .get('/sqlite3/2')
            .end((err, res) => {
                expect(res.status).to.equal(200);
                expect(res.type).to.eq('application/json');
                expect(res).to.be.an('object');
                expect(res.body).to.have.lengthOf(2);
                expect(res.body[0]).to.eql({ "id": 1, "info": "11" });
                expect(res.body).to.deep.include({ "id": 1, "info": "11" });
                expect(res.body).to.deep.include.members([{ "id": 1, "info": "11" }]);
            })
    });

    it.only('#test GET /sqlite3/3', (done) => {
        return chai.request(server)
            .fetch('/sqlite3/3')
            .then(function (res) {
                return res.json();
            }).then(function (json) {
                console.log(json);
                expect(json).to.be.an('object');
            });
    });

    it('#test GET /sqlite3/4', () => {
        chai.request(server)
            .get('/sqlite3/4')
            .expect(200)
            .then(response => {
                assert(response.body, '1: 11<br/>2: 22<br/>1')
            });
    });

});