import * as assert from 'assert';
import 'mocha';
import {expect}  from 'chai';
import {LorenService} from '../../src/services/LorenService';

describe('#LorenService.ts', () => {

    describe('#LorenService()', () => {
        it('getById() should return 1 instance', () => {
            assert.strictEqual(sum(), 0);
        });

        it('getAll() should return all instances', () => {
            assert.strictEqual(sum(1), 1);
        });
    });
});