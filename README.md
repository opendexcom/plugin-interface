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
| `onApplicationBootstrap` | `(app: INestApplication) => Promise<void>` | (Optional) Lifecycle hook called after app bootstrap |
| `onApplicationShutdown` | `() => Promise<void>` | (Optional) Lifecycle hook called on shutdown |

### `PluginConfig`

Configuration structure for plugins.

```typescript
export interface PluginConfig {
    enabled: boolean;
    options?: Record<string, any>;
}
```
