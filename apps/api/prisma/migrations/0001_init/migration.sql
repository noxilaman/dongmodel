-- CreateTable
CREATE TABLE `Owner` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `passwordHash` VARCHAR(191) NULL,
    `googleSub` VARCHAR(191) NULL,
    `displayName` VARCHAR(191) NOT NULL,
    `handle` VARCHAR(191) NOT NULL,
    `role` ENUM('OWNER', 'ADMIN') NOT NULL DEFAULT 'OWNER',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Owner_email_key`(`email`),
    UNIQUE INDEX `Owner_googleSub_key`(`googleSub`),
    UNIQUE INDEX `Owner_handle_key`(`handle`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Session` (
    `id` VARCHAR(191) NOT NULL,
    `ownerId` VARCHAR(191) NOT NULL,
    `tokenHash` VARCHAR(191) NOT NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Session_tokenHash_key`(`tokenHash`),
    INDEX `Session_ownerId_idx`(`ownerId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CollectibleKind` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `CollectibleKind_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Modong` (
    `id` VARCHAR(191) NOT NULL,
    `ownerId` VARCHAR(191) NOT NULL,
    `collectibleKindId` VARCHAR(191) NULL,
    `name` VARCHAR(191) NOT NULL,
    `state` ENUM('โมดอง', 'ต่อไม่เสร็จ', 'ต่อแล้ว', 'ปล่อยไปแล้ว', 'หลุมดำ') NOT NULL DEFAULT 'โมดอง',
    `releaseYear` INTEGER NULL,
    `acquisitionYear` INTEGER NULL,
    `releasedAwayYear` INTEGER NULL,
    `acquisitionSource` TEXT NULL,
    `storageNote` TEXT NULL,
    `privateNote` TEXT NULL,
    `purchaseAmount` DECIMAL(12, 2) NULL,
    `purchaseCurrency` VARCHAR(191) NOT NULL DEFAULT 'THB',
    `releaseAmount` DECIMAL(12, 2) NULL,
    `releaseCurrency` VARCHAR(191) NOT NULL DEFAULT 'THB',
    `galleryVisible` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Modong_ownerId_state_idx`(`ownerId`, `state`),
    INDEX `Modong_ownerId_name_idx`(`ownerId`, `name`),
    INDEX `Modong_collectibleKindId_idx`(`collectibleKindId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `WantedItem` (
    `id` VARCHAR(191) NOT NULL,
    `ownerId` VARCHAR(191) NOT NULL,
    `collectibleKindId` VARCHAR(191) NULL,
    `wantedListId` VARCHAR(191) NULL,
    `acquiredModongId` VARCHAR(191) NULL,
    `name` VARCHAR(191) NOT NULL,
    `state` ENUM('กำลังงมเข็ม', 'mission complete', 'ห่างกันซักพัก', 'เราขาดกัน') NOT NULL DEFAULT 'กำลังงมเข็ม',
    `wantedNote` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `WantedItem_acquiredModongId_key`(`acquiredModongId`),
    INDEX `WantedItem_ownerId_state_idx`(`ownerId`, `state`),
    INDEX `WantedItem_ownerId_name_idx`(`ownerId`, `name`),
    INDEX `WantedItem_wantedListId_idx`(`wantedListId`),
    INDEX `WantedItem_collectibleKindId_idx`(`collectibleKindId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ModongGroup` (
    `id` VARCHAR(191) NOT NULL,
    `ownerId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `note` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `ModongGroup_ownerId_name_idx`(`ownerId`, `name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ModongGroupItem` (
    `modongId` VARCHAR(191) NOT NULL,
    `groupId` VARCHAR(191) NOT NULL,
    `addedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `ModongGroupItem_groupId_idx`(`groupId`),
    PRIMARY KEY (`modongId`, `groupId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `WantedList` (
    `id` VARCHAR(191) NOT NULL,
    `ownerId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `WantedList_ownerId_name_idx`(`ownerId`, `name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Photo` (
    `id` VARCHAR(191) NOT NULL,
    `ownerId` VARCHAR(191) NOT NULL,
    `modongId` VARCHAR(191) NULL,
    `wantedItemId` VARCHAR(191) NULL,
    `kind` ENUM('MODONG_MAIN', 'MODONG_ADDITIONAL', 'WANTED_REFERENCE') NOT NULL,
    `storageKey` VARCHAR(191) NOT NULL,
    `originalName` VARCHAR(191) NULL,
    `mimeType` VARCHAR(191) NOT NULL,
    `sizeBytes` INTEGER NOT NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Photo_ownerId_idx`(`ownerId`),
    INDEX `Photo_modongId_kind_idx`(`modongId`, `kind`),
    INDEX `Photo_wantedItemId_kind_idx`(`wantedItemId`, `kind`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Share` (
    `id` VARCHAR(191) NOT NULL,
    `ownerId` VARCHAR(191) NOT NULL,
    `tokenHash` VARCHAR(191) NOT NULL,
    `kind` ENUM('MODONG', 'MODONG_GROUP', 'WANTED') NOT NULL,
    `modongId` VARCHAR(191) NULL,
    `modongGroupId` VARCHAR(191) NULL,
    `wantedItemId` VARCHAR(191) NULL,
    `revokedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Share_tokenHash_key`(`tokenHash`),
    INDEX `Share_ownerId_idx`(`ownerId`),
    INDEX `Share_kind_idx`(`kind`),
    INDEX `Share_modongId_idx`(`modongId`),
    INDEX `Share_modongGroupId_idx`(`modongGroupId`),
    INDEX `Share_wantedItemId_idx`(`wantedItemId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ShareFeaturedModong` (
    `shareId` VARCHAR(191) NOT NULL,
    `modongId` VARCHAR(191) NOT NULL,
    `position` INTEGER NOT NULL,

    INDEX `ShareFeaturedModong_modongId_idx`(`modongId`),
    PRIMARY KEY (`shareId`, `modongId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Session` ADD CONSTRAINT `Session_ownerId_fkey` FOREIGN KEY (`ownerId`) REFERENCES `Owner`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Modong` ADD CONSTRAINT `Modong_ownerId_fkey` FOREIGN KEY (`ownerId`) REFERENCES `Owner`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Modong` ADD CONSTRAINT `Modong_collectibleKindId_fkey` FOREIGN KEY (`collectibleKindId`) REFERENCES `CollectibleKind`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `WantedItem` ADD CONSTRAINT `WantedItem_ownerId_fkey` FOREIGN KEY (`ownerId`) REFERENCES `Owner`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `WantedItem` ADD CONSTRAINT `WantedItem_collectibleKindId_fkey` FOREIGN KEY (`collectibleKindId`) REFERENCES `CollectibleKind`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `WantedItem` ADD CONSTRAINT `WantedItem_wantedListId_fkey` FOREIGN KEY (`wantedListId`) REFERENCES `WantedList`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `WantedItem` ADD CONSTRAINT `WantedItem_acquiredModongId_fkey` FOREIGN KEY (`acquiredModongId`) REFERENCES `Modong`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ModongGroup` ADD CONSTRAINT `ModongGroup_ownerId_fkey` FOREIGN KEY (`ownerId`) REFERENCES `Owner`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ModongGroupItem` ADD CONSTRAINT `ModongGroupItem_modongId_fkey` FOREIGN KEY (`modongId`) REFERENCES `Modong`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ModongGroupItem` ADD CONSTRAINT `ModongGroupItem_groupId_fkey` FOREIGN KEY (`groupId`) REFERENCES `ModongGroup`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `WantedList` ADD CONSTRAINT `WantedList_ownerId_fkey` FOREIGN KEY (`ownerId`) REFERENCES `Owner`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Photo` ADD CONSTRAINT `Photo_modongId_fkey` FOREIGN KEY (`modongId`) REFERENCES `Modong`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Photo` ADD CONSTRAINT `Photo_wantedItemId_fkey` FOREIGN KEY (`wantedItemId`) REFERENCES `WantedItem`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Photo` ADD CONSTRAINT `Photo_ownerId_fkey` FOREIGN KEY (`ownerId`) REFERENCES `Owner`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Share` ADD CONSTRAINT `Share_ownerId_fkey` FOREIGN KEY (`ownerId`) REFERENCES `Owner`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Share` ADD CONSTRAINT `Share_modongId_fkey` FOREIGN KEY (`modongId`) REFERENCES `Modong`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Share` ADD CONSTRAINT `Share_modongGroupId_fkey` FOREIGN KEY (`modongGroupId`) REFERENCES `ModongGroup`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Share` ADD CONSTRAINT `Share_wantedItemId_fkey` FOREIGN KEY (`wantedItemId`) REFERENCES `WantedItem`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ShareFeaturedModong` ADD CONSTRAINT `ShareFeaturedModong_shareId_fkey` FOREIGN KEY (`shareId`) REFERENCES `Share`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ShareFeaturedModong` ADD CONSTRAINT `ShareFeaturedModong_modongId_fkey` FOREIGN KEY (`modongId`) REFERENCES `Modong`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

