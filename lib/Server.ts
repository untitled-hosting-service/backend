import { ServerStatus } from "./ServerStatus";

export default interface Server {
  uuid: string;
  serverName: string;
  address: string;
  status: ServerStatus;
  uptime: number;
  maxUptime: number;
  playersOnline: number;
}
