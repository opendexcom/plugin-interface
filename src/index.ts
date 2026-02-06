import { DynamicModule, INestApplication } from '@nestjs/common';

/**
 * Context passed by the host to every plugin at register() time.
 * Contains references to the host's schema registry so all plugins
 * share a single registry instance regardless of module resolution.
 */
export interface PluginContext {
    schemaRegistry: {
        register<S = unknown>(name: string, schema: S): S;
        get<S = unknown>(name: string): S | undefined;
        getOrThrow<S = unknown>(name: string): S;
        has(name: string): boolean;
    };
}

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
     * Return a NestJS dynamic module to be imported.
     * This method is called during application bootstrap.
     *
     * @param context – host-provided context containing the shared schema
     *                  registry. Plugins MUST use context.schemaRegistry
     *                  instead of importing registry functions directly so
     *                  that all plugins and core share the same Map instance.
     */
    register(context?: PluginContext): DynamicModule | Promise<DynamicModule>;

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

export {
    clearSchemaRegistry,
    getAllSchemas,
    getSchema,
    getSchemaOrThrow,
    hasSchema,
    registerSchema,
    registerSchemas,
} from './schema-registry';

export { registerSchemaWithRegistry } from './schema-registry-mongoose';

export type {
    RegisteredSchema,
    SchemaDefinition,
} from './schema-registry';
