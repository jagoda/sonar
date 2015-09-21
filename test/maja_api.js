'use strict';

var connect     = require('./connect'),
    captureData = require('./streams').captureData,
    expect      = require('chai').expect,
    express     = require('./express'),
    maja        = require('../public-api');

describe('A Sonar instance', function () {

    // TODO check api, check options, check body parsers

    describe('can interact with a Connect instance and', function () {

        var app = connect();

        it('can capture a response body', function (done) {
            maja(app).get('/plain-text', function (error, res, body) {
                expect(error).to.be.null;
                expect(body).not.to.be.undefined;
                done();
            });
        });

        it('can parse a JSON response body', function (done) {
            maja(app).get('/json', function (error, res, body) {
                expect(error).to.be.null;
                expect(body).to.deep.equal({
                    hello: 'world'
                });
                done();
            });
        });

        it('can parse an HTML response body', function (done) {
            maja(app).get('/html', function (error, response, body) {
                expect(error).to.be.null;
                expect(body.$('div').text()).to.equal('Hello');
                done();
            });
        });

        it.skip('can inject jQuery plugins', function (done) {
            var instance = maja(app);

            instance.plugin(function ($) {
                $.hello = function () {
                    return $('div');
                };
            }).plugin(function ($) {
                $.fn.message = function () {
                    return this.text();
                };
            });

            instance.get('/html', function (error, response) {
                var hello;

                expect(error).to.be.null;

                hello = response.body.$.hello();
                expect(hello).to.have.property('length', 1);
                expect(hello.message()).to.equal('Hello');
                done();
            });
        });

        it.skip('can specify jQuery plugins on the \'options\' object', function (done) {
            var plugins = [
                    function ($) {
                        $.hello = function () {
                            return $('div');
                        };
                    },
                    function ($) {
                        $.fn.message = function () {
                            return this.text();
                        };
                    }
                ];

            maja(app, { plugins: plugins })
                .get('/html', function (error, response) {
                     var hello;

                    expect(error).to.be.null;

                    hello = response.body.$.hello();
                    expect(hello).to.have.property('length', 1);
                    expect(hello.message()).to.equal('Hello');
                    done();
                });
        });

        it('will report errors parsing a response payload', function (done) {
            maja(app).get('/error', function (error) {
                expect(error).to.be.an.instanceof(Error);
                expect(error).to.have.property('name', 'SyntaxError');
                done();
            });
        });

        it('can be configured to allow manual response parsing', function (done) {
            function checkBody (error, data) {
                expect(error).to.be.null;
                expect(data).to.deep.equal([ 'This is some plain text.' ]);
                done();
            }

            maja(app).get('/plain-text', { parseBody: false }, function (error, res, body) {
                    expect(error).to.be.null;
                    //expect(typeof body).to.equal('string');
                    res.setEncoding('utf-8');
                    captureData(res, checkBody);
                });
        });

        it('can perform a GET request with headers', function (done) {
            maja(app).get('/echo', { headers: { foo: 'bar' } }, function (error, response, body) {
                    expect(error).to.be.null;
                    expect(body).to.deep.equal({
                        content: '',
                        method: 'GET',
                        headers: { foo: 'bar' }
                    });
                    done();
                });
        });

        it('can perform a POST request', function (done) {
            maja(app).post('/echo', { body: 'hello' }, function (error, res, body) {
                expect(error).to.be.null;
                expect(body).to.deep.equal({
                    method  : 'POST',
                    headers : {},
                    content : 'hello'
                });
                done();
            });
        });

        it('can perform a POST request with headers', function (done) {
            var r = {
                uri: '/echo',
                headers: { foo: 'bar' },
                body: 'hello'
            };

            maja(app).post(r, function (error, res, body) {
                    expect(error).to.be.null;
                    expect(body).to.deep.equal({
                        method  : 'POST',
                        headers : { foo: 'bar' },
                        content : 'hello'
                    });
                    done();
                });

        });

        it('can perform a PUT request', function (done) {
            var r = {
                uri: '/echo',
                body: 'hello'
            };

            maja(app).put(r, function (error, res, body) {
                expect(error).to.be.null;
                expect(body).to.deep.equal({
                    method  : 'PUT',
                    headers : {},
                    content : 'hello'
                });
                done();
            });
        });

        it('can perform a PUT request with headers', function (done) {
            var r = {
                uri: '/echo',
                body: 'hello',
                headers: { foo: 'bar' }
            };

            maja(app).put(r, function (error, res, body) {
                expect(error).to.be.null;
                expect(body).to.deep.equal({
                    method  : 'PUT',
                    headers : { foo: 'bar' },
                    content : 'hello'
                });
                done();
            });
        });

        it('can perform a DELETE request', function (done) {
            maja(app).delete('/echo', { body: 'hello' }, function (error, res, body) {
                expect(error).to.be.null;
                expect(body).to.deep.equal({
                    method  : 'DELETE',
                    headers : {},
                    content : 'hello'
                });
                done();
            });
        });

        it('can perform a DELETE request with headers', function (done) {
            var r = {
                uri: '/echo',
                headers: { foo: 'bar' },
                body: 'hello'
            };

            maja(app).delete(r, function (error, res, body) {
                expect(error).to.be.null;
                expect(body).to.deep.equal({
                    method  : 'DELETE',
                    headers : { foo: 'bar' },
                    content : 'hello'
                });
                done();
            });
        });

        it('can POST objects via the JSON API', function (done) {
            var r = {
                json: true,
                body: { hello: 'world' },
                uri: '/echo'
            };

            maja(app).post(r, function (error, res, body) {
                expect(error).to.be.null;
                expect(body).to.deep.equal({
                    method  : 'POST',
                    headers : { 'content-type': 'application/json' },
                    content : '{"hello":"world"}'
                });
                done();
            });
        });

    });

    describe('can interact with an Express instance and', function () {

        var app = express();

        it('can capture a JSON response', function (done) {
            maja(app).get('/json', function (error, res, body) {
                expect(res).to.have.property('statusCode', 200);
                expect(body).to.deep.equal({ hello: 'world' });
                done();
            });
        });

        it('can POST a JSON payload', function (done) {
            var r = {
                body: JSON.stringify({ hello: 'world' }),
                uri: '/echo',
                headers: { 'content-type': 'application/json' }
            };

            maja(app).post(r, function (error, res, body) {
                    expect(res).to.have.property('statusCode', 200);
                    expect(body).to.deep.equal({ hello: 'world' });
                    done();
                }
            );
        });

        it('can POST to a nested handler', function (done) {
            var r = {
                uri: '/nested/echo',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({ hello: 'world' })
            };

            maja(app).post(r, function (error, res, body) {
                    expect(res).to.have.property('statusCode', 200);
                    expect(body).to.deep.equal({ hello: 'world' });
                    done();
                }
            );
        });

        it('can POST objects via the JSON API', function (done) {
            var r = {
                json: true,
                uri: '/echo',
                body: { hello: 'world' }
            };

            maja(app).post(r, function (error, res, body) {
                expect(error).to.be.null;
                expect(body).to.deep.equal({ hello: 'world' });
                done();
            });
        });

        it('can support the \'protocol\' getter', function (done) {
            maja(app).get('/request/protocol', function (error, res, body) {
                expect(error).to.be.null;
                expect(body).to.equal('http');
                done();
            });
        });

    });

});
