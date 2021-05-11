export type Resolver = (parent: any, args: any, context: any, info: any) => any;

export interface ResolverMap {
  [Key: string]: {
    [Key: string]: Resolver; 
  };
}
