import { plainToInstance } from 'class-transformer';
import { IsEnum, IsNumber, IsString, validateSync } from 'class-validator';

enum Environment {
    Development = 'development',
    Production = 'production',
    Test = 'test',
}

class EnvironmentVariables {
    @IsEnum(Environment)
    NODE_ENV!: Environment;

    @IsNumber()
    PORT!: number;

    @IsString()
    STRIPE_SECRET_KEY!: string;

    @IsString()
    STRIPE_WEBHOOK_SECRET!: string;

    @IsString()
    ORDER_SERVICE_URL!: string;

    @IsString()
    CORS_ORIGIN!: string;
}

export function validate(config: Record<string, unknown>) {
    const validatedConfig = plainToInstance(
        EnvironmentVariables,
        config,
        { enableImplicitConversion: true },
    );
    const errors = validateSync(validatedConfig, { skipMissingProperties: false });

    if (errors.length > 0) {
        throw new Error(errors.toString());
    }
    return validatedConfig;
}
