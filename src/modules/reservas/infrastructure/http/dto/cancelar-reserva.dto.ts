import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CancelarReservaDto {
  @ApiProperty({ example: 'Se me cruzó con un parcial', maxLength: 500 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  motivo!: string;
}
