import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { IncidentsService } from '../incidents/incidents.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const incidentsService = app.get(IncidentsService);
    const result = await incidentsService.backfillIncidentNumbers();
    console.log(
      `Backfill complete: assigned number to ${result.updated} incident(s). Max number is now ${result.maxNumber}.`,
    );
  } catch (error) {
    console.error('Error backfilling incident numbers:', error);
    process.exit(1);
  } finally {
    await app.close();
  }
}

bootstrap();
