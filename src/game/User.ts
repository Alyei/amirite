export class User {
  constructor(
    private username: string,
    private icon:  number
  ) { }

  public get Username(): string {
      return this.username;
  }
  /*set Username(value: string) {
      this.username = value;
  }*/
 public  get Icon(): number {
      return this.icon;
  }

  // toJSON is automatically used by JSON.stringify
  toJSON(): UserJSON {
    // copy all fields from 'this' to an empty object and return in
    return Object.assign({}, this, {
      // convert fields that need converting
      
    });
  }

  // fromJSON is used to convert an serialized version
  // of the User to an instance of the class
  static fromJSON(json: UserJSON|string): User {
    if (typeof json === 'string') {
      // if it's a string, parse it first
      return JSON.parse(json, User.reviver);
    } else {
      // create an instance of the User class
      let user = Object.create(User.prototype);
      // copy all the fields from the json object
      return Object.assign(user, json, {
        // convert fields that need converting
        
      });
    }
  }
  
  // reviver can be passed as the second parameter to JSON.parse
  // to automatically call User.fromJSON on the resulting value.
  static reviver(key: string, value: any): any {
    return key === "" ? User.fromJSON(value) : value;
  }
}
//deschd
// interface for JSON
export interface UserJSON {
  username: string;
  icon:  number;
}