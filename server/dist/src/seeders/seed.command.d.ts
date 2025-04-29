import { CommandRunner } from 'nest-commander';
import { SeederService } from './seeder.service';
export declare class SeedCommand extends CommandRunner {
    private readonly seederService;
    constructor(seederService: SeederService);
    run(): Promise<void>;
}
