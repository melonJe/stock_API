import { ConfigModule, ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { HashUtil } from '@common/utils/security';
import { configuration } from '@common/config';
import { AuthService } from '@api/auth/auth.service';
import { LocalAdminStrategy } from './strategies';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { CacheModule, CACHE_MANAGER } from '@nestjs/common';
import { sampleUser } from '@common/test/mock';

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: JwtService;
  let cacheManager: Cache;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          load: [configuration],
        }),
        JwtModule.registerAsync({
          inject: [ConfigService],
          useFactory: (configService: ConfigService) => {
            return {
              secret: configService.get('jwt.secret'),
              // signOptions: { expiresIn: '60s' },
            };
          },
        }),
        CacheModule.register(),
      ],
      providers: [LocalAdminStrategy],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validation', () => {
    it('validating new password', async () => {
      const plain = 'jhsong85';

      expect(true).toBe(
        HashUtil.validate(plain, sampleUser.password, sampleUser.salt),
      );
    });

    // const publicKey =
    //   '-----BEGIN RSA PUBLIC KEY-----\nMIIBCgKCAQEA2Zc5d0+zkZ5AKmtYTvxHc3vRc41YfbklflxG9SWsg5qXUxvfgpkt\nGAcxXLFAd9Uglzow9ezvmTGce5d3DhAYKwHAEPT9hbaMDj7DfmEwuNO8UahfnBkB\nXsCoUaL3QITF5/DAPsZroTqs7tkQQZ7qPkQXCSu2aosgOJmaoKQgwcOdjD0D49ne\n2B/dkxBcNCcJT9pTSWJ8NfGycjWAQsvC8CGstH8oKwhC5raDcc2IGXMOQC7Qr75d\n6J5Q24CePHj/JD7zjbwYy9KNH8wyr829eO/G4OEUW50FAN6HKtvjhJIguMl/1BLZ\n93z2KJyxExiNTZBUBQbbgCNBfzTv7JrxMwIDAQAB\n-----END RSA PUBLIC KEY-----\n';

    // it('Generate Public Key from JWK', async () => {
    //   // const jwks: IJWKSet = {
    //   //   kty: 'RSA',
    //   //   kid: 'W6WcOKB',
    //   //   use: 'sig',
    //   //   alg: 'RS256',
    //   //   n: '2Zc5d0-zkZ5AKmtYTvxHc3vRc41YfbklflxG9SWsg5qXUxvfgpktGAcxXLFAd9Uglzow9ezvmTGce5d3DhAYKwHAEPT9hbaMDj7DfmEwuNO8UahfnBkBXsCoUaL3QITF5_DAPsZroTqs7tkQQZ7qPkQXCSu2aosgOJmaoKQgwcOdjD0D49ne2B_dkxBcNCcJT9pTSWJ8NfGycjWAQsvC8CGstH8oKwhC5raDcc2IGXMOQC7Qr75d6J5Q24CePHj_JD7zjbwYy9KNH8wyr829eO_G4OEUW50FAN6HKtvjhJIguMl_1BLZ93z2KJyxExiNTZBUBQbbgCNBfzTv7JrxMw',
    //   //   e: 'AQAB',
    //   // };
    //   // const pem = JwksUtil.generatePublicKey(jwks);
    //   // expect(pem).toEqual(publicKey);
    // });

    // const accessToken =
    //   'qoA90BIyY5FtTSuvyQ3XgOytc5V4FjMYMw_MIRUA5yADuxgPI5JyjpA6MoiPKlpjF85smgopb1UAAAGDaWP2aQ';
    // it('Verifying Public Key', async () => {
    //   // JwtUtil.verify();
    // });
  });

  // describe('login-v1', () => {
  //   it('authentication', async () => {
  //     const loginForm = {
  //       Appname: APP_TYPE.MARS,
  //       Email: 'jiho.song@trustverse.io',
  //       Password: 'jhsong85',
  //     };

  //     userRepository.findOne.mockResolvedValue(sampleUser);
  //     const user = await service.validateUser(
  //       loginForm.Email,
  //       loginForm.Password,
  //     );
  //     expect(user).not.toBeNull();
  //   });

  //   it('get token', async () => {
  //     const loginForm = {
  //       Appname: APP_TYPE.MARS,
  //       Email: 'jiho.song@trustverse.io',
  //       Password: 'jhsong85',
  //     };

  //     userRepository.findOne.mockResolvedValue(sampleUser);
  //     const user = await service.validateUser(
  //       loginForm.Email,
  //       loginForm.Password,
  //     );

  //     const { accessToken } = await service.getAuthToken(
  //       user.email,
  //       loginForm.Appname,
  //     );
  //     expect(accessToken).not.toBeNull();
  //   });

  //   it('refresh token', async () => {
  //     const refreshToken =
  //       'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpYXQiOjE2NDQyMDUyNjksIm5iZiI6MTY0NDIwNTI2OSwianRpIjoiNmFkMmVkNDYtZGY0ZS00Y2QyLThkMjMtZjJkMmEyOGZmYjBjIiwiZXhwIjoxNjQ2Nzk3MjY5LCJpZGVudGl0eSI6InRlc3RAZ21haWwuY29tIiwidHlwZSI6InJlZnJlc2giLCJ1c2VyX2NsYWltcyI6eyJhcHBuYW1lIjoibWFycyIsInVzZXJfaWQiOjEyN319.S7xiebdZjof-L6PSkzXQKxa0a2OXG9osjRhJVU1yE1s';

  //     userRepository.findOne.mockResolvedValue(sampleUser);
  //     jwtService.verify(refreshToken);
  //     const { identity, user_claims } = jwtService.decode(
  //       refreshToken,
  //     ) as IAuthTokenPayload;

  //     const { accessToken } = await service.getAuthToken(
  //       identity,
  //       user_claims.appname,
  //     );
  //     expect(accessToken).not.toBeNull();
  //   });
  // });
});
