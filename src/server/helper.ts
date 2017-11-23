import * as scrypt from 'scrypt';

export namespace Helper{
    export static class Hash{
        public static getHash(password: string, userObject: any, db: any, paramsObject: scrypt.paramsObject): void{
            scrypt.kdf(password, this.paramsObject, (err: any, hash: any) => {
                userObject.password = password;
                db.save(userObject);
            })
        }
    }
}