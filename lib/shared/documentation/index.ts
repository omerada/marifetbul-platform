/* eslint-disable no-console */
/**
 * Production Documentation System
 *
 * Bu modül otomatik dokümantasyon oluşturma ve yönetim altyapısı sağlar:
 * - API documentation generation
 * - Component documentation
 * - Architecture documentation
 * - Deployment guides
 */

// Documentation Types
export interface ApiDocumentation {
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  description: string;
  parameters?: ApiParameter[];
  requestBody?: ApiRequestBody;
  responses: ApiResponse[];
  examples?: ApiExample[];
  authentication?: AuthenticationRequirement;
  tags?: string[];
}

export interface ApiParameter {
  name: string;
  in: 'path' | 'query' | 'header' | 'cookie';
  description: string;
  required: boolean;
  type: string;
  format?: string;
  example?: unknown;
}

export interface ApiRequestBody {
  description: string;
  contentType: string;
  schema: Record<string, unknown>;
  example?: unknown;
}

export interface ApiResponse {
  status: number;
  description: string;
  contentType?: string;
  schema?: Record<string, unknown>;
  example?: unknown;
}

export interface ApiExample {
  name: string;
  description: string;
  request: {
    url: string;
    method: string;
    headers?: Record<string, string>;
    body?: unknown;
  };
  response: {
    status: number;
    headers?: Record<string, string>;
    body: unknown;
  };
}

export interface AuthenticationRequirement {
  type: 'bearer' | 'apikey' | 'oauth2' | 'basic';
  description: string;
  location?: 'header' | 'query' | 'cookie';
  name?: string;
}

export interface ComponentDocumentation {
  name: string;
  description: string;
  category: 'ui' | 'layout' | 'form' | 'business' | 'shared';
  props?: ComponentProp[];
  examples?: ComponentExample[];
  dependencies?: string[];
  usage?: string;
}

export interface ComponentProp {
  name: string;
  type: string;
  description: string;
  required: boolean;
  defaultValue?: unknown;
  example?: unknown;
}

export interface ComponentExample {
  name: string;
  description: string;
  code: string;
  preview?: string;
}

// Documentation Generator
export class DocumentationGenerator {
  private apiDocs: Map<string, ApiDocumentation> = new Map();
  private componentDocs: Map<string, ComponentDocumentation> = new Map();

  // API Documentation Methods
  registerApiEndpoint(doc: ApiDocumentation): void {
    const key = `${doc.method} ${doc.endpoint}`;
    this.apiDocs.set(key, doc);
  }

  generateOpenApiSpec(): Record<string, unknown> {
    const spec = {
      openapi: '3.0.0',
      info: {
        title: 'Marifet API',
        version: '1.0.0',
        description: 'Freelancer platform API documentation',
      },
      servers: [
        {
          url: 'https://api.marifetbul.com',
          description: 'Production server',
        },
        {
          url: 'https://staging-api.marifetbul.com',
          description: 'Staging server',
        },
      ],
      paths: {} as Record<string, unknown>,
      components: {
        schemas: {},
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
          apiKeyAuth: {
            type: 'apiKey',
            in: 'header',
            name: 'X-API-Key',
          },
        },
      },
    };

    // Generate paths from registered endpoints
    this.apiDocs.forEach((doc) => {
      const path = doc.endpoint;
      const method = doc.method.toLowerCase();

      if (!spec.paths[path]) {
        spec.paths[path] = {};
      }

      (spec.paths[path] as Record<string, unknown>)[method] = {
        summary: doc.description,
        tags: doc.tags || [],
        parameters: doc.parameters?.map((param) => ({
          name: param.name,
          in: param.in,
          description: param.description,
          required: param.required,
          schema: {
            type: param.type,
            format: param.format,
            example: param.example,
          },
        })),
        requestBody: doc.requestBody
          ? {
              description: doc.requestBody.description,
              content: {
                [doc.requestBody.contentType]: {
                  schema: doc.requestBody.schema,
                  example: doc.requestBody.example,
                },
              },
            }
          : undefined,
        responses: doc.responses.reduce(
          (acc, response) => {
            acc[response.status] = {
              description: response.description,
              content: response.contentType
                ? {
                    [response.contentType]: {
                      schema: response.schema,
                      example: response.example,
                    },
                  }
                : undefined,
            };
            return acc;
          },
          {} as Record<string, unknown>
        ),
        security: doc.authentication
          ? [
              {
                [doc.authentication.type === 'bearer'
                  ? 'bearerAuth'
                  : 'apiKeyAuth']: [],
              },
            ]
          : undefined,
      };
    });

    return spec;
  }

  // Component Documentation Methods
  registerComponent(doc: ComponentDocumentation): void {
    this.componentDocs.set(doc.name, doc);
  }

  generateComponentDocs(): Record<string, ComponentDocumentation> {
    const docs: Record<string, ComponentDocumentation> = {};

    this.componentDocs.forEach((doc, name) => {
      docs[name] = doc;
    });

    return docs;
  }

  // Generate comprehensive documentation
  generateFullDocumentation(): {
    api: Record<string, unknown>;
    components: Record<string, ComponentDocumentation>;
    timestamp: string;
    version: string;
  } {
    return {
      api: this.generateOpenApiSpec(),
      components: this.generateComponentDocs(),
      timestamp: new Date().toISOString(),
      version: '1.0.0',
    };
  }

  // Export documentation to files
  async exportDocumentation(outputDir: string): Promise<void> {
    this.generateFullDocumentation();

    // This would write files in a real implementation
    // Note: console.log kept here as this is a development/build-time tool
    if (process.env.NODE_ENV === 'development') {
      console.log('Documentation generated:', {
        apiEndpoints: this.apiDocs.size,
        components: this.componentDocs.size,
        outputDir,
      });
    }
  }
}

// Documentation Decorators/Helpers
export function documentApi(
  doc: Omit<ApiDocumentation, 'endpoint' | 'method'>
) {
  return function (
    target: unknown,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    // Extract endpoint and method from target
    const targetObj = target as Record<string, unknown>;
    const endpoint = (targetObj.endpoint as string) || '/unknown';
    const method = (targetObj.method as string) || 'GET';

    const generator = documentationGenerator;
    generator.registerApiEndpoint({
      ...doc,
      endpoint,
      method: method as ApiDocumentation['method'],
    });

    return descriptor;
  };
}

export function documentComponent(doc: ComponentDocumentation) {
  return function <T extends new (...args: unknown[]) => object>(
    constructor: T
  ) {
    const generator = documentationGenerator;
    generator.registerComponent(doc);

    return constructor;
  };
}

// Built-in API Documentation Examples
export const apiDocumentationExamples = {
  // Authentication APIs
  login: {
    endpoint: '/api/auth/login',
    method: 'POST' as const,
    description: 'User login endpoint',
    tags: ['Authentication'],
    requestBody: {
      description: 'Login credentials',
      contentType: 'application/json',
      schema: {
        type: 'object',
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string', minLength: 6 },
        },
        required: ['email', 'password'],
      },
      example: {
        email: 'user@example.com',
        password: 'password123',
      },
    },
    responses: [
      {
        status: 200,
        description: 'Login successful',
        contentType: 'application/json',
        schema: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                token: { type: 'string' },
                user: { type: 'object' },
              },
            },
          },
        },
        example: {
          success: true,
          data: {
            token: 'eyJhbGciOiJIUzI1NiIs...',
            user: {
              id: 'user-123',
              email: 'user@example.com',
              name: 'John Doe',
            },
          },
        },
      },
      {
        status: 401,
        description: 'Invalid credentials',
        contentType: 'application/json',
        schema: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            error: {
              type: 'object',
              properties: {
                message: { type: 'string' },
                code: { type: 'string' },
              },
            },
          },
        },
        example: {
          success: false,
          error: {
            message: 'Invalid email or password',
            code: 'INVALID_CREDENTIALS',
          },
        },
      },
    ],
    examples: [
      {
        name: 'Successful login',
        description: 'Example of successful user login',
        request: {
          url: '/api/auth/login',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: {
            email: 'john@example.com',
            password: 'securepassword',
          },
        },
        response: {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
          body: {
            success: true,
            data: {
              token: 'eyJhbGciOiJIUzI1NiIs...',
              user: {
                id: 'user-123',
                email: 'john@example.com',
                name: 'John Doe',
                role: 'freelancer',
              },
            },
          },
        },
      },
    ],
  },

  // Jobs API
  getJobs: {
    endpoint: '/api/jobs',
    method: 'GET' as const,
    description: 'Get list of jobs with pagination and filtering',
    tags: ['Jobs'],
    parameters: [
      {
        name: 'page',
        in: 'query' as const,
        description: 'Page number for pagination',
        required: false,
        type: 'integer',
        example: 1,
      },
      {
        name: 'limit',
        in: 'query' as const,
        description: 'Number of items per page',
        required: false,
        type: 'integer',
        example: 20,
      },
      {
        name: 'category',
        in: 'query' as const,
        description: 'Filter by job category',
        required: false,
        type: 'string',
        example: 'web-development',
      },
      {
        name: 'search',
        in: 'query' as const,
        description: 'Search query for job titles and descriptions',
        required: false,
        type: 'string',
        example: 'react developer',
      },
    ],
    responses: [
      {
        status: 200,
        description: 'Jobs retrieved successfully',
        contentType: 'application/json',
        schema: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'array',
              items: { type: 'object' },
            },
            meta: {
              type: 'object',
              properties: {
                pagination: { type: 'object' },
              },
            },
          },
        },
      },
    ],
  },
};

// Component Documentation Examples
export const componentDocumentationExamples = {
  Button: {
    name: 'Button',
    description: 'Reusable button component with multiple variants and states',
    category: 'ui' as const,
    props: [
      {
        name: 'variant',
        type: "'primary' | 'secondary' | 'outline' | 'ghost'",
        description: 'Visual style variant of the button',
        required: false,
        defaultValue: 'primary',
        example: 'primary',
      },
      {
        name: 'size',
        type: "'sm' | 'md' | 'lg'",
        description: 'Size of the button',
        required: false,
        defaultValue: 'md',
        example: 'md',
      },
      {
        name: 'disabled',
        type: 'boolean',
        description: 'Whether the button is disabled',
        required: false,
        defaultValue: false,
        example: false,
      },
      {
        name: 'loading',
        type: 'boolean',
        description: 'Whether the button is in loading state',
        required: false,
        defaultValue: false,
        example: false,
      },
      {
        name: 'onClick',
        type: '() => void',
        description: 'Click handler function',
        required: false,
        example: '() => console.log("clicked")',
      },
    ],
    examples: [
      {
        name: 'Primary Button',
        description: 'Default primary button',
        code: '<Button variant="primary">Click me</Button>',
      },
      {
        name: 'Loading Button',
        description: 'Button in loading state',
        code: '<Button loading>Loading...</Button>',
      },
      {
        name: 'Disabled Button',
        description: 'Disabled button',
        code: '<Button disabled>Disabled</Button>',
      },
    ],
    usage: `
import { Button } from '@/components/ui/Button';

export function MyComponent() {
  return (
    <Button 
      variant="primary" 
      size="md"
      onClick={() => console.log('clicked')}
    >
      Click me
    </Button>
  );
}
    `,
  },

  MessageList: {
    name: 'MessageList',
    description:
      'Component for displaying a list of messages in a conversation',
    category: 'business' as const,
    props: [
      {
        name: 'messages',
        type: 'Message[]',
        description: 'Array of message objects to display',
        required: true,
        example: '[{ id: "1", content: "Hello", senderId: "user1" }]',
      },
      {
        name: 'currentUserId',
        type: 'string',
        description: 'ID of the current user for message alignment',
        required: true,
        example: 'user1',
      },
      {
        name: 'onMessageSelect',
        type: '(messageId: string) => void',
        description: 'Callback when a message is selected',
        required: false,
        example: '(id) => console.log("selected:", id)',
      },
    ],
    dependencies: ['Message', 'User'],
    examples: [
      {
        name: 'Basic Message List',
        description: 'Simple message list with basic messages',
        code: `
<MessageList 
  messages={messages}
  currentUserId="user1"
  onMessageSelect={(id) => console.log(id)}
/>
        `,
      },
    ],
  },
};

// Singleton instance
class DocumentationGeneratorSingleton extends DocumentationGenerator {
  private static instance: DocumentationGeneratorSingleton;

  static getInstance(): DocumentationGeneratorSingleton {
    if (!DocumentationGeneratorSingleton.instance) {
      DocumentationGeneratorSingleton.instance =
        new DocumentationGeneratorSingleton();
    }
    return DocumentationGeneratorSingleton.instance;
  }

  private constructor() {
    super();
    // Initialize with built-in examples
    Object.values(apiDocumentationExamples).forEach((doc) => {
      this.registerApiEndpoint(doc);
    });

    Object.values(componentDocumentationExamples).forEach((doc) => {
      this.registerComponent(doc);
    });
  }
}

// Initialize and export
export const documentationGenerator =
  DocumentationGeneratorSingleton.getInstance();

// Quick access functions
export function getApiDocumentation() {
  return documentationGenerator.generateOpenApiSpec();
}

export function getComponentDocumentation() {
  return documentationGenerator.generateComponentDocs();
}

export function getAllDocumentation() {
  return documentationGenerator.generateFullDocumentation();
}
