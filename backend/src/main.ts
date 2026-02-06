import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {redis} from './redis';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  await redis.connect();

  // Enable CORS
  app.enableCors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  });

  await app.listen(process.env.PORT ?? 3000);
  console.log('Application is running on: ' + (await app.getUrl()));

}
bootstrap();
