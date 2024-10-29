import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {

  getProducts(): string[] {
    return [
      "Producto 1",
      "Producto 2",
    ]
  }

  getHello(): string {
    return 'Hola Muundo';
  }
}
