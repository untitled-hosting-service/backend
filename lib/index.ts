import { v4 as uuidv4 } from "uuid";
import { ApolloServer } from "apollo-server";
import words from "random-words";

const servers: Server[] = Array(100).fill(undefined).map(() => {
  return generateRandomServer();
})

function generateRandomServer(): Server {
  return {
    uuid: uuidv4(),
    serverName: words(),
    status: randomEnum(ServerStatus) || ServerStatus.RUNNING,
    playersOnline: getRandomInt(0, 10),
    maxUptime: getRandomInt(0, 10000),
    uptime: getRandomInt(0, 10000),
    address: `${words()}.mira-hq.com`
  }
}

// Generating random whole numbers in JavaScript in a specific range?
// https://stackoverflow.com/questions/1527803/generating-random-whole-numbers-in-javascript-in-a-specific-range
function getRandomInt(min: number, max: number) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// How to get a random enum in TypeScript?
// https://stackoverflow.com/questions/44230998/how-to-get-a-random-enum-in-typescript
function randomEnum<T>(anEnum: T): T[keyof T] {
  const enumValues = Object.keys(anEnum)
    .map(n => Number.parseInt(n))
    .filter(n => !Number.isNaN(n)) as unknown as T[keyof T][]
  const randomIndex = Math.floor(Math.random() * enumValues.length)
  return enumValues[randomIndex];
}

const resolvers = {
  Query: {
    servers: () => servers,
  },
};

const server = new ApolloServer({ typeDefs: SCHEMA, resolvers });

// The `listen` method launches a web server.
server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});