import { IsBoolean, IsDecimal, IsInt, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateProductDto {

    @IsString({ message: "El nombre debe ser un texto" })
    name: string;

    @IsString()
    description: string;
    
    @IsNumber()
    priceSale: number;
    
    @IsNumber()
    pricePurchase: number;
    
    @IsString()
    @IsOptional()
    slug?: string;
    
    @IsInt()
    stock: number;
    
    @IsBoolean()
    isEnable: boolean
}
