const redis = require('redis');

let redisClient = null
let isRedisConnected = false

let IS_CACHE_ENABLED = true
let REDIS_NS_CACHE = null

const REDIS_INITIALIZE_ERROR = {
    code: 001,
    message: 'Start o RedisClient com connectRedis()'
}

const REDIS_CONNECTION_LOSE_ERROR = {
    code: 002,
    message: 'Conexão perdida. Tente novamente em alguns minutos.'
}

const connectRedis = (namespace, config = null) => {
    return new Promise((resolve) => {
        let host = process.env.REDIS_HOST || 'redis'
        let port = process.env.REDIS_PORT || 6379

        if (config) {
            host = config.host
            port = config.port
        }

        if (process.env.REDIS_CACHE_ENABLED) {
            IS_CACHE_ENABLED = process.env.REDIS_CACHE_ENABLED === 'true'
        }

        REDIS_NS_CACHE = namespace + '_cache_'
        redisClient = redis.createClient(port, host, config);

        redisClient.on('connect', () => {
            console.log(`Conexão com o Redis realizado com sucesso em ${host} na porta ${port}`)
            isRedisConnected = true
            resolve();
        });

        redisClient.on('end', () => {
            isRedisConnected = false
            console.log(`Conexão com o Redis encerrada em ${host} na porta ${port}`)
        });

        redisClient.on('error', (err) => {
            if (err && err.code == 'ECONNREFUSED') {
                isRedisConnected = false
                console.log(`Aguardando conexão com o Redis em ${err.address} na porta ${err.port}`)
            } else {
                console.log('Error:Redis', err)
            }
        });
    });
}

const getCache = (keyName) => {
    return new Promise((resolve, reject) => {
        if (!IS_CACHE_ENABLED) {
            return resolve(null)
        }

        if (redisClient == null) {
            return reject(REDIS_INITIALIZE_ERROR)
        }

        try {
            if (!isRedisConnected) {
                return resolve(null)
            }
            
            redisClient.get(REDIS_NS_CACHE + keyName, (err, data) => {
                if (err) {
                    return reject(err)
                }
                return resolve(JSON.parse(data))
            })
        } catch (error) {
            return reject(error)
        }
    })
}

/*
 * timeSeconds = 43200 (Default: Mantem no cache por 12 horas)
 */
const addCache = (keyName, value, timeSeconds = 43200) => {
    return new Promise((resolve, reject) => {
        if (!IS_CACHE_ENABLED) {
            return resolve(value)
        }

        if (redisClient == null) {
            return reject(REDIS_INITIALIZE_ERROR)
        }
        
        try {
            if (value && isRedisConnected) {
                redisClient.setex(REDIS_NS_CACHE + keyName, timeSeconds, JSON.stringify(value))
            }
            resolve(value)
        } catch (error) {
            reject(error)
        }
    })
}

const delCache = () => {
    return new Promise((resolve, reject) => {
        if (redisClient == null) {
            return reject(REDIS_INITIALIZE_ERROR)
        }

        if (!isRedisConnected) {
            return reject(REDIS_CONNECTION_LOSE_ERROR)
        }

        redisClient.keys(REDIS_NS_CACHE + '*', function(err, rows) {
            if (err) {
                return reject(err)
            }

            if (rows && isRedisConnected) {
                for(let i = 0; i < rows.length; i++) {
                    try {
                        redisClient.del(rows[i])
                    } catch (ex) { }
                }
            }

            return resolve()
        });
    })
}

module.exports = {
    connectRedis,
    addCache,
    getCache,
    delCache
}