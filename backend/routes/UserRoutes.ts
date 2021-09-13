import { Router } from "express";

class UserResource {
  public router: Router;
  private url: string;

  constructor(url: string = "/api/v1") {
    this.router = Router();
    this.url = url;
    this.buildRoutes();
  }

  private buildRoutes() {}
}

const resource = new UserResource();

export default resource;
