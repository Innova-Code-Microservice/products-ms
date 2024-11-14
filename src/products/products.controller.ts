import { Controller, Body } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller()
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @MessagePattern('createProduct')
  create(@Payload() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @MessagePattern('findAllProducts')
  findAll(@Payload() paginationDto: PaginationDto) {
    return this.productsService.findAll(paginationDto);
  }

  @MessagePattern('findOneProduct')
  findOne(@Payload() term: string) {
    return this.productsService.findOne(term);
  }

  @MessagePattern('updateProduct')
  update(@Payload() { id, updateProductDto }: { id: string, updateProductDto: UpdateProductDto }) {
    return this.productsService.update(id, updateProductDto);
  }

  @MessagePattern('removeProduct')
  remove(@Payload() id: string) {
    return this.productsService.remove(id);
  }

  @MessagePattern('validateProductsIds')
  validateProductsIds(@Payload() ids: string[]) {
    return this.productsService.validateProductsIds(ids);
  }

  @MessagePattern('updateProductStock')
  updateProductStock(@Payload() productIdsQuantities: {id: string; quantity: number;}[]) {
    return this.productsService.updateProductStock(productIdsQuantities);
  }
}
