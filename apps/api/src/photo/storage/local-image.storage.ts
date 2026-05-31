import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { randomUUID } from "node:crypto";
import { mkdir, rm, writeFile } from "node:fs/promises";
import { extname, join } from "node:path";

@Injectable()
export class LocalImageStorage {
  constructor(private readonly config: ConfigService) {}

  async save(ownerId: string, file: Express.Multer.File) {
    const root = this.config.get<string>("LOCAL_UPLOAD_DIR") ?? "./uploads";
    const extension = extname(file.originalname).toLowerCase() || ".bin";
    const storageKey = join(ownerId, `${randomUUID()}${extension}`);
    const absolutePath = join(root, storageKey);

    await mkdir(join(root, ownerId), { recursive: true });
    await writeFile(absolutePath, file.buffer);

    return storageKey;
  }

  async delete(storageKey: string) {
    const root = this.config.get<string>("LOCAL_UPLOAD_DIR") ?? "./uploads";
    await rm(join(root, storageKey), { force: true });
  }
}
