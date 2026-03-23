import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

type RecommendationProfilePayload = {
  travel_scope?: string | null;
  preferred_styles?: string[];
  preferred_themes?: string[];
  budget_band?: string | null;
  preferred_duration_band?: string | null;
  preferred_group_type?: string | null;
  preferred_departure?: string | null;
  adventure_level?: string | null;
  allow_behavior_tracking?: boolean;
  allow_chat_signals?: boolean;
};

type RecommendationEventPayload = {
  event_type: string;
  source?: string | null;
  tour_id?: number | null;
  destination?: string | null;
  metadata?: Record<string, unknown> | null;
};

@Injectable()
export class RecommendationProfileService {
  constructor(private readonly prisma: PrismaService) {}

  async getProfile(userId: number) {
    const rows = await this.prisma.$queryRawUnsafe<any[]>(
      `
      SELECT
        recommendation_profile_id,
        user_id,
        travel_scope,
        preferred_styles,
        preferred_themes,
        budget_band,
        preferred_duration_band,
        preferred_group_type,
        preferred_departure,
        adventure_level,
        allow_behavior_tracking,
        allow_chat_signals,
        created_at,
        updated_at
      FROM recommendation_profiles
      WHERE user_id = $1
      LIMIT 1
      `,
      userId,
    );

    const profile = rows[0];
    if (!profile) {
      return {
        user_id: userId,
        travel_scope: null,
        preferred_styles: [],
        preferred_themes: [],
        budget_band: null,
        preferred_duration_band: null,
        preferred_group_type: null,
        preferred_departure: null,
        adventure_level: null,
        allow_behavior_tracking: true,
        allow_chat_signals: true,
      };
    }

    return {
      ...profile,
      preferred_styles: profile.preferred_styles
        ? JSON.parse(profile.preferred_styles)
        : [],
      preferred_themes: profile.preferred_themes
        ? JSON.parse(profile.preferred_themes)
        : [],
    };
  }

  async upsertProfile(userId: number, payload: RecommendationProfilePayload) {
    const stylesJson = JSON.stringify(payload.preferred_styles || []);
    const themesJson = JSON.stringify(payload.preferred_themes || []);

    const rows = await this.prisma.$queryRawUnsafe<any[]>(
      `
      INSERT INTO recommendation_profiles (
        user_id,
        travel_scope,
        preferred_styles,
        preferred_themes,
        budget_band,
        preferred_duration_band,
        preferred_group_type,
        preferred_departure,
        adventure_level,
        allow_behavior_tracking,
        allow_chat_signals
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
      ON CONFLICT (user_id)
      DO UPDATE SET
        travel_scope = EXCLUDED.travel_scope,
        preferred_styles = EXCLUDED.preferred_styles,
        preferred_themes = EXCLUDED.preferred_themes,
        budget_band = EXCLUDED.budget_band,
        preferred_duration_band = EXCLUDED.preferred_duration_band,
        preferred_group_type = EXCLUDED.preferred_group_type,
        preferred_departure = EXCLUDED.preferred_departure,
        adventure_level = EXCLUDED.adventure_level,
        allow_behavior_tracking = EXCLUDED.allow_behavior_tracking,
        allow_chat_signals = EXCLUDED.allow_chat_signals,
        updated_at = NOW()
      RETURNING *
      `,
      userId,
      payload.travel_scope ?? null,
      stylesJson,
      themesJson,
      payload.budget_band ?? null,
      payload.preferred_duration_band ?? null,
      payload.preferred_group_type ?? null,
      payload.preferred_departure ?? null,
      payload.adventure_level ?? null,
      payload.allow_behavior_tracking ?? true,
      payload.allow_chat_signals ?? true,
    );

    const profile = rows[0];
    return {
      ...profile,
      preferred_styles: profile.preferred_styles
        ? JSON.parse(profile.preferred_styles)
        : [],
      preferred_themes: profile.preferred_themes
        ? JSON.parse(profile.preferred_themes)
        : [],
    };
  }

  async trackEvent(userId: number, payload: RecommendationEventPayload) {
    await this.prisma.$executeRawUnsafe(
      `
      INSERT INTO recommendation_events (
        user_id,
        event_type,
        source,
        tour_id,
        destination,
        metadata_json
      )
      VALUES ($1,$2,$3,$4,$5,$6)
      `,
      userId,
      payload.event_type,
      payload.source ?? null,
      payload.tour_id ?? null,
      payload.destination ?? null,
      payload.metadata ? JSON.stringify(payload.metadata) : null,
    );

    return { ok: true };
  }
}
