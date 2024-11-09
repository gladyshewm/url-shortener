import { Injectable } from '@nestjs/common';

@Injectable()
export class LinkService {
  getHello(): string {
    return 'Hello World!';
  }
}
