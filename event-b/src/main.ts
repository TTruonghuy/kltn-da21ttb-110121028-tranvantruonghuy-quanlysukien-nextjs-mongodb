import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from "cookie-parser";
import * as bodyParser from "body-parser";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Sử dụng cookie-parser để xử lý cookies
  app.use(cookieParser()); // Middleware để đọc cookie
  app.use(bodyParser.json()); // Xử lý JSON
  app.use(bodyParser.json({ limit: "30mb" })); // Tăng giới hạn lên 20MB hoặc lớn hơn nếu cần
  app.use(bodyParser.urlencoded({ extended: true, limit: "30mb" }));
  

  app.enableCors({
    origin: "http://localhost:3000", // Đảm bảo frontend chạy trên domain này
    credentials: true, // Cho phép gửi cookie qua CORS
  });

  const port = process.env.PORT ?? 5000;
  await app.listen(port);
  console.log(`Backend is running on http://localhost:${port}`); // Log để xác nhận backend đang chạy
}
bootstrap();
