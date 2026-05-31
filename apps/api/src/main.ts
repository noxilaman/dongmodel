import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import cookieParser from "cookie-parser";
import express from "express";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const webOrigin = process.env.WEB_ORIGIN ?? "http://localhost:3000";
  const uploadDir = process.env.LOCAL_UPLOAD_DIR ?? "./uploads";

  app.setGlobalPrefix("api/v1");
  app.enableCors({
    origin: webOrigin,
    credentials: true
  });
  app.use(cookieParser());
  app.use("/uploads", express.static(uploadDir));

  await app.listen(process.env.PORT ? Number(process.env.PORT) : 4000);
}

void bootstrap();
