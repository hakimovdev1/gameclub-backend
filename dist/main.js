"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("./polyfills");
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const swagger_1 = require("@nestjs/swagger");
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule, {
        bufferLogs: false,
    });
    const config = app.get(config_1.ConfigService);
    const logger = new common_1.Logger('Bootstrap');
    app.getHttpAdapter().getInstance().set('trust proxy', config.get('app.trustProxy') ?? 1);
    app.use((0, helmet_1.default)());
    app.use((0, compression_1.default)());
    app.use((0, cookie_parser_1.default)());
    app.enableCors({
        origin: config.get('app.corsOrigins'),
        credentials: true,
    });
    app.setGlobalPrefix(config.get('app.apiPrefix') ?? 'api');
    app.enableVersioning({
        type: common_1.VersioningType.URI,
        defaultVersion: config.get('app.defaultVersion') ?? '1',
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: { enableImplicitConversion: false },
    }));
    app.enableShutdownHooks();
    const swaggerConfig = new swagger_1.DocumentBuilder()
        .setTitle('Game Club Management API')
        .setDescription('Computer control and deterministic, integer-based money handling ' +
        'for a game club: rooms, computers, sessions, customers, debt ' +
        'ledger, analytics and audit.')
        .setVersion('1.0')
        .addBearerAuth()
        .addCookieAuth('access_token')
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, swaggerConfig);
    swagger_1.SwaggerModule.setup('docs', app, document, {
        swaggerOptions: { persistAuthorization: true },
    });
    const port = config.get('app.port') ?? 4040;
    await app.listen(port, '0.0.0.0');
    logger.log(`API ready on http://localhost:${port}/api/v1`);
    logger.log(`Swagger docs on http://localhost:${port}/docs`);
}
void bootstrap();
//# sourceMappingURL=main.js.map