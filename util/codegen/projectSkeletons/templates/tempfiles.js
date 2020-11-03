const envConfig = require('../../../../config/config.js');
let logger = global.logger;

function gitIgnore() {
	return `
# IDE files
.idea

# Logs
logs
*.log

# Runtime data
pids
*.pid
*.seed

# Directory for instrumented libs generated by jscoverage/JSCover
lib-cov

# Coverage directory used by tools like istanbul
coverage

# Grunt intermediate storage (http://gruntjs.com/creating-plugins#storing-task-files)
.grunt

# Compiled binary addons (http://nodejs.org/api/addons.html)
build/Release

# Dependency directory
# Commenting this out is preferred by some people, see
# https://www.npmjs.org/doc/misc/npm-faq.html#should-i-check-my-node_modules-folder-into-git
node_modules

# Users Environment Variables
.lock-wscript

# Runtime configuration for swagger app
config/runtime.yaml
`;
}

function esLint() {
	return `
env:
  es6: true
  node: true
extends: 'eslint:recommended'
rules:
  indent:
    - error
    - 4
  linebreak-style:
    - error
    - unix
  quotes:
    - error
    - double
  semi:
    - error
    - always
`;
}

function config() {
	return `
# swagger configuration file

# values in the swagger hash are system configuration for swagger-node
swagger:

  fittingsDirs: [ api/fittings ]
  defaultPipe: null
  swaggerControllerPipe: swagger_controllers  # defines the standard processing pipe for controllers

  # values defined in the bagpipes key are the bagpipes pipes and fittings definitions
  # (see https://github.com/apigee-127/bagpipes)
  bagpipes:

    _router:
      name: swagger_router
      mockMode: false
      mockControllersDirs: [ api/mocks ]
      controllersDirs: [ api/controllers ]

    _swagger_validate:
      name: swagger_validator
      validateResponse: false

    # pipe for all swagger-node controllers
    swagger_controllers:
      - onError: json_error_handler
      - cors
      - swagger_security
      - _swagger_validate
      - express_compatibility
      - _router

    # pipe to serve swagger (endpoint is in swagger.yaml)
    swagger_raw:
      name: swagger_raw

# any other values in this file are just loaded into the config for application access...
`;
}

function packageJson(config) {
	return `{
    "name": "${config.projectName}",
    "version": "3.9.1",
    "description": "",
    "main": "app.js",
    "scripts": {
    "start": "node app.js",
        "test": "swagger project test"
    },
    "keywords": [],
    "author": "codeGenerator",
    "license": "ISC",
    "dependencies": {
        "@appveen/odp-utils": "1.5.6",
        "@appveen/swagger-mongoose-crud": "~1.1.4",
        "@appveen/utils": "1.1.6",
        "archiver": "^5.0.0",
        "bluebird": "^3.5.0",
        "crypto": "^1.0.1",
        "csv-headers": "^1.0.0",
        "dateformat": "^3.0.3",
        "express": "^4.15.2",
        "express-fileupload": "^0.4.0",
        "jsonexport": "^2.3.0",
        "js-yaml": "^3.13.1",
        "node-zip": "^1.1.1",
        "lodash": "^4.17.4",
        "nats": "^1.0.1",
        "line-reader": "^0.4.0",
        "log4js": "^1.1.1",
	    "mongodb": "^3.0.4",
        "mongoose": "5.4.17",
        "mongoose-unique-validator": "^2.0.3",
        "node-cron": "^1.2.1",
        "path": "^0.12.7",
        "request": "^2.83.0",
        "streamifier": "^0.1.1",
        "stomp-client": "^0.9.0",
        "swagger-tools": "^0.10.4",
        "swagger-parser": "^4.0.2",
        "uuid": "^3.2.1",
        "xlsx": "^0.12.2"
    }
}
`;
}

/*function queueManagement() {
	return `
const amqp = require("amqplib/callback_api");
const Stomp = require("stomp-client");
const config = require('./config');
const logger = global.logger;
let channel = null;

var e = {};
var client = new Stomp(config.activeMqConfig);
logger.info("AMQ connection details");
logger.info(config.activeMqConfig);
client.connect(function (sessionId) {
    logger.info("ActiveMq connected successfully");
});
client.on("error", err => {
    logger.error(err.message);
})

client.on("reconnecting", () => {
    logger.info("Trying to reconnect ActiveMQ");
})

client.on("reconnect", () => {
    logger.info("ActiveMQ reconnected successfully");
})

e.sendToQueue = function (obj) {
    let q = config.queueName;
    client.publish(q, JSON.stringify(obj, null, 4));
};

module.exports = e;  
  `;
}*/

function queueManagement(config) {
	return `

 const config = require('./config');
 var sendToQueue = function (obj) {
     let q = config.queueName;
     client.publish(q, JSON.stringify(obj, null, 4));
 };
var clients = require('@appveen/odp-utils').natsStreaming;
var clientId = isK8sEnv() ? process.env.HOSTNAME : '${config.app}-${config.collectionName}';
var client = clients.init('odp-cluster',clientId,config.NATSConfig);

function isK8sEnv() {
	return process.env.KUBERNETES_SERVICE_HOST && process.env.KUBERNETES_SERVICE_PORT && process.env.ODPENV == 'K8s';
}
module.exports = {
    client: client,
    sendToQueue: sendToQueue
}

  `;
}

function webHookConfig() {
	return `var e = {};
    let URL = require('url');

    function mongoLogUrl() {
	    let mongoUrl = process.env.MONGO_LOGS_URL || 'mongodb://localhost';
	    return mongoUrl;
    }
  e.mongoLogUrl = mongoLogUrl();
  e.queueName = "webHooks";
  e.googleKey = process.env.GOOGLE_API_KEY || "";
  e.baseUrlNE = process.env.BASE_URL_NE || "http://localhost:10010"
  e.baseUrlSM = process.env.BASE_URL_SM || "http://localhost:10003"
  e.baseUrlUSR = process.env.BASE_URL_USER || "http://localhost:10004/rbac"
  e.baseUrlWF = process.env.BASE_URL_WF || "http://localhost:10006/workflow"
  e.NATSConfig = {
    url: process.env.NATS_HOST || "nats://127.0.0.1:4222",
    user: process.env.NATS_USER || "",
    pass: process.env.NATS_PASS || "",
    maxReconnectAttempts: process.env.NATS_RECONN_ATTEMPTS || 500,
    reconnectTimeWait: process.env.NATS_RECONN_TIMEWAIT || 500
}
   e.mongoOptions = {
    reconnectTries: process.env.MONGO_RECONN_TRIES,
    reconnectInterval: process.env.MONGO_RECONN_TIME,
    useNewUrlParser: true
   }
   e.allowedExt = '${envConfig.allowedExt}'.split(',');
  module.exports = e;`;
}

function logsController(config) {
	return `"use strict";
    
    const mongoose = require("mongoose");
    const definition = require("../helpers/logs.definition.js").definition;
    const SMCrud = require("@appveen/swagger-mongoose-crud");
    const schema = new mongoose.Schema(definition);
    const logger = global.logger;
    
    var options = {
        logger: logger,
        collectionName: "logs",
        defaultFilter: {'name': process.env.SERVICE_ID || '${config._id}'} 
    };
    
    var crudder = new SMCrud(schema, "logs", options);
    
    module.exports = {
        index: crudder.index,
        count: crudder.count
    };`;
}

function preHooksController() {
	return `"use strict";
    const request = require("request");
    // const mongoose = require("mongoose");
    // const definition = require("../helpers/preHooks.definition.js").definition;
    // const schema = new mongoose.Schema(definition);
    const logger = global.logger;
    
    // mongoose.model("preHooks", schema, "preHooks");

    function sendRequest(data, url){
        let timeout = (process.env.HOOK_CONNECTION_TIMEOUT && parseInt(process.env.HOOK_CONNECTION_TIMEOUT)) || 30;
        var options = {
            url: url,
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            json: true,
            body: data,
            timeout: timeout * 1000
        };
        if (typeof process.env.TLS_REJECT_UNAUTHORIZED === 'string' && process.env.TLS_REJECT_UNAUTHORIZED.toLowerCase() === 'false') {
            options.insecure = true;
            options.rejectUnauthorized = false;
        }
        return new Promise((resolve, reject)=>{
            request.post(options, function (err, res, body) {
                if (err) {
                    logger.error(err.message);
                    reject(err);
                } else if (!res) {
                    logger.error(url+ " Hook Service DOWN");
                    reject(new Error(url+ " Hook Service DOWN"))
                }
                else {
                    if(res.statusCode >=200 && res.statusCode<300)
                    resolve(body);
                }
            });
        })
    }
    let e = {};
    e.triggerHook = (req, res)=>{
        let url = req.swagger.params.url.value;
        sendRequest(req.body, url)
            .then(data=>{
                res.send(data)
            })
            .catch(err=>{
                res.status(500).json({message: err.message})
            });
    }

    module.exports = e;
    `;
}

function webHookStatusController(config) {
	return `"use strict";
    const logger = global.logger;
    // const envConfig = require('../../config');
    let request = require("request");
    function getWebHookStatus(req, api){
        if(!req.query.filter) req.query.filter = {};
        if(typeof req.query.filter === "string") req.query.filter = JSON.parse(req.query.filter);
        req.query.filter["data.serviceId"] = process.env.SERVICE_ID || '${config._id}'
        req.query.filter = JSON.stringify(req.query.filter);
        var options = {
            url: "${envConfig.baseUrlNE}" + api,
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "TxnId": req.get("txnId"),
                "Authorization": req.get("Authorization")
            },
            qs: req.query
        };
        return new Promise((resolve, reject) => {
            request.get(options, function (err, res, body) {
                if (err) {
                    logger.error(err.message);
                    reject(err);
                } else if (!res) {
                    logger.error("Notification Engine DOWN");
                    reject(new Error("Notification Engine DOWN"))
                }
                else {
                    if(res.statusCode >= 200 && res.statusCode < 400){
                        resolve(JSON.parse(body));
                    }else{
                        reject(new Error(body));
                    }
                }
            });    
        });
    }
    let e = {};
    e.index = (req, res)=>{
        getWebHookStatus(req, "/webHookStatus")
        .then(body=>{
            res.json(body);
        })
        .catch(err=>{
            res.status(500).json({"message": err.message});
        })
    }

    e.count = (req, res)=>{
        getWebHookStatus(req, "/webHookStatus/count")
        .then(body=>{
            res.json(body);
        })
        .catch(err=>{
            res.status(500).json({"message": err.message});
        })
    }

    module.exports = e;
    `;
}

function auditController(config) {
	return `"use strict";
    
    const mongoose = require("mongoose");
    const definition = require("../helpers/auditLogs.definition.js").definition;
    const SMCrud = require("@appveen/swagger-mongoose-crud");
    const schema = new mongoose.Schema(definition);
    const logger = global.logger;
    
    var options = {
        logger: logger,
        collectionName: "${config.collectionName}.audit"
    };
    
    var crudder = new SMCrud(schema, "${config.collectionName}.audit", options);
    
    module.exports = {
        index: crudder.index,
        count: crudder.count
    };`;
}

function preHooksDefinition() {
	return `
    var definition = {
        "service": {
            "type": "String"
        },
        "docId": {
            "type": "String"
        },
        "timestamp":{
            "type": "Date"
        },
        "url": {
            "type": "String"
        },
        "name": {
            "type": "String"
        },
        "data": {
            "type": {
                "old":{
                    "type":"String"
                },
                "new":{
                    "type":"String"
                }
            }
        },
        "comment" :{
            "type": "String"
        },
        "status":{
            "type":"String",
            "enum":["Pending","Completed","Error"]
        },
        "operation":{
            "type": "String"
        },
        "txnId":{
            "type": "String"
        },
        "_metadata":{
            "type": {
                "deleted":{
                    "type":"Boolean",
                    "default": false
                },
                "createdAt":{
                    "type":"Date"
                },
                "lastUpdated":{
                    "type":"Date"
                }
            }
        }
    };
    module.exports.definition = definition;`;
}

function logsDefinition() {
	return `const mongoose = require('mongoose');
    var definition = {
        "name": {
            "type": "String"
        },
        "timestamp":{
            "type": "Date"
        },
        "url": {
            "type": "String"
        },
        "method": {
            "type": "String"
        },
        "resStatusCode": {
            "type": "Number"
        },
        "source": {
            "type": "String"
        },
        "completionTime": {
            "type": "Number"
        }
    };
    module.exports.definition = definition;`;
}

function bulkCreateDefinition() {
	return `
    var definition = {
        'fileId': {
            'type': 'String',
            'required': true,
        },
        '_metadata': {
            'type': {
                'version': {
                    'release': {
                        'type': 'Number'
                    }
                }
            },
            'createdAt': {
                'type': 'Date'
            },
            'lastUpdated': {
                'type': 'Date'
            },
            'deleted': {
                'type': 'Boolean'
            }
        },
        'fileName': {
            'type': 'String'
        },
        'sNo': {
            'type': 'Number'
        },
        'data': {
            'type': 'Object'
        },
        'conflict': {
            'type': 'Boolean',
            'default' : false
        },
        'errorMessage': {
            'type': 'String'
        },
        'status': {
            'type': 'String',
            'enum': ['Pending', 'Validated', 'Created', 'Duplicate', 'Error', 'Ignored', 'Updated']
        }
    };
    module.exports.definition = definition;`;
}

function exportDefinition(){
	return `  var definition = {
        'user': {
            'type': 'String',
        },
        "_id": {
            "type": "String"
        },
        '_metadata': {
            'createdAt': {
                'type': 'Date'
            },
            'lastUpdated': {
                'type': 'Date'
            },
            'deleted': {
                'type': 'Boolean'
            }
        },
        'status': {
            'type': 'String',
        },  
        'fileName': {
            'type': 'String',
        },
        'headers': {
            'type': 'Object',
        },
        createdCount: {
            'type': 'Number',
        },
        updatedCount: {
            'type': 'Number',
        },
        errorCount:{
            'type': 'Number'
        },
        'type':{
            'type': 'String',
        }
    };
    module.exports.definition = definition;`;
}
function auditLogsDefinition(config) {
	let expiryCode = config.versionValidity && config.versionValidity.validityType == 'time' ? `,
    "expiry": {
        "type": "Date",
        "default": new Date(),
        "expires": "${config.versionValidity.validityValue}"
    }` : '';
	return `const mongoose = require('mongoose');
    var definition = {
        "name": {
            "type": "String"
        },
        "timeStamp":{
            "type": "Date"
        },
        "user": {
            "type": "String"
        },
        "txnId": {
            "type": "String"
        }${expiryCode}
    };
    module.exports.definition = definition;`;
}

function crudderHelper() {
	return `let _ = require("lodash");

    function IsString(val) {
        return val && val.constructor.name === 'String';
    };
    
    function CreateRegexp(str) {
        if (str.charAt(0) === '/' &&
            str.charAt(str.length - 1) === '/') {
            var text = str.substr(1, str.length - 2).replace(/[-[\\]{}()*+?.,\\\\^$|#\\s]/g, "\\\\$&");
            return new RegExp(text, 'i');
        } else {
            return str;
        }
    }
    function IsArray(arg) {
        return arg && arg.constructor.name === 'Array';
    }
    
    function IsObject(arg) {
        return arg && arg.constructor.name === 'Object';
    }
    
    function ResolveArray(arr) {
        for (var x = 0; x < arr.length; x++) {
            if (IsObject(arr[x])) {
                arr[x] = FilterParse(arr[x]);
            } else if (IsArray(arr[x])) {
                arr[x] = ResolveArray(arr[x]);
            } else if (IsString(arr[x])) {
                arr[x] = CreateRegexp(arr[x]);
            }
        }
        return arr;
    }
    
    function FilterParse(filterParsed) {
        for (var key in filterParsed) {
            if (IsString(filterParsed[key])) {
                filterParsed[key] = CreateRegexp(filterParsed[key]);
            } else if (IsArray(filterParsed[key])) {
                filterParsed[key] = ResolveArray(filterParsed[key]);
            } else if (IsObject(filterParsed[key])) {
                filterParsed[key] = FilterParse(filterParsed[key]);
            }
        }
        return filterParsed;
    }
    let e = {};
    e.index = function(req, model){
        let reqParams = Object.keys(req.swagger.params).reduce((prev, curr) => {
            prev[curr] = req.swagger.params[curr].value;
            return prev;
        }, {});
        var filter = reqParams['filter'] ? reqParams.filter : {};
        var sort = reqParams['sort'] ? {} : {
            '_metadata.lastUpdated': -1
        };
        reqParams['sort'] ? reqParams.sort.split(',').map(el => el.split('-').length > 1 ? sort[el.split('-')[1]] = -1 : sort[el.split('-')[0]] = 1) : null;
        var select = reqParams['select'] ? reqParams.select.split(',') : [];
        var page = reqParams['page'] ? reqParams.page : 1;
        var count = reqParams['count'] ? reqParams.count : 10;
        var search = reqParams['search'] ? reqParams.search : null;
        var skip = count * (page - 1);
        if (typeof filter === 'string') {
            try {
                filter = JSON.parse(filter);
                filter = FilterParse(filter);
            } catch (err) {
                logger.error('Failed to parse filter :' + err);
                filter = {};
            }
        }
        filter = _.assign({}, filter);
        filter['_metadata.deleted'] = false;
        if (search) {
            filter['$text'] = { '$search': search };
        }
        var query = model.find(filter);
        query.lean();
        if (select.length || select.length) {
            var union = select.concat(select);
            query.select(union.join(' '));
        }
        if (count == -1) query.sort(sort)
        else query.skip(skip).limit(count).sort(sort);
        let returnDocuments = [];
        return query.exec()
    }
    e.count = function(req, model){
        let reqParams = Object.keys(req.swagger.params).reduce((prev, curr) => {
            prev[curr] = req.swagger.params[curr].value;
            return prev;
        }, {});
        var filter = reqParams['filter'] ? reqParams.filter : {};
       
        if (typeof filter === 'string') {
            try {
                filter = JSON.parse(filter);
                filter = FilterParse(filter);
            } catch (err) {
                logger.error('Failed to parse filter :' + err);
                filter = {};
            }
        }
        filter = _.assign({}, filter);
        filter['_metadata.deleted'] = false;
        var query = model.find(filter).count();
        query.lean();
        let returnDocuments = [];
        return query.exec()
    }
    
    module.exports = e;`;
}

let dockerRegistryType = process.env.DOCKER_REGISTRY_TYPE ? process.env.DOCKER_REGISTRY_TYPE : '';
if (dockerRegistryType.length > 0) dockerRegistryType = dockerRegistryType.toUpperCase();

let dockerReg = process.env.DOCKER_REGISTRY_SERVER ? process.env.DOCKER_REGISTRY_SERVER : '';
if (dockerReg.length > 0 && !dockerReg.endsWith('/') && dockerRegistryType != 'ECR' ) dockerReg += '/';

function dockerFile(_port) {
	// let base = `${dockerReg}odp:base.${process.env.RELEASE}`;
	let base = `${dockerReg}odp:base.${process.env.IMAGE_TAG}`;
	if(dockerRegistryType == 'ECR') base = `${dockerReg}:odp.base.${process.env.IMAGE_TAG}`;
	logger.debug(`Base image :: ${base}`);
	return ` 
FROM ${base}
WORKDIR /app
COPY app.js /app/
COPY init.js /app/
COPY config.js /app/
COPY queueManagement.js /app/
COPY package.json /app/
COPY api /app/api
COPY config /app/config
EXPOSE ${_port}

CMD node app.js`;
}   

function initFile(config) {
	return `const request = require("request");
    const config = require("./config");
    const mongoose = require("mongoose");
    const _ = require("lodash");
    let cron = require('node-cron');
    let controller = require('./api/helpers/util');
    let fileFields = "${config.fileFields}".split(',');
    function init() {
        return controller.fixSecureText()
        .then(() => {
            logger.debug('Fixing secure text completed');
            return informSM();
        })
        .then(() => {
            startCronJob();
        })
    }

    function getFileNames(doc, field) {
        if(!doc) return [];
        let fArr = field.split('.');
        if (fArr.length === 1) {
            if (Array.isArray(doc[fArr])) {
                return doc[fArr].map(_d => _d.filename);
            } else if (doc[fArr] && typeof doc[fArr] === 'object') {
                return [doc[fArr]['filename']]
            }
        }
        let key = fArr.shift();
        if (doc && doc[key]) {
            if (Array.isArray(doc[key])) {
                let arr = doc[key].map(_d => {
                    return getFileNames(_d, fArr.join('.'));
                });
                return [].concat.apply([], arr);
            }
            else if (doc[key] && typeof doc[key] === 'object') {
                return getFileNames(doc[key], fArr.join('.'))
            }
        }
    }

    function startCronJob() {
        var batch = 1000;
        cron.schedule("15 2 * * *", function () {
            logger.info("Cron triggered to clear unused file attachment")
            var datefilter = new Date(new Date().getTime() - 24 * 60 * 60 * 1000);
            return mongoose.connection.db.collection('${config.collectionName}.files').count({ "uploadDate": { "$lte": datefilter } }, { filename: 1 })
                .then(_c => {
                    let arr = [];
                    let totalBatchCount = _c / batch;
                    for (let i = 0; i < totalBatchCount; i++) {
                        arr.push(i);
                    }
                    return arr.reduce((_p, curr, i) => {
                        return _p
                            .then(() => {
                                return mongoose.connection.db.collection('${config.collectionName}.files').find({ "uploadDate": { "$lte": datefilter } }, { filename: 1 }).limit(batch).skip(i * batch).toArray()
                                    .then((docs) => {
                                        let allFilename = docs.map(_d => _d.filename);
                                        let fileInUse = [];
                                        mongoose.model("${config.collectionName}").find({}, fileFields.join(" "))
                                            .then((docs) => {
                                                docs.forEach(_d => {
                                                    fileFields.forEach(_k => {
                                                        fileInUse = fileInUse.concat(getFileNames(_d, _k));
                                                    })
                                                })
                                            })
                                            .then(() => global.mongoDBLogs.collection("${config.collectionName}.audit").find({ 'data.old': { $exists: true } }, 'data').toArray())
                                            .then(docs => {
                                                docs.forEach(_d => {
                                                    if (_d.data && _d.data.old) {
                                                        fileFields.forEach(_k => {
                                                            fileInUse = fileInUse.concat(getFileNames(_d.data.old, _k));
                                                        })
                                                    }
                                                })
                                                fileInUse = fileInUse.filter(_f => _f);
                                                logger.info({ fileInUse });
                                                let filesToBeDeleted = _.difference(allFilename, fileInUse);
                                                logger.info({ filesToBeDeleted });
                                                let promise = filesToBeDeleted.map(_f => deleteFileFromDB(_f));
                                                return Promise.all(promise);
                                            })
                                    })
                            })
                    }, Promise.resolve())
                })
                .catch(err => {
                    logger.error(err);
                })
        })
    }
    
    function deleteFileFromDB(filename) {
        let gfsBucket = global.gfsBucket;
        return new Promise((resolve, reject) => {
            gfsBucket.find({
                filename: filename
            }).toArray(function (err, result) {
                if (err) {
                    logger.error(err);
                    reject(err);
                } else {
                    gfsBucket.delete(result[0]._id, function(err){
                        if(err){
                            logger.error(err);
                            return reject(err);
                        }else{
                            logger.info("Removed file " + filename);
                            resolve(filename);
                        }
                    })
                }
            });
        })
    }
    
    function informSM() {
        logger.info("inform Sm triggered ");
        var options = {
            url: "${envConfig.baseUrlSM}/service/" + (process.env.SERVICE_ID || '${config._id}') + "/statusChange",
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            qs: {
                status: "Active"
            },
            json: true
        };
        return new Promise((resolve, reject) => {
            request.put(options, function (err, res, body) {
                if (err) {
                    logger.error("Error requesting service-manager")
                    logger.error(err.message);
                    reject(err);
                } else if (!res) {
                    logger.error("brahma-service-manager service down");
                    reject(new Error("brahma-service-manager service down"));
                } else {
                    if (res.statusCode === 200) {
                        let maintenanceInfo = null;
                        if (body.status == 'Maintenance') {
                            global.status = 'Maintenance';
                            if (body.maintenanceInfo) {
                                maintenanceInfo = JSON.parse(body.maintenanceInfo);
                                let type = maintenanceInfo.type;
                                if (type == 'purge') return controller.bulkDelete(body.relatedService);
                            }
                        }
                        if(body.outgoingAPIs){
                            logger.debug({outgoingAPIs:body.outgoingAPIs});
                            global.outgoingAPIs = body.outgoingAPIs;
                        }
                        resolve(body);
                    } else {
                        reject(new Error("Service not found"));
                    }
                }
            });
        });
    }
    module.exports = init;`;
}

module.exports = {
	gitIgnore: gitIgnore,
	esLint: esLint,
	config: config,
	packageJson: packageJson,
	webHookConfig: webHookConfig,
	queueManagement: queueManagement,
	crudderHelper: crudderHelper,
	// helperUtil: helperUtil,
	logsController: logsController,
	logsDefinition: logsDefinition,
	bulkCreateDefinition : bulkCreateDefinition,
	exportDefinition : exportDefinition,
	preHooksController: preHooksController,
	preHooksDefinition: preHooksDefinition,
	auditLogsDefinition: auditLogsDefinition,
	auditController: auditController,
	webHookStatusController: webHookStatusController,
	dockerFile: dockerFile,
	initFile: initFile
};
