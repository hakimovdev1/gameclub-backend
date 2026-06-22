import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Setting } from './entities/setting.entity';

/** Sensible defaults applied when a key has never been set. */
const DEFAULTS: Record<string, unknown> = {
  'club.name': 'Game Club',
  'club.currency': 'UZS',
  'session.lateGraceSeconds': 0,
};

@Injectable()
export class SettingsService {
  constructor(
    @InjectRepository(Setting)
    private readonly settings: Repository<Setting>,
  ) {}

  async getAll(): Promise<Record<string, unknown>> {
    const rows = await this.settings.find();
    const merged: Record<string, unknown> = { ...DEFAULTS };
    for (const row of rows) {
      merged[row.key] = row.value;
    }
    return merged;
  }

  async get<T = unknown>(key: string): Promise<T | undefined> {
    const row = await this.settings.findOne({ where: { key } });
    return (row?.value as T) ?? (DEFAULTS[key] as T | undefined);
  }

  async set(key: string, value: unknown, updatedBy: string): Promise<Setting> {
    const existing = await this.settings.findOne({ where: { key } });
    if (existing) {
      existing.value = value;
      existing.updatedBy = updatedBy;
      return this.settings.save(existing);
    }
    return this.settings.save(this.settings.create({ key, value, updatedBy }));
  }
}
