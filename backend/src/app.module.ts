import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfig } from './database/typeorm.config';
import { User } from './database/entities/user.entity';
import { Advocate } from './database/entities/advocate.entity';
import { Appointment } from './database/entities/appointment.entity';
import { UsersModule } from './modules/users/users.module';
import { AppointmentsModule } from './modules/appointments/appointments.module';
import { AdvocatesModule } from './modules/advocates/advocate.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot(typeOrmConfig),
    TypeOrmModule.forFeature([User, Advocate, Appointment]),
    UsersModule,
    AppointmentsModule,
    AdvocatesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
