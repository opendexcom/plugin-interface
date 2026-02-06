import { MongooseModule } from '@nestjs/mongoose';
import { registerSchemas } from './schema-registry';
import type { SchemaDefinition } from './schema-registry';

/**
 * Registers schemas in the shared registry and returns MongooseModule.forFeature(...)
 * so they can be used in Nest module imports in one step.
 * Requires @nestjs/mongoose to be installed.
 */
export function registerSchemaWithRegistry(
    definitions: Array<SchemaDefinition>,
): ReturnType<typeof MongooseModule.forFeature> {
    registerSchemas(definitions);
    return MongooseModule.forFeature(
        definitions.map((d) => ({ name: d.name, schema: d.schema })),
    );
}
