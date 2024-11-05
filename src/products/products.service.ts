import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { convertToSlug } from 'src/common/helpers/convert-to-slug';
import { PaginationDto } from '../common/dto/pagination.dto';

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
      throw new BadRequestException("Ya se registro un producto con este nombre")
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
    
    if( !search ){
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
      throw new NotFoundException("No se encontro el producto")
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
      throw new NotFoundException("No se encontro el producto")
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
      throw new NotFoundException("No se encontro el producto")
    }

    await this.prisma.products.delete({ 
      where: { id }
    })

    return {
      message: "Producto eliminado con exito",
      product: productExists,
    }

  }
}
