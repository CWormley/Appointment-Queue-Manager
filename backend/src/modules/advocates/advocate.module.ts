import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Advocate } from '../../database/entities/advocate.entity';
import { Appointment } from '../../database/entities/appointment.entity';
import { AdvocatesService } from './advocate.service';
import { AdvocatesController } from './advocate.controller';

@Module({
    imports: [TypeOrmModule.forFeature([Advocate, Appointment])],
    controllers: [AdvocatesController],
    providers: [AdvocatesService],
    exports: [AdvocatesService],
})
export class AdvocatesModule {}