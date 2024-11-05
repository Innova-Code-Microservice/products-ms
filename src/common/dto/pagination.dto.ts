import { Type } from "class-transformer";
import { IsOptional, IsPositive, IsString } from "class-validator";


export class PaginationDto {

    @IsOptional()
    @IsPositive()
    @Type(() => Number)
    page?: number = 1;
        
    @IsOptional()
    @IsPositive()
    @Type(() => Number)
    limit?: number = 10;

    @IsString()
    @IsOptional()
    search?: string | undefined;

}