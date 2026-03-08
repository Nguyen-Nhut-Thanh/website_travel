-- CreateTable
CREATE TABLE "banners" (
    "banner_id" SERIAL NOT NULL,
    "location_name" VARCHAR(255) NOT NULL,
    "header" VARCHAR(255) NOT NULL,
    "description" TEXT NOT NULL,
    "image_url" VARCHAR(255) NOT NULL,
    "link_to" VARCHAR(255),
    "sort_order" INTEGER NOT NULL DEFAULT 1,
    "status" SMALLINT NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,c
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "banners_pkey" PRIMARY KEY ("banner_id")
);

-- CreateTable
CREATE TABLE "tour_policies" (
    "policy_id" SERIAL NOT NULL,
    "tour_id" INTEGER NOT NULL,
    "policy_type" VARCHAR(100) NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tour_policies_pkey" PRIMARY KEY ("policy_id")
);

-- CreateIndex
CREATE INDEX "idx_banners_status_sort" ON "banners"("status", "sort_order");

-- CreateIndex
CREATE INDEX "idx_tour_policies_tour_type" ON "tour_policies"("tour_id", "policy_type");

-- AddForeignKey
ALTER TABLE "tour_policies" ADD CONSTRAINT "tour_policies_tour_id_fkey" FOREIGN KEY ("tour_id") REFERENCES "tours"("tour_id") ON DELETE NO ACTION ON UPDATE NO ACTION;
