import { createHmac, randomBytes } from 'crypto';

export class HashUtil {
  public static validate = (plain: string, encrypted: string, salt: string) =>
    this.hash(plain, salt) == encrypted;

  public static hash = (plain: string, salt: string): string => {
    return createHmac('sha256', salt).update(plain).digest('hex');
  };

  public static generateSalt = () => randomBytes(16).toString();

  public static generateCode = (size: number) => {
    return new Array(size)
      .fill(0)
      .map(() => Math.floor(Math.random() * 10).toString())
      .join('');
  };
}
