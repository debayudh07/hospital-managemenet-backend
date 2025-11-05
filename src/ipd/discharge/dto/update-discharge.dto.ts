import { PartialType } from '@nestjs/swagger';
import { CreateDischargeDto } from './create-discharge.dto';

export class UpdateDischargeDto extends PartialType(CreateDischargeDto) {}