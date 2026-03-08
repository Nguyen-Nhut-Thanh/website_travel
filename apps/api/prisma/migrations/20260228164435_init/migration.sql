-- CreateTable
CREATE TABLE "accounts" (
    "account_id" SERIAL NOT NULL,
    "email" VARCHAR(150) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "status" SMALLINT NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("account_id")
);

-- CreateTable
CREATE TABLE "booking_travelers" (
    "traveler_id" SERIAL NOT NULL,
    "booking_id" INTEGER NOT NULL,
    "full_name" VARCHAR(150) NOT NULL,
    "dob" DATE,
    "gender" VARCHAR(10) NOT NULL,
    "id_number" VARCHAR(12),
    "traveler_type" VARCHAR(20) NOT NULL DEFAULT 'adult',
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "booking_travelers_pkey" PRIMARY KEY ("traveler_id")
);

-- CreateTable
CREATE TABLE "bookings" (
    "booking_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "tour_schedule_id" INTEGER NOT NULL,
    "contact_name" VARCHAR(150) NOT NULL,
    "contact_phone" VARCHAR(15) NOT NULL,
    "contact_email" VARCHAR(150) NOT NULL,
    "adult_count" INTEGER NOT NULL DEFAULT 1,
    "child_count" INTEGER NOT NULL DEFAULT 0,
    "infant_count" INTEGER NOT NULL DEFAULT 0,
    "adult_unit_price" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "child_unit_price" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "infant_unit_price" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "total_amount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "status" VARCHAR(50) NOT NULL DEFAULT 'pending',
    "note" TEXT,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bookings_pkey" PRIMARY KEY ("booking_id")
);

-- CreateTable
CREATE TABLE "destinations_detail" (
    "detail_id" SERIAL NOT NULL,
    "location_id" INTEGER NOT NULL,
    "latitude" DECIMAL(10,6),
    "longitude" DECIMAL(10,6),
    "best_time" VARCHAR(255),
    "tags" TEXT,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "destinations_detail_pkey" PRIMARY KEY ("detail_id")
);

-- CreateTable
CREATE TABLE "favorites" (
    "user_id" INTEGER NOT NULL,
    "tour_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "favorites_pkey" PRIMARY KEY ("user_id","tour_id")
);

-- CreateTable
CREATE TABLE "geographic_levels" (
    "level_id" SERIAL NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "geographic_levels_pkey" PRIMARY KEY ("level_id")
);

-- CreateTable
CREATE TABLE "hotel_room_types" (
    "room_type_id" SERIAL NOT NULL,
    "hotel_id" INTEGER NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "base_price" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "extra_price" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "breakfast_included" BOOLEAN NOT NULL DEFAULT false,
    "description" TEXT,
    "status" SMALLINT NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "hotel_room_types_pkey" PRIMARY KEY ("room_type_id")
);

-- CreateTable
CREATE TABLE "hotels" (
    "hotel_id" SERIAL NOT NULL,
    "location_id" INTEGER NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "star_rating" SMALLINT NOT NULL DEFAULT 3,
    "address" TEXT NOT NULL,
    "phone" VARCHAR(15),
    "email" VARCHAR(150),
    "description" TEXT,
    "status" SMALLINT NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "hotels_pkey" PRIMARY KEY ("hotel_id")
);

-- CreateTable
CREATE TABLE "locations" (
    "location_id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "level_id" INTEGER NOT NULL,
    "parent_id" INTEGER,
    "country_code" VARCHAR(10),
    "note" TEXT,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "locations_pkey" PRIMARY KEY ("location_id")
);

-- CreateTable
CREATE TABLE "payments" (
    "payment_id" SERIAL NOT NULL,
    "booking_id" INTEGER NOT NULL,
    "method" VARCHAR(50) NOT NULL DEFAULT 'bank',
    "amount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "status" VARCHAR(50) NOT NULL DEFAULT 'pending',
    "transaction_code" VARCHAR(100),
    "paid_at" TIMESTAMP(6),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("payment_id")
);

-- CreateTable
CREATE TABLE "providers" (
    "provider_id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "type" VARCHAR(50) NOT NULL DEFAULT 'car',
    "contact_info" TEXT,
    "status" SMALLINT NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "providers_pkey" PRIMARY KEY ("provider_id")
);

-- CreateTable
CREATE TABLE "reviews" (
    "review_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "tour_id" INTEGER NOT NULL,
    "rating" SMALLINT NOT NULL DEFAULT 5,
    "comment" TEXT,
    "status" SMALLINT NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("review_id")
);

-- CreateTable
CREATE TABLE "role_users" (
    "user_id" INTEGER NOT NULL,
    "role_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "role_users_pkey" PRIMARY KEY ("user_id","role_id")
);

-- CreateTable
CREATE TABLE "roles" (
    "role_id" SERIAL NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "description" VARCHAR(255),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("role_id")
);

-- CreateTable
CREATE TABLE "staff_profiles" (
    "staff_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "employee_code" VARCHAR(20) NOT NULL,
    "position" VARCHAR(100) NOT NULL,
    "status" SMALLINT NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "staff_profiles_pkey" PRIMARY KEY ("staff_id")
);

-- CreateTable
CREATE TABLE "tour_destinations" (
    "tour_id" INTEGER NOT NULL,
    "location_id" INTEGER NOT NULL,
    "visit_order" INTEGER NOT NULL DEFAULT 1,
    "note" TEXT,

    CONSTRAINT "tour_destinations_pkey" PRIMARY KEY ("tour_id","location_id")
);

-- CreateTable
CREATE TABLE "tour_images" (
    "image_id" SERIAL NOT NULL,
    "tour_id" INTEGER NOT NULL,
    "image_url" VARCHAR(255) NOT NULL,
    "is_cover" SMALLINT NOT NULL DEFAULT 0,
    "sort_order" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tour_images_pkey" PRIMARY KEY ("image_id")
);

-- CreateTable
CREATE TABLE "tour_itineraries" (
    "tour_itinerary_id" SERIAL NOT NULL,
    "tour_schedule_id" INTEGER NOT NULL,
    "day_number" INTEGER NOT NULL DEFAULT 1,
    "title" VARCHAR(255) NOT NULL,
    "content" TEXT NOT NULL,
    "meals" VARCHAR(100),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tour_itineraries_pkey" PRIMARY KEY ("tour_itinerary_id")
);

-- CreateTable
CREATE TABLE "tour_schedule_hotels" (
    "schedule_hotel_id" SERIAL NOT NULL,
    "tour_schedule_id" INTEGER NOT NULL,
    "hotel_id" INTEGER NOT NULL,
    "room_type_id" INTEGER NOT NULL,
    "nights" INTEGER NOT NULL DEFAULT 1,
    "day_from" INTEGER,
    "day_to" INTEGER,
    "note" TEXT,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tour_schedule_hotels_pkey" PRIMARY KEY ("schedule_hotel_id")
);

-- CreateTable
CREATE TABLE "tour_schedule_prices" (
    "schedule_price_id" SERIAL NOT NULL,
    "tour_schedule_id" INTEGER NOT NULL,
    "passenger_type" VARCHAR(20) NOT NULL,
    "price" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "currency" VARCHAR(10) NOT NULL DEFAULT 'VND',
    "note" TEXT,

    CONSTRAINT "tour_schedule_prices_pkey" PRIMARY KEY ("schedule_price_id")
);

-- CreateTable
CREATE TABLE "tour_schedule_transports" (
    "schedule_transport_id" SERIAL NOT NULL,
    "tour_schedule_id" INTEGER NOT NULL,
    "transport_id" INTEGER NOT NULL,
    "transport_role" VARCHAR(50) NOT NULL DEFAULT 'main',
    "day_from" INTEGER,
    "day_to" INTEGER,
    "note" TEXT,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tour_schedule_transports_pkey" PRIMARY KEY ("schedule_transport_id")
);

-- CreateTable
CREATE TABLE "tour_schedules" (
    "tour_schedule_id" SERIAL NOT NULL,
    "tour_id" INTEGER NOT NULL,
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,
    "price" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "quota" INTEGER NOT NULL DEFAULT 0,
    "booked_count" INTEGER NOT NULL DEFAULT 0,
    "status" SMALLINT NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tour_schedules_pkey" PRIMARY KEY ("tour_schedule_id")
);

-- CreateTable
CREATE TABLE "tours" (
    "tour_id" SERIAL NOT NULL,
    "code" VARCHAR(30) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "summary" TEXT,
    "description" TEXT NOT NULL,
    "duration_days" INTEGER NOT NULL,
    "duration_nights" INTEGER NOT NULL DEFAULT 0,
    "base_price" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "tour_type" VARCHAR(50) NOT NULL DEFAULT 'domestic',
    "departure_location" INTEGER NOT NULL,
    "transport_id" INTEGER NOT NULL,
    "status" SMALLINT NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sightseeing_summary" TEXT,
    "cuisine_info" TEXT,
    "best_for" VARCHAR(255),
    "best_time" VARCHAR(255),
    "transport_info" TEXT,
    "promotion_info" TEXT,

    CONSTRAINT "tours_pkey" PRIMARY KEY ("tour_id")
);

-- CreateTable
CREATE TABLE "transports" (
    "transport_id" SERIAL NOT NULL,
    "transport_type" VARCHAR(50) NOT NULL DEFAULT 'car',
    "name" VARCHAR(255) NOT NULL,
    "capacity" INTEGER NOT NULL DEFAULT 0,
    "provider_id" INTEGER NOT NULL,
    "status" SMALLINT NOT NULL DEFAULT 1,
    "description" TEXT,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "transports_pkey" PRIMARY KEY ("transport_id")
);

-- CreateTable
CREATE TABLE "users" (
    "user_id" SERIAL NOT NULL,
    "account_id" INTEGER NOT NULL,
    "number_id" VARCHAR(12) NOT NULL,
    "full_name" VARCHAR(150) NOT NULL,
    "gender" VARCHAR(10) NOT NULL,
    "phone" VARCHAR(15) NOT NULL,
    "address" TEXT,
    "avatar_url" VARCHAR(255),
    "is_staff" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("user_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "accounts_email_key" ON "accounts"("email");

-- CreateIndex
CREATE INDEX "idx_bookings_schedule" ON "bookings"("tour_schedule_id");

-- CreateIndex
CREATE INDEX "idx_bookings_user" ON "bookings"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "destinations_detail_location_id_key" ON "destinations_detail"("location_id");

-- CreateIndex
CREATE UNIQUE INDEX "geographic_levels_name_key" ON "geographic_levels"("name");

-- CreateIndex
CREATE UNIQUE INDEX "locations_name_key" ON "locations"("name");

-- CreateIndex
CREATE INDEX "idx_locations_level" ON "locations"("level_id");

-- CreateIndex
CREATE INDEX "idx_locations_parent" ON "locations"("parent_id");

-- CreateIndex
CREATE INDEX "idx_payments_booking" ON "payments"("booking_id");

-- CreateIndex
CREATE UNIQUE INDEX "providers_name_key" ON "providers"("name");

-- CreateIndex
CREATE INDEX "idx_reviews_tour" ON "reviews"("tour_id");

-- CreateIndex
CREATE INDEX "idx_reviews_user" ON "reviews"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "roles_name_key" ON "roles"("name");

-- CreateIndex
CREATE UNIQUE INDEX "staff_profiles_employee_code_key" ON "staff_profiles"("employee_code");

-- CreateIndex
CREATE UNIQUE INDEX "staff_profiles_user_id_position_key" ON "staff_profiles"("user_id", "position");

-- CreateIndex
CREATE INDEX "idx_tour_schedules_tour_date" ON "tour_schedules"("tour_id", "start_date");

-- CreateIndex
CREATE UNIQUE INDEX "tours_code_key" ON "tours"("code");

-- CreateIndex
CREATE UNIQUE INDEX "users_account_id_key" ON "users"("account_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_number_id_key" ON "users"("number_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_key" ON "users"("phone");

-- AddForeignKey
ALTER TABLE "booking_travelers" ADD CONSTRAINT "booking_travelers_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("booking_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_tour_schedule_id_fkey" FOREIGN KEY ("tour_schedule_id") REFERENCES "tour_schedules"("tour_schedule_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "destinations_detail" ADD CONSTRAINT "destinations_detail_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "locations"("location_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_tour_id_fkey" FOREIGN KEY ("tour_id") REFERENCES "tours"("tour_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "hotel_room_types" ADD CONSTRAINT "hotel_room_types_hotel_id_fkey" FOREIGN KEY ("hotel_id") REFERENCES "hotels"("hotel_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "hotels" ADD CONSTRAINT "hotels_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "locations"("location_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "locations" ADD CONSTRAINT "locations_level_id_fkey" FOREIGN KEY ("level_id") REFERENCES "geographic_levels"("level_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "locations" ADD CONSTRAINT "locations_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "locations"("location_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("booking_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_tour_id_fkey" FOREIGN KEY ("tour_id") REFERENCES "tours"("tour_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "role_users" ADD CONSTRAINT "role_users_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("role_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "role_users" ADD CONSTRAINT "role_users_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "staff_profiles" ADD CONSTRAINT "staff_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tour_destinations" ADD CONSTRAINT "tour_destinations_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "locations"("location_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tour_destinations" ADD CONSTRAINT "tour_destinations_tour_id_fkey" FOREIGN KEY ("tour_id") REFERENCES "tours"("tour_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tour_images" ADD CONSTRAINT "tour_images_tour_id_fkey" FOREIGN KEY ("tour_id") REFERENCES "tours"("tour_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tour_itineraries" ADD CONSTRAINT "tour_itineraries_tour_schedule_id_fkey" FOREIGN KEY ("tour_schedule_id") REFERENCES "tour_schedules"("tour_schedule_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tour_schedule_hotels" ADD CONSTRAINT "tour_schedule_hotels_hotel_id_fkey" FOREIGN KEY ("hotel_id") REFERENCES "hotels"("hotel_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tour_schedule_hotels" ADD CONSTRAINT "tour_schedule_hotels_room_type_id_fkey" FOREIGN KEY ("room_type_id") REFERENCES "hotel_room_types"("room_type_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tour_schedule_hotels" ADD CONSTRAINT "tour_schedule_hotels_tour_schedule_id_fkey" FOREIGN KEY ("tour_schedule_id") REFERENCES "tour_schedules"("tour_schedule_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tour_schedule_prices" ADD CONSTRAINT "tour_schedule_prices_tour_schedule_id_fkey" FOREIGN KEY ("tour_schedule_id") REFERENCES "tour_schedules"("tour_schedule_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tour_schedule_transports" ADD CONSTRAINT "tour_schedule_transports_tour_schedule_id_fkey" FOREIGN KEY ("tour_schedule_id") REFERENCES "tour_schedules"("tour_schedule_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tour_schedule_transports" ADD CONSTRAINT "tour_schedule_transports_transport_id_fkey" FOREIGN KEY ("transport_id") REFERENCES "transports"("transport_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tour_schedules" ADD CONSTRAINT "tour_schedules_tour_id_fkey" FOREIGN KEY ("tour_id") REFERENCES "tours"("tour_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tours" ADD CONSTRAINT "tours_departure_location_fkey" FOREIGN KEY ("departure_location") REFERENCES "locations"("location_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tours" ADD CONSTRAINT "tours_transport_id_fkey" FOREIGN KEY ("transport_id") REFERENCES "transports"("transport_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "transports" ADD CONSTRAINT "transports_provider_id_fkey" FOREIGN KEY ("provider_id") REFERENCES "providers"("provider_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "accounts"("account_id") ON DELETE NO ACTION ON UPDATE NO ACTION;
