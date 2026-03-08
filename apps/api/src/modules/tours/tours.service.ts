import { Injectable } from '@nestjs/common';
import { ToursAdminService } from './tours-admin.service';
import { ToursPublicService } from './tours-public.service';

@Injectable()
export class ToursService {
  constructor(
    private readonly toursAdminService: ToursAdminService,
    private readonly toursPublicService: ToursPublicService,
  ) {}

  async list(params: { search?: string; status?: string }) {
    return this.toursAdminService.list(params);
  }

  async create(body: any) {
    return this.toursAdminService.create(body);
  }

  async detail(id: number) {
    return this.toursAdminService.detail(id);
  }

  async update(id: number, body: any) {
    return this.toursAdminService.update(id, body);
  }

  async toggleStatus(id: number) {
    return this.toursAdminService.toggleStatus(id);
  }

  async homeFeed() {
    return this.toursPublicService.homeFeed();
  }

  async publicList(params: {
    search?: string;
    destination?: string;
    departure_location?: string;
    date_from?: string;
    min_price?: string;
    max_price?: string;
    take?: string;
    skip?: string;
  }) {
    return this.toursPublicService.publicList(params);
  }

  async publicDetail(tourId: number) {
    return this.toursPublicService.publicDetail(tourId);
  }
}
