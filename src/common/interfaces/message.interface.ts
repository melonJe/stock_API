export interface IMessage {
  message: string;
}

export interface IErrorResponse {
  statusCode: string | number;
  error?: string;
  message: string[] | string;
  params?: string[] | string;
}
