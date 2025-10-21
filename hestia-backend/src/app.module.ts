import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/user.module';
import { GesturesModule } from './gestures/gesture.module';
import { GestureDetectionsModule } from './detections/detection.module';
import { StatsModule } from './stats/stats.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { User } from './users/entities/user.entity';
import { Gesture } from './gestures/entities/gesture.entity';
import { Detection } from './detections/entities/detection.entity';
import { Stat } from './stats/entities/stat.entity';
import { FirebaseAdminService } from './firebase-admin.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'blog_user',
      password: 'blog_password',
      database: 'my_blog_db',
      entities: [User, Gesture, Detection, Stat],
      synchronize: true,
      autoLoadEntities: true,
    }),
    UsersModule,
    GesturesModule,
    GestureDetectionsModule,
    StatsModule,
  ],
  controllers: [AppController],
  providers: [AppService, FirebaseAdminService],
})
export class AppModule {}
