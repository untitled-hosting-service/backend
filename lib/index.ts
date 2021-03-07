import { ApolloServer as ApolloLambdaServer } from "apollo-server-lambda";
import { ApolloServer } from "apollo-server";
import DynamoDbDatastore from "./datastore/dynamodb-datastore";
import {
  Server,
  typeDefs,
  MutationCreateServerArgs,
  ServerStatus,
} from "@mira-hq/model";
import { v4 as uuid } from "uuid";

const isProduction = true;
const isPreProduction = !isProduction;
const datastore = new DynamoDbDatastore();

const resolvers = {
  Query: {
    servers: () => datastore.getServers(),
  },
  Mutation: {
    createServer: (
      first: unknown,
      second: MutationCreateServerArgs,
      third: unknown
    ): Server => {
      const server: Server = {
        uuid: uuid(),
        serverName: second.serverName || "",
        status: ServerStatus.Created,
        owner: {
          uuid: uuid(),
          email: "shepherdjerred@gmail.com",
        },
      };

      datastore.putServer(server);

      return server;
    },
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
