import { PartialType } from '@nestjs/swagger';

import { CreateUserInput } from './create-user.dto';
import { CoreOutput } from 'src/common/dtos/core-output.dto';

export class UpdateUserInput extends PartialType(CreateUserInput) {}

export class UpdateUserOutput extends CoreOutput {}
