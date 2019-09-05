# Redis para Cache
Projeto utilizado para instalar o Redis como um serviço.

## Utilizando Redis com Node

O arquivo cache-redis foi implementado para realizar conexão com o serviço Redis. Essa implementação pode servir de base para uso em qualquer projeto Node. Segue abaixo um exemplo de como usar.

```
const cache = require('./cache-redis')

await cache.connectRedis('conectavoos.com', {
    host: '172.25.0.23',
    port: 6379
})

let detailInfo = {
    id: 1,
    name: 'Carlos Eduardo Aguirre',
    idade: 34,
    site: 'https://www.conectavoos.com/'
}

console.log(await cache.addCache(detailInfo.id, detailInfo))

console.log(await cache.getCache(detailInfo.id))

cache.delCache()
```

Caso queira desabilitar o cache em runtime, basta adicionar a seguinte variavel no env do NodeJs.

 - REDIS_CACHE_ENABLED=false

## Instalando dependência

O arquivo cache-redis depende da biblioteca Redis.

npm install redis --save

## Executando serviço e caso de teste

- docker-compose up -d
- npm start
