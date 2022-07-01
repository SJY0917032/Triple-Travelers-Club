-- triple.place definition

CREATE TABLE `place` (
  `id` varchar(36) NOT NULL,
  `name` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `IDX_493d5e591af774a1587d363fb8` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- triple.`user` definition

CREATE TABLE `user` (
  `id` varchar(36) NOT NULL,
  `email` varchar(255) NOT NULL,
  `nickName` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `level` int NOT NULL DEFAULT '1',
  `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `deletedAt` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `IDX_e12875dfb3b1d92d7d7c5377e2` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- triple.review definition

CREATE TABLE `review` (
  `id` varchar(36) NOT NULL,
  `content` longtext NOT NULL,
  `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `deletedAt` datetime(6) DEFAULT NULL,
  `userId` varchar(36) DEFAULT NULL,
  `placeId` varchar(36) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `IDX_1337f93918c70837d3cea105d3` (`userId`),
  KEY `IDX_ec8f295224c904bded4ddfd9ec` (`placeId`),
  CONSTRAINT `FK_1337f93918c70837d3cea105d39` FOREIGN KEY (`userId`) REFERENCES `user` (`id`),
  CONSTRAINT `FK_ec8f295224c904bded4ddfd9ec6` FOREIGN KEY (`placeId`) REFERENCES `place` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- triple.review_image definition

CREATE TABLE `review_image` (
  `id` varchar(36) NOT NULL,
  `url` varchar(255) NOT NULL,
  `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `deletedAt` datetime(6) DEFAULT NULL,
  `reviewId` varchar(36) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `IDX_ba036c03954b7d5dd9f73188c6` (`url`),
  KEY `FK_f0a1a48c40bcb0585f111015e5a` (`reviewId`),
  CONSTRAINT `FK_f0a1a48c40bcb0585f111015e5a` FOREIGN KEY (`reviewId`) REFERENCES `review` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- triple.`point` definition

CREATE TABLE `point` (
  `id` varchar(36) NOT NULL,
  `type` varchar(255) NOT NULL,
  `action` varchar(255) NOT NULL,
  `reason` varchar(255) NOT NULL,
  `score` decimal(10,0) NOT NULL,
  `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `userId` varchar(36) DEFAULT NULL,
  `reviewId` varchar(36) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `IDX_c01766b92e52572f0b871c24bb` (`userId`),
  KEY `FK_00cd40e870efbb8f1a897e8266a` (`reviewId`),
  CONSTRAINT `FK_00cd40e870efbb8f1a897e8266a` FOREIGN KEY (`reviewId`) REFERENCES `review` (`id`),
  CONSTRAINT `FK_c01766b92e52572f0b871c24bb6` FOREIGN KEY (`userId`) REFERENCES `user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;