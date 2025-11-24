import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/user.module';
import { GesturesModule } from './gestures/gesture.module';
import { StatsModule } from './stats/stats.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { User } from './users/entities/user.entity';
import { Gesture } from './gestures/entities/gesture.entity';
import { Stat } from './stats/entities/stat.entity';
import { FirebaseAdminService } from './firebase-admin.service';
import { MediaPipeModule } from './media-pipe/media-pipe.module';

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
      entities: [User, Gesture, Stat],
      synchronize: true,
      autoLoadEntities: true,
    }),
    UsersModule,
    GesturesModule,
    StatsModule,
    MediaPipeModule,
  ],
  controllers: [AppController],
  providers: [AppService, FirebaseAdminService],
})
export class AppModule {}
