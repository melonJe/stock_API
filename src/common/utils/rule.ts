export const PASSWORD_RULE =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!-/:-@\[-`~])[A-Za-z\d!-/:-@\[-`~]{8,}$/;

export const EMAIL_RULE = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;

export class WebUrlRule {
  static API = /^\/api\/(v1|v2|v3)\/web(\/{0,1})/g;
  static SIGNUP = /^\/users\/register(\/{0,1})/g;
  static SIGNIN = /^\/users\/login(\/{0,1})/g;
  static FORGOT = /^\/users\/password\/forgot(\/{0,1})/g;
  static START = /^(\/(en|ko)){0,1}\/web(\/{0,1})/g;
  static END = /\/$/g;
}
