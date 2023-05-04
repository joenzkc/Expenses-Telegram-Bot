import { Body, Controller, Get, Post } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './users.entity';
import { CreateUserDto } from './dto/create-user-dto';

@Controller('users')
export class UsersController {
    constructor(private usersService: UsersService) {}

    @Get()
    async getUsers() {
        return await this.usersService.getUsers();
    }

    @Post()
    async createUser(@Body() dto: CreateUserDto) {
        return await this.usersService.createUser(dto);
    }
}
