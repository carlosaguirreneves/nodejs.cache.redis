const cache = require('./cache-redis')

const main = async () => {
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

    console.log('Adicionado', await cache.addCache(detailInfo.id, detailInfo))
    console.log(`Obtido [id=${detailInfo.id}]`, await cache.getCache(detailInfo.id))

    console.log(`:::Esvaziando cache usando await...`)
    await cache.delCache()

    console.log(`Não encontrado [id=${detailInfo.id}]`, await cache.getCache(detailInfo.id))

    let count = 10000
    console.log(`Obtido_1 [id=${count}]`, await cache.getCache(count))

    console.log(':::Adicionando no cache...')
    for (let i = 0; i <= count; i++) {
        detailInfo.id = i
        await cache.addCache(i, detailInfo)
    }
    console.log(':::Cache adicionado com sucesso')

    console.log(`Obtido_2 [id=${count}]`, await cache.getCache(count))

    console.log(':::Esvaziando cache sem o uso do await...')
    cache.delCache()
    console.log(':::Cache vazio')

    setTimeout(async () => {
        console.log(`Obtido_3 [id=${count}]`, await cache.getCache(count))
        process.exit(0)
    }, 500)
}

main()

process.on('exit', () => {
    console.log('')
    console.log('Fim.')
})