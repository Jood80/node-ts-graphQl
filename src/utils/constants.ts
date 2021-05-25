import * as dotenv from 'dotenv';
import { Options } from 'graphql-yoga';
import { SessionOptions } from 'express-session';
import ms from 'ms';

dotenv.config();

export const serverOptions: Options = {
  port: process.env.PORT || 3000,
  endpoint: '/graphql',
  playground: '/playground',
  cors: {
    credentials: true,
    origin: [process.env.DEVELOPMENT_HOST],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false,
    optionsSuccessStatus: 204,
  },
};

export const SESSION_OPTIONS: SessionOptions = {
  name: 'qid',
  secret: process.env.SECRET,
  resave: true,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: ms('1d'),
  },
};
