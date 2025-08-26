// Type declarations for modules without TypeScript definitions

declare module 'xss-clean' {
  function xssClean(): any;
  export = xssClean;
}

declare module 'crypto-js' {
  export const AES: {
    encrypt: (text: string, key: string) => { toString: () => string };
    decrypt: (encryptedText: string, key: string) => { toString: (encoding: any) => string };
  };
  export const enc: {
    Utf8: any;
  };
}

declare module 'cors' {
  import { RequestHandler } from 'express';
  
  interface CorsOptions {
    origin?: any;
    credentials?: boolean;
    methods?: string[];
    allowedHeaders?: string[];
  }
  
  function cors(options?: CorsOptions): RequestHandler;
  export = cors;
}