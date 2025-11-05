import { PartialType } from '@nestjs/swagger';
import { CreateWardDto, CreateBedDto } from './create-ward.dto';

export class UpdateWardDto extends PartialType(CreateWardDto) {}

export class UpdateBedDto extends PartialType(CreateBedDto) {}