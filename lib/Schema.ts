import { gql } from "apollo-server";

export const SCHEMA = gql`
    type Query {
        servers: [Server]
    }
    
  type User {
    uuid: String!
    email: String!
  }

  type Server {
    uuid: String!
    serverName: String!
    address: String
    status: ServerStatus!
    uptime: Int!
    maxUptime: Int!
    playersOnline: Int!
    owner: User!
  }

  enum ServerStatus {
    Starting
    Stopping 
    Stopped 
    Running 
    Terminated 
  }
`;
