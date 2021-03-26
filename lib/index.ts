import {
  ApolloServer as ApolloLambdaServer,
  IFieldResolver,
  IResolvers,
} from "apollo-server-lambda";
import { ApolloServer } from "apollo-server";
import { Context, ContextFunction } from "apollo-server-core";
import { ExpressContext } from "apollo-server-express";
import DynamoDbDatastore from "./datastore/dynamodb-datastore";
import {
  Server,
  typeDefs,
  MutationCreateServerArgs,
  ServerStatus,
} from "@mira-hq/model";
import { v4 as uuid } from "uuid";
import { JwksClient, SigningKey } from "jwks-rsa";
import * as jwt from "jsonwebtoken";
import {
  JwtHeader,
  SigningKeyCallback,
  VerifyErrors,
  VerifyOptions,
} from "jsonwebtoken";

const isProduction = false;
const isPreProduction = !isProduction;
const datastore = new DynamoDbDatastore();

const client = new JwksClient({
  jwksUri: `https://mira-hq.us.auth0.com/.well-known/jwks.json`,
});

function getKey(header: JwtHeader, callback: SigningKeyCallback) {
  client.getSigningKey(
    header.kid,
    function (err: Error | null, key: SigningKey) {
      const signingKey = key.getPublicKey();
      callback(null, signingKey);
    }
  );
}

const options: VerifyOptions = {
  audience: "1OSHUpbrfygF5A9JpcywmascOW7ilnIl",
  issuer: `https://mira-hq.us.auth0.com/`,
  algorithms: ["RS256"],
};

interface ApolloContext {
  user: Promise<unknown | undefined>;
}

const createServerMutation: IFieldResolver<
  unknown,
  Context<ApolloContext>,
  MutationCreateServerArgs
> = async (
  source: unknown,
  args: MutationCreateServerArgs,
  context: Context<ApolloContext>
): Promise<Server> => {
  const user = await context.user;

  console.log(user);

  const server: Server = {
    uuid: uuid(),
    serverName: args.serverName || "",
    status: ServerStatus.Created,
    owner: {
      uuid: uuid(),
      email: "shepherdjerred@gmail.com",
    },
  };

  datastore.putServer(server);

  return server;
};

const resolvers: IResolvers = {
  Query: {
    servers: () => datastore.getServers(),
  },
  Mutation: {
    createServer: createServerMutation,
  },
};

const context: ContextFunction<ExpressContext, Context<ApolloContext>> = ({
  req,
}): Context<ApolloContext> => {
  const token = req.headers.authorization || "";
  const user = new Promise((resolve, reject) => {
    jwt.verify(
      token,
      getKey,
      options,
      (err: VerifyErrors | null, decoded: unknown | undefined) => {
        if (err) {
          return reject(err);
        }
        resolve(decoded);
      }
    );
  });

  return {
    user,
  };
};

const server = new ApolloLambdaServer({
  typeDefs: typeDefs,
  resolvers,
  context,
});
export const graphqlHandler = server.createHandler();

if (isPreProduction) {
  const developmentServer = new ApolloServer({
    typeDefs: typeDefs,
    resolvers,
    context,
  });

  void developmentServer.listen().then(({ url }) => {
    console.log(`🚀  Server ready at ${url}`);
  });
}
