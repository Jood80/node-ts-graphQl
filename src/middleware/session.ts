export const sessionMiddleware = (req: any, res: any, next: any) => {
  try {
    if (req.session) {
      console.log(req.session);
      return next();
    }
  } catch (error) {
    res.send(error);
  }
};
