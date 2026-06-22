import { plainToInstance } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
  MinLength,
  validateSync,
} from 'class-validator';

enum NodeEnv {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

/**
 * Schema for required environment variables. Boot fails fast if the
 * process is misconfigured, so we never run with half-valid settings.
 */
class EnvironmentVariables {
  @IsEnum(NodeEnv)
  @IsOptional()
  NODE_ENV: NodeEnv = NodeEnv.Development;

  @IsInt()
  @Min(1)
  @Max(65535)
  PORT: number;

  @IsString()
  DB_HOST: string;

  @IsInt()
  @Min(1)
  @Max(65535)
  DB_PORT: number;

  @IsString()
  DB_USERNAME: string;

  @IsString()
  DB_PASSWORD: string;

  @IsString()
  DB_DATABASE: string;

  @IsString()
  @MinLength(16)
  @IsOptional()
  JWT_ACCESS_SECRET?: string;

  @IsString()
  @MinLength(16)
  @IsOptional()
  JWT_REFRESH_SECRET?: string;
}

export function validateEnv(config: Record<string, unknown>) {
  const validated = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validated, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    const details = errors
      .map((e) => Object.values(e.constraints ?? {}).join(', '))
      .join('; ');
    throw new Error(`Invalid environment configuration: ${details}`);
  }

  // Production safety rails: never run with a default/weak JWT secret or
  // with TypeORM schema synchronisation enabled.
  if (validated.NODE_ENV === NodeEnv.Production) {
    const weak = (s?: string) =>
      !s || s.length < 32 || s.includes('change-me') || s.includes('dev-');
    if (weak(config.JWT_ACCESS_SECRET as string)) {
      throw new Error(
        'JWT_ACCESS_SECRET must be a strong (>=32 char) secret in production',
      );
    }
    if (weak(config.JWT_REFRESH_SECRET as string)) {
      throw new Error(
        'JWT_REFRESH_SECRET must be a strong (>=32 char) secret in production',
      );
    }
    if (String(config.DB_SYNCHRONIZE) === 'true') {
      throw new Error(
        'DB_SYNCHRONIZE must be false in production; use migrations instead',
      );
    }
  }

  return validated;
}
