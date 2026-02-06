export type RegisteredSchema = unknown;

export interface SchemaDefinition<S = RegisteredSchema> {
    name: string;
    schema: S;
}

const schemaRegistry = new Map<string, RegisteredSchema>();

export function registerSchema<S = RegisteredSchema>(name: string, schema: S): S {
    if (!name || typeof name !== 'string') {
        throw new Error('Schema name must be a non-empty string.');
    }

    const existingSchema = schemaRegistry.get(name);

    if (existingSchema !== undefined) {
        if (existingSchema === schema) {
            return schema;
        }

        throw new Error(`Schema \"${name}\" is already registered.`);
    }

    schemaRegistry.set(name, schema as RegisteredSchema);

    return schema;
}

export function registerSchemas<S = RegisteredSchema>(definitions: Array<SchemaDefinition<S>>): Array<SchemaDefinition<S>> {
    for (const definition of definitions) {
        registerSchema(definition.name, definition.schema);
    }

    return definitions;
}

export function getSchema<S = RegisteredSchema>(name: string): S | undefined {
    return schemaRegistry.get(name) as S | undefined;
}

export function getSchemaOrThrow<S = RegisteredSchema>(name: string): S {
    const schema = getSchema<S>(name);

    if (schema === undefined) {
        throw new Error(`Schema \"${name}\" is not registered.`);
    }

    return schema;
}

export function getAllSchemas<S = RegisteredSchema>(): Record<string, S> {
    return Object.fromEntries(schemaRegistry.entries()) as Record<string, S>;
}

export function hasSchema(name: string): boolean {
    return schemaRegistry.has(name);
}

export function clearSchemaRegistry(): void {
    schemaRegistry.clear();
}
