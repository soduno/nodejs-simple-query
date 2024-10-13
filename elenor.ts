import Db from "./db";

export default class Elenor<T> extends Db {
  protected collection: string = "";
  protected queryBuilder: string[] = [];
  protected singularCollection: boolean = false;

  constructor(collection: string) {
    super();
    this.collection = collection;
  }

  public find(): this {
    this.prepareCollectionQuery();
    return this;
  }

  public findFirst(): this {
    this.prepareCollectionQuery();
    this.singularCollection = true;
    return this;
  }

  public pluck(conditions: string[]): this {
    if (conditions.length < 1) {
      throw new Error("Conditions array must have at least one element.");
    }

    this.queryBuilder[1] = conditions.join(", ");
    return this;
  }

  public update(data: object, unique: any[]): this {
    this.queryBuilder.push("UPDATE");
    this.queryBuilder.push(this.collection);
    this.queryBuilder.push("SET");

    const keys = Object.keys(data);
    const values = Object.values(data).map(value => {
      if (typeof value === 'string') {
        return `'${value}'`;
      }
      return value;
    });

    keys.forEach((key, index) => {
      this.queryBuilder.push(`${key}=${values[index]}`);
      if (index < keys.length - 1) {
        this.queryBuilder.push(",");
      }
    });

    this.addConditions(unique, 'WHERE');

    return this;
  }

  public create(data: object) {
    this.queryBuilder.push("INSERT INTO");
    this.queryBuilder.push(this.collection);

    const keys = Object.keys(data);
    const values = Object.values(data).map(value => {
      if (typeof value === 'string') {
        return `'${value}'`;
      }
      return value;
    });

    keys.push("created_at");
    values.push(`'${new Date().toISOString()}'`);

    this.queryBuilder.push("(" + keys.join(", ") + ")");
    this.queryBuilder.push("VALUES");
    this.queryBuilder.push("(" + values.join(", ") + ")");

    return this;
  }

  public async createOrUpdate(data: object) {
    return this;
  }

  public where(conditions: any[]): this {
    this.addConditions(conditions, 'WHERE');
    return this;
  }

  public and(conditions: [string, string, any]): this {
    this.addConditions(conditions, 'AND');
    return this;
  }


  private addConditions(conditions: any[], action: string): void {
    if (conditions.length !== 2 && conditions.length !== 3) {
      throw new Error("Conditions array must have exactly two or three elements.");
    }

    const operator = conditions.length === 3 ? conditions[1] : "=";
    const value = conditions.length === 3 ? conditions[2] : conditions[1];

    this.queryBuilder.push(action, conditions[0], operator, value);
  }

  private prepareCollectionQuery(): void {
    this.queryBuilder.push("SELECT");
    this.queryBuilder.push("*");
    this.queryBuilder.push("FROM");
    this.queryBuilder.push(this.collection);
  }

  public async resolve(): Promise<any> {
    try {
      const query = this.queryBuilder.join(" ");
      const response = this.executeQuery(query);

      if (this.singularCollection) {
        return (await response)[0];
      }

      return await response;
    } catch (error: any) {
      console.log(error.stack)
      return error.message
    }
  }
}
