import postgres from 'postgres';

export default class Db {
  private sql: ReturnType<typeof postgres>;

  constructor() {
    this.sql = this.connector();
  }

  protected async executeQuery(query: string) {
    try {
      return await this.sql.unsafe(query); //implement in future, something to prevent sql injections...
    } catch (error: any) {
      throw error;
    }
  }

  private connector() {
    return postgres({//probably a good idea to use env
      host: 'localhost',
      port: 5432,
      database: 'db',
      username: 'myuser',
      password: 'mypassword',
      ssl: false,
      max: 10,
      idle_timeout: 30000,
      connect_timeout: 2000,
      onnotice: (notice) => console.warn(notice),
      onclose: (error) => console.log('Connection closed', error),
      fetch_types: true,
      debug: (connection, query, params) => {
        console.log(`Query: ${query}, Params: ${params}`);
      },
      prepare: true,
    });
  }
}
