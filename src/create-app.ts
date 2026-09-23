import { NestFactory, Reflector } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { ResponseInterceptor } from './interceptor/response.interceptor';
import { join } from 'path';

export async function createApp(): Promise<NestExpressApplication> {
    const app = await NestFactory.create<NestExpressApplication>(AppModule);

    // Serve everything in /public as static files (e.g. GET /logo.png)
    app.useStaticAssets(join(__dirname, '..', 'public'));
    app.useGlobalPipes(
        new ValidationPipe({
            transform: true,
            transformOptions: {
                exposeDefaultValues: true,
            },
        })
    );
    app.use(cookieParser());
    app.enableCors({
        origin: [
            'http://localhost:5173',
            'http://localhost:3001',
            process.env.FRONTEND_URL || 'http://localhost:8000',
        ],
        credentials: true,
    });

    // response interceptor
    app.useGlobalInterceptors(new ResponseInterceptor(app.get(Reflector)));

    // for swagger
    const config = new DocumentBuilder()
        .setTitle('IEEE Backend API')
        .setDescription(
            'IEEE Documentation presented by backend team with lots of kisses for you 😘'
        )
        .setVersion('1.0')
        .addBearerAuth({
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
            name: 'JWT',
            description: 'Enter JWT token',
            in: 'header',
        });

    const swagger_server_url = process.env.BACKEND_URL;
    if (swagger_server_url) {
        config.addServer(swagger_server_url);
    }
    const config_document = config.build();

    const document = SwaggerModule.createDocument(app, config_document);
    SwaggerModule.setup('api-docs', app, document);

    return app;
}
