export abstract class UseCase<Request = unknown, Response = void> {
  abstract execute(params: Request): Promise<Response>;
}
