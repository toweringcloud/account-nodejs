import { ApiProperty } from '@nestjs/swagger';
import { Todo } from '@prisma/client';

import { UserEntity } from 'src/users/entities/user.entity';

export class TodoEntity implements Todo {
  constructor({ author, ...data }: Partial<TodoEntity>) {
    Object.assign(this, data);

    if (author) {
      this.author = new UserEntity(author);
    }
  }

  @ApiProperty()
  id: number;

  @ApiProperty()
  title: string;

  @ApiProperty()
  completed: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({ required: false, nullable: true })
  authorId: number | null;

  @ApiProperty({ required: false, type: UserEntity })
  author?: UserEntity;
}
