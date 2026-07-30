import { join } from 'path';
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
      // .env lives at the monorepo root, shared with docker-compose.yml
      envFilePath: join(__dirname, '../../.env'),
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT) || 5432,
      username: process.env.DB_USERNAME || 'blog_user',
      password: process.env.DB_PASSWORD || 'blog_password',
      database: process.env.DB_NAME || 'my_blog_db',
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
