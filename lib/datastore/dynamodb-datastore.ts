import Datastore from "./datastore";
import { Server } from "@mira-hq/model/dist/index";
import DynamoDB from "aws-sdk/clients/dynamodb";

export default class DynamoDbDatastore implements Datastore {
  private readonly dynamodb: DynamoDB;

  constructor() {
    this.dynamodb = new DynamoDB({
      region: "us-east-1",
    });
  }

  async getServers(): Promise<Server[]> {
    const request: DynamoDB.Types.ScanInput = {
      TableName: "MiraHq",
    };

    let servers: Server[] = [];

    try {
      const response = await this.dynamodb.scan(request).promise();

      const items = response.Items || [];

      servers = items.map((item) => {
        return {
          uuid: item.pk1.S,
        } as Server;
      });

      console.log(servers);

      return servers;
    } catch (error) {
      console.error(error);
      return [];
    }
  }

  putServer(server: Server) {
    const request: DynamoDB.Types.PutItemInput = {
      TableName: "MiraHq",
      Item: {
        pk1: {
          S: server.uuid,
        },
        sk1: {
          S: server.uuid,
        },
      },
    };

    this.dynamodb.putItem(request, (error) => {
      if (error) {
        throw error;
      }
    });
  }

  getUsers(): [] {
    return [];
  }
}
