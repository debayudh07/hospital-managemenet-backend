import { PartialType } from '@nestjs/swagger';
import { CreateOPDVisitDto } from './create-opd-visit.dto';

export class UpdateOPDVisitDto extends PartialType(CreateOPDVisitDto) {}