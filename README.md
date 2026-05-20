# @opendexcom/plugin-interface

Shared interface definitions for FormulAI plugins. This package ensures consistency across all plugins in the FormulAI ecosystem.

## Installation

```bash
npm install @opendexcom/plugin-interface
```

## Usage

Implement the `FormulAIPlugin` interface in your plugin class:

```typescript
import { DynamicModule, INestApplication } from '@nestjs/common';
import { FormulAIPlugin } from '@opendexcom/plugin-interface';

export class MyPlugin implements FormulAIPlugin {
  name = 'my-plugin';
  version = '1.0.0';
  description = 'My awesome plugin';

  async register(): Promise<DynamicModule> {
    return {
      module: MyPluginModule,
      imports: [],
      providers: [],
      exports: [],
    };
  }

  async onApplicationBootstrap(app: INestApplication): Promise<void> {
    // Optional: Setup middleware, global filters, etc.
  }
}
```

## API Reference

### `FormulAIPlugin`

The core interface that all plugins must implement.

| Property/Method | Type | Description |
|----------------|------|-------------|
| `name` | `string` | Unique name of the plugin |
| `version` | `string` | Semantic version of the plugin |
| `description` | `string` | (Optional) Brief description |
| `register()` | `() => DynamicModule \| Promise<DynamicModule>` | Returns the NestJS module to be imported |
| `contribute()` | `(registry: PluginContributionRegistry) => void \| Promise<void>` | (Optional) Register cross-cutting hooks during plugin load |
| `onApplicationBootstrap` | `(app: INestApplication) => Promise<void>` | (Optional) Lifecycle hook called after app bootstrap |
| `onApplicationShutdown` | `() => Promise<void>` | (Optional) Lifecycle hook called on shutdown |

### Registration extensions

Plugins can validate or augment user registration via `RegistrationExtension`:

```typescript
import {
  RegistrationExtension,
  PLUGIN_CONTRIBUTION_REGISTRY,
  PluginContributionRegistry,
} from '@opendexcom/plugin-interface';

// During onApplicationBootstrap (when Nest DI is available):
const registry = app.get<PluginContributionRegistry>(PLUGIN_CONTRIBUTION_REGISTRY);
registry.addRegistrationExtension(myExtension);
```

The OSS host runs all extensions in `AuthService.register()` before and after user creation.

### `PluginConfig`

Configuration structure for plugins.

```typescript
export interface PluginConfig {
    enabled: boolean;
    options?: Record<string, any>;
}
```

### Schema Registry

Runtime-safe, shared schema registry for OSS core and plugins. Schemas are resolved by **name** at runtime so core and plugins stay decoupled (no direct schema imports across packages).

**Who registers what**

- **OSS core** registers its schemas (User, Form, Response, etc.) before any plugin is loaded.
- **Plugins that define models** (e.g. billing, usage-tracking) must register their schemas when building their module so other plugins (e.g. admin) can consume them by name.
- **Plugins that only use existing models** (e.g. admin) consume schemas via `getSchema` / `getSchemaOrThrow`; they do not register.

**Load order**

Schema-providing plugins are loaded before schema-consuming plugins (e.g. admin loads last). List plugins in `PLUGINS` with providers first: `PLUGINS=billing,usage-tracking,admin`.

**Register and use in one step** (requires `@nestjs/mongoose`):

```typescript
import { registerSchemaWithRegistry } from '@opendexcom/plugin-interface';

@Module({
  imports: [
    registerSchemaWithRegistry([
      { name: Subscription.name, schema: SubscriptionSchema },
      { name: BillingEvent.name, schema: BillingEventSchema },
    ]),
  ],
})
export class BillingModule {}
```

**Consume by name:**

```typescript
import { getSchemaOrThrow } from '@opendexcom/plugin-interface';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'User', schema: getSchemaOrThrow('User') },
      { name: 'Subscription', schema: getSchemaOrThrow('Subscription') },
    ]),
  ],
})
export class AdminModule {}
```

Available helpers:

- `registerSchema(name, schema)` - Registers a schema once by model name. Throws if another schema is already registered under the same name.
- `registerSchemas([{ name, schema }])` - Registers multiple schemas.
- `registerSchemaWithRegistry([{ name, schema }, ...])` - Registers and returns `MongooseModule.forFeature(...)` in one step (requires `@nestjs/mongoose`).
- `getSchema(name)` - Returns schema or `undefined`.
- `getSchemaOrThrow(name)` - Returns schema or throws if missing.
- `hasSchema(name)` - Returns `true` if schema exists.
- `getAllSchemas()` - Returns object map of all registered schemas.
- `clearSchemaRegistry()` - Clears registry (mainly for tests).

## Publishing to npm

Package is published as **`@opendexcom/plugin-interface`** on [registry.npmjs.org](https://www.npmjs.com/package/@opendexcom/plugin-interface).

### One-time setup

1. Create an [npm access token](https://www.npmjs.com/settings/~your-user/tokens) (type: **Automation** or **Publish**).
2. Ensure your npm user is a member of the **`@opendexcom`** org with publish rights.
3. For CI: add the token as repository secret **`NPM_TOKEN`** on `opendexcom/plugin-interface`.

### Publish locally

**Option A — npm login**

```bash
npm login
npm whoami   # must be a maintainer (see npm owner ls @opendexcom/plugin-interface)
npm publish --access public
```

**Option B — access token (`NPM_TOKEN`)**

`export NPM_TOKEN=...` alone does **not** authenticate npm. The repo `.npmrc` maps the env var to the registry:

```bash
export NPM_TOKEN=npm_xxxxxxxx   # Automation or Granular token with publish rights
npm whoami                      # must succeed before publish
cd plugin-interface
npm publish --access public
```

If `npm whoami` works but publish still returns **404**, your token’s user is not a maintainer on `@opendexcom/plugin-interface` (add via `npm owner add` from the `dexrafi` account).

Bump `version` in `package.json` before each release (CI also requires a version bump on every merge to `main`).

### Publish via GitHub Actions

Push to `main` or run the **Publish Plugin Interface** workflow manually (`workflow_dispatch`). The workflow uses `secrets.NPM_TOKEN` and publishes to the public npm registry.
