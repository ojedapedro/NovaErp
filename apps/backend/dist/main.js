"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const app_module_js_1 = require("./app.module.js");
BigInt.prototype.toJSON = function () {
    return Number(this);
};
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_js_1.AppModule);
    const allowedOrigins = [
        'http://localhost:5173',
        'http://localhost:3000',
        process.env.FRONTEND_URL ?? '',
    ].filter(Boolean);
    app.enableCors({
        origin: (origin, callback) => {
            if (!origin)
                return callback(null, true);
            if (origin.endsWith('.vercel.app') || allowedOrigins.includes(origin)) {
                return callback(null, true);
            }
            return callback(new Error(`CORS bloqueado para origen: ${origin}`), false);
        },
        credentials: true,
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
    }));
    app.setGlobalPrefix('api');
    const config = new swagger_1.DocumentBuilder()
        .setTitle('NovaERP API')
        .setDescription('API REST del sistema ERP Fiscal Venezolano NovaERP')
        .setVersion('1.0')
        .addBearerAuth()
        .addTag('Autenticación')
        .addTag('Parametrización Fiscal')
        .addTag('Contabilidad')
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('api/docs', app, document, {
        swaggerOptions: { persistAuthorization: true },
    });
    const port = process.env.PORT ?? 4000;
    await app.listen(port);
    console.log(`🚀 NovaERP Backend corriendo en: http://localhost:${port}`);
    console.log(`📚 Documentación Swagger: http://localhost:${port}/api/docs`);
}
bootstrap();
//# sourceMappingURL=main.js.map