import { plainToInstance } from 'class-transformer';
import { IsEnum, IsNumber, IsString, IsUrl, validateSync } from 'class-validator';

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
    JWT_SECRET!: string;

    @IsString()
    CORS_ORIGIN!: string;

    @IsUrl({ require_tld: false })
    CART_SERVICE_URL!: string;

    @IsUrl({ require_tld: false })
    ORDER_SERVICE_URL!: string;

    @IsUrl({ require_tld: false })
    PAYMENT_SERVICE_URL!: string;
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
