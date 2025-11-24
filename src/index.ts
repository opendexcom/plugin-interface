import { DynamicModule, INestApplication } from '@nestjs/common';

/**
 * Interface that all FormulAI plugins must implement
 */
export interface FormulAIPlugin {
    /**
     * Plugin metadata
     */
    name: string;
    version: string;
    description?: string;

    /**
     * Return a NestJS dynamic module to be imported
     * This method is called during application bootstrap
     */
    register(): DynamicModule | Promise<DynamicModule>;

    /**
     * Optional: Initialize plugin after app bootstrap
     * Use for setting up middleware, global filters, etc.
     */
    onApplicationBootstrap?(app: INestApplication): Promise<void>;

    /**
     * Optional: Cleanup on app shutdown
     */
    onApplicationShutdown?(): Promise<void>;
}

/**
 * Plugin configuration from environment
 */
export interface PluginConfig {
    enabled: boolean;
    options?: Record<string, any>;
}
