import { SettingsService } from './settings.service';
import { UpdateSettingDto } from './dto/update-setting.dto';
import { AuthenticatedUser } from '../../common/decorators/current-user.decorator';
export declare class SettingsController {
    private readonly settings;
    constructor(settings: SettingsService);
    getAll(): Promise<Record<string, unknown>>;
    set(dto: UpdateSettingDto, user: AuthenticatedUser): Promise<import("./entities/setting.entity").Setting>;
}
