import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { IAdmin } from '@common/interfaces';
import { AuthService } from '@api/auth/auth.service';

@Injectable()
export class LocalAdminStrategy extends PassportStrategy(
  Strategy,
  'local-admin',
) {
  constructor(private authService: AuthService) {
    super(
      {
        usernameField: 'username',
        passwordField: 'password',
        passReqToCallback: true,
      },
      async (_: Request, username: string, password: string, next: any) => {
        try {
          const result = await this.validate(username, password);
          if (result) {
            next(null, result);
          } else {
            next(null);
          }
        } catch (error) {
          next(error);
        }
      },
    );
  }

  async validate(username: string, password: string): Promise<IAdmin> {
    return await this.authService.validate(username, password);
  }
}
