export namespace config{
    export class database{
        static options: object = {
            'url_read': 'mongodb://readerino:cisco@localhost:27017/users',
            'url_readWrite': 'mongodb://signup:cisco@localhost:27017/users'
        }
    }
}