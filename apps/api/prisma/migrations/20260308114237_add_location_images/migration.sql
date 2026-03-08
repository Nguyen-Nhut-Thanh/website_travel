-- CreateTable
CREATE TABLE "location_images" (
    "image_id" SERIAL NOT NULL,
    "location_id" INTEGER NOT NULL,
    "image_url" TEXT NOT NULL,
    "is_cover" SMALLINT NOT NULL DEFAULT 0,
    "sort_order" INTEGER NOT NULL DEFAULT 1,
    "alt_text" VARCHAR(255),
    "status" SMALLINT NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "location_images_pkey" PRIMARY KEY ("image_id")
);

-- CreateIndex
CREATE INDEX "idx_location_images_location" ON "location_images"("location_id");

CREATE UNIQUE INDEX uq_location_images_one_cover
ON location_images(location_id)
WHERE is_cover = 1 AND status = 1;
-- CreateIndex
CREATE INDEX "idx_location_images_cover" ON "location_images"("is_cover");

-- CreateIndex
CREATE INDEX "idx_location_images_status" ON "location_images"("status");

-- CreateIndex
CREATE UNIQUE INDEX "uq_location_images_sort" ON "location_images"("location_id", "sort_order");

-- AddForeignKey
ALTER TABLE "location_images" ADD CONSTRAINT "location_images_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "locations"("location_id") ON DELETE CASCADE ON UPDATE NO ACTION;
