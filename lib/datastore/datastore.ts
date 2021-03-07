import { Server, User } from "@mira-hq/model/dist/index";

export default interface Datastore {
  getServers(): Promise<Server[]>;
  putServer(server: Server): void;
  getUsers(): User[];
}
