export type Cors = {
  credentials: boolean;
  origin: string[];
};

export type Options = {
  port: string | number;
  endpoint: string;
  playground: string;
  cors: Cors | false;
};

export interface OptionsMap {
  [key: string]: {
    [key: string]: Options;
  };
}
