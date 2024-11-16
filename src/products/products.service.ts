import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { convertToSlug } from 'src/common/helpers/convert-to-slug';
import { PaginationDto } from '../common/dto/pagination.dto';
import { RpcException } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { response } from 'express';

@Injectable()
export class ProductsService {

  constructor(private prisma: PrismaService) { }

  async create(createProductDto: CreateProductDto) {

    const productExists = await this.prisma.products.findFirst({
      where: {
        name: createProductDto.name
      }
    });

    if (productExists) {
      throw new RpcException({
        message: "Ya se registro un producto con este nombre",
        statusCode: HttpStatus.BAD_REQUEST,
      })
    }

    const slug = convertToSlug(createProductDto.name);

    const product = await this.prisma.products.create({
      data: {
        ...createProductDto,
        slug,
      },
    })

    return {
      message: "Producto creado con exito",
      product,
    };
  }

  async findAll(paginationDto: PaginationDto) {

    const { limit, page, search } = paginationDto;

    if (!search) {
      const totalProducts = await this.prisma.products.count();

      const lastPage = Math.ceil(totalProducts / limit);

      const products = await this.prisma.products.findMany({
        skip: (page - 1) * limit,
        take: limit,
        orderBy: {
          createdAt: "desc"
        }
      });

      return {
        products,
        meta: {
          total: totalProducts,
          page,
          lastPage,
        }
      };
    }

    const totalProducts = await this.prisma.products.count({
      where: {
        OR: [
          { id: { contains: search } },
          { name: { contains: search } },
        ]
      }
    });

    const lastPage = Math.ceil(totalProducts / limit);

    const products = await this.prisma.products.findMany({
      where: {
        OR: [
          { id: { contains: search } },
          { name: { contains: search } },
        ]
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {
        createdAt: "desc"
      }
    })


    return {
      products,
      meta: {
        total: totalProducts,
        page,
        lastPage,
      }
    }

  }

  async findOne(term: string) {

    const product = await this.prisma.products.findFirst({
      where: {
        OR: [
          { id: term },
          { slug: term }
        ]
      }
    })

    if (!product) {
      throw new RpcException({
        message: "No se encontro el producto",
        statusCode: HttpStatus.NOT_FOUND,
      })
    }


    return {
      product,
    };
  }

  async update(id: string, updateProductDto: UpdateProductDto) {

    const productExists = await this.prisma.products.findFirst({
      where: {
        id
      }
    })

    if (!productExists) {
      throw new RpcException({
        message: "No se encontro el producto",
        statusCode: HttpStatus.NOT_FOUND,
      })
    }

    if (updateProductDto.name) {
      const slug = convertToSlug(updateProductDto.name);
      const product = await this.prisma.products.update({
        where: { id },
        data: {
          ...updateProductDto,
          slug
        }
      })

      return {
        message: "Producto actualizado",
        product
      }
    }

    const product = await this.prisma.products.update({
      where: { id },
      data: updateProductDto
    })

    return {
      message: "Producto actualizado",
      product
    }
  }

  async remove(id: string) {
    const productExists = await this.prisma.products.findFirst({
      where: {
        id
      }
    })

    if (!productExists) {
      throw new RpcException({
        message: "No se encontro el producto",
        statusCode: HttpStatus.NOT_FOUND,
      })
    }

    await this.prisma.products.delete({
      where: { id }
    })

    return {
      message: "Producto eliminado con exito",
      product: productExists,
    }

  }

  async validateProductsIds(ids: string[]) {

    ids = Array.from(new Set(ids));

    const products = await this.prisma.products.findMany({
      where: {
        id: {
          in: ids
        }
      }
    })

    if (products.length !== ids.length) {
      throw new RpcException({
        message: "No se encontro algun producto",
        statusCode: HttpStatus.BAD_REQUEST,
      })
    }

    return products;

  }

  async updateProductStock(productIdsQuantities: {id: string; quantity: number;}[]) {

    const productIds = productIdsQuantities.map(product => product.id)
    
    const products = await this.prisma.products.findMany({
      where: {
        id: {
          in: productIds
        }
      }
    })


    products.map(( product, index ) => {

      if( product.stock < productIdsQuantities[index].quantity ){
        throw new RpcException({
          status: HttpStatus.BAD_REQUEST,
          message: "Stock insuficiente"
        })
      }
    })


    products.map(( product, index ) => {
      const newStock = product.stock - productIdsQuantities[index].quantity
      this.update(product.id, { ...product, stock: newStock })
    })
   
    return true;
  }


}
