import { ApolloServer as ApolloLambdaServer } from "apollo-server-lambda";
import { ApolloServer } from "apollo-server";
import Datastore from "./datastore/datastore";
import DynamoDbDatastore from "./datastore/dynamodb-datastore";
import InMemoryDatastore from "./datastore/in-memory-datastore";
import { Server, typeDefs } from "@mira-hq/model/dist/index";
import { v4 as uuid } from "uuid";

const isProduction = true;
const isPreProduction = !isProduction;
let datastore: Datastore;

if (isProduction) {
  datastore = new InMemoryDatastore();
} else {
  datastore = new DynamoDbDatastore();
}

const newServer = {
  uuid: uuid(),
} as Server;

datastore.putServer(newServer);

const resolvers = {
  Query: {
    servers: () => datastore.getServers(),
  },
};

const server = new ApolloLambdaServer({ typeDefs: typeDefs, resolvers });
export const graphqlHandler = server.createHandler();

if (isPreProduction) {
  const developmentServer = new ApolloServer({ typeDefs: typeDefs, resolvers });

  void developmentServer.listen().then(({ url }) => {
    console.log(`🚀  Server ready at ${url}`);
  });
}
