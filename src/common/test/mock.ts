import { IAdmin } from '@common/interfaces';

export const sampleUser: IAdmin = {
  id: 'admin',
  name: 'admin',
  password: 'asdasd',
  salt: 'asdasd',
  available: true,
  createdAt: new Date(),
  layoutMode: '',
  permission: '',
};
