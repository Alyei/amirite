/**
 * The various configurations.
 * @namespace
 */
export namespace config {
  /**
   * Database configuration
   * @class
   */
  export class database {
    /**
     * Configuration object.
     * @static
     */
    static options: object = {
      url_read: "mongodb://readerino:cisco@localhost:27017/users",
      url_readWrite: "mongodb://signup:cisco@localhost:27017/users"
    };
  }
}
