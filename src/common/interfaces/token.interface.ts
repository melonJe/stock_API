import { CLAIM_TYPE, TOKEN_TYPE } from '@common/enums';

export interface ITokens {
  access: ITokenWithExp;
  refresh?: ITokenWithExp;
}

export interface ITokenWithExp {
  token: string;
  exp: number;
}

export interface IClaim {
  id: string;
  type: CLAIM_TYPE;
}

export interface IGatewayClaim extends IClaim {
  name: string;
}
export interface IAdminClaim extends IClaim {
  name: string;
  roles: string[];
  layout: string;
}

export interface IAuthTokenPayload<T extends IClaim> {
  iss?: string;
  iat: number;
  exp: number;
  nbf: number;
  jit: string;
  fresh: boolean;
  type: TOKEN_TYPE;
  version: number;
  claims: T;
}
