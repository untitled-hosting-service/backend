import Datastore from "./datastore";
import words from "random-words";
import { Server, ServerStatus, User } from "@mira-hq/model/dist/index";
import { v4 as uuid } from "uuid";

export default class InMemoryDatastore implements Datastore {
  getServers(): Promise<Server[]> {
    return new Promise((resolve, reject) => {
      resolve(
        Array(100)
          .fill(undefined)
          .map(() => {
            return this.generateRandomServer();
          })
      );
    });
  }

  getUsers() {
    return [];
  }

  private generateRandomServer(): Server {
    return {
      uuid: uuid(),
      serverName: words(),
      status: this.randomEnum(ServerStatus) || ServerStatus.Running,
      playersOnline: this.getRandomInt(0, 10),
      maxUptime: this.getRandomInt(0, 10000),
      uptime: this.getRandomInt(0, 10000),
      address: `${words()}.mira-hq.com`,
      owner: this.generateRandomUser(),
    };
  }

  private generateRandomUser(): User {
    return {
      uuid: uuid(),
      email: `${words()}@gmail.com`,
    };
  }

  // Generating random whole numbers in JavaScript in a specific range?
  // https://stackoverflow.com/questions/1527803/generating-random-whole-numbers-in-javascript-in-a-specific-range
  private getRandomInt(min: number, max: number) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  // How to get a random enum in TypeScript?
  // https://stackoverflow.com/questions/44230998/how-to-get-a-random-enum-in-typescript
  private randomEnum<T>(anEnum: T): T[keyof T] {
    const enumValues = (Object.keys(anEnum)
      .map((n) => Number.parseInt(n))
      .filter((n) => !Number.isNaN(n)) as unknown) as T[keyof T][];
    const randomIndex = Math.floor(Math.random() * enumValues.length);
    return enumValues[randomIndex];
  }

  putServer(server: Server): void {
    // noop
  }
}
