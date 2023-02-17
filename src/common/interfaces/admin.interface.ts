export interface IAdmin {
  id: string;
  password: string;
  salt: string;
  name: string;
  available: boolean;
  permission: string;
  createdAt: Date;
  layoutMode: string;
}
