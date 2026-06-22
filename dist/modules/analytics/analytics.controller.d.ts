import { AnalyticsService } from './analytics.service';
import { AnalyticsQueryDto } from './dto/analytics-query.dto';
export declare class AnalyticsController {
    private readonly analytics;
    constructor(analytics: AnalyticsService);
    summary(query: AnalyticsQueryDto): Promise<import("./analytics.service").AnalyticsSummary>;
}
