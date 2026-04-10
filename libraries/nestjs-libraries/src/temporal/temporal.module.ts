import { Global, Logger, Module } from '@nestjs/common';
import { TemporalModule, TemporalService } from 'nestjs-temporal-core';
import { socialIntegrationList } from '@gitroom/nestjs-libraries/integrations/integration.manager';

const logger = new Logger('Temporal');

const noopHandler = {
  get(_target: any, prop: string) {
    return () => {
      logger.warn(
        `Temporal not configured – ignoring call to client.${prop}()`
      );
      return undefined;
    };
  },
};

const temporalServiceStub: Partial<TemporalService> = {
  client: new Proxy({} as any, noopHandler),
  async terminateWorkflow() {
    logger.warn('Temporal not configured – ignoring terminateWorkflow()');
    return { workflowId: '', terminated: false } as any;
  },
  async getWorkflowHandle() {
    logger.warn('Temporal not configured – ignoring getWorkflowHandle()');
    return undefined as any;
  },
};

@Global()
@Module({
  providers: [{ provide: TemporalService, useValue: temporalServiceStub }],
  exports: [TemporalService],
})
class TemporalNoopModule {}

export const isTemporalEnabled = () => !!process.env.TEMPORAL_ADDRESS;

export const getTemporalModule = (
  isWorkers: boolean,
  path?: string,
  activityClasses?: any[]
) => {
  if (!isTemporalEnabled()) {
    return TemporalNoopModule;
  }

  return TemporalModule.register({
    isGlobal: true,
    connection: {
      address: process.env.TEMPORAL_ADDRESS!,
      ...process.env.TEMPORAL_TLS === 'true' ? {tls: true} : {},
      ...process.env.TEMPORAL_API_KEY ? {apiKey: process.env.TEMPORAL_API_KEY} : {},
      namespace: process.env.TEMPORAL_NAMESPACE || 'default',
    },
    taskQueue: 'main',
    logLevel: 'error',
    ...(isWorkers
      ? {
          workers: [
            { identifier: 'main', maxConcurrentJob: undefined },
            ...socialIntegrationList,
          ]
            .filter((f) => f.identifier.indexOf('-') === -1)
            .map((integration) => ({
              taskQueue: integration.identifier.split('-')[0],
              workflowsPath: path!,
              activityClasses: activityClasses!,
              autoStart: true,
              ...(integration.maxConcurrentJob
                ? {
                    workerOptions: {
                      maxConcurrentActivityTaskExecutions:
                        integration.maxConcurrentJob,
                    },
                  }
                : {}),
            })),
        }
      : {}),
  });
};
