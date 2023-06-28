import scheduler from 'node-schedule';
import Logger from '@ioc:Adonis/Core/Logger';
import { runImport } from '../../commands/FinTs';

scheduler.scheduleJob('55,33 * * * *', async function () {
    runImport()
});

Logger.info('Started scheduler for FinTS');
