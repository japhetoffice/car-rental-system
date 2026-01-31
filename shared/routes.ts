import { z } from 'zod';
import { insertCarSchema, insertBookingSchema, cars, bookings } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
  unauthorized: z.object({
    message: z.string(),
  }),
};

export const api = {
  cars: {
    list: {
      method: 'GET' as const,
      path: '/api/cars',
      input: z.object({
        status: z.string().optional(),
        search: z.string().optional(),
      }).optional(),
      responses: {
        200: z.array(z.custom<typeof cars.$inferSelect>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/cars/:id',
      responses: {
        200: z.custom<typeof cars.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/cars',
      input: insertCarSchema,
      responses: {
        201: z.custom<typeof cars.$inferSelect>(),
        400: errorSchemas.validation,
        401: errorSchemas.unauthorized,
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/cars/:id',
      input: insertCarSchema.partial(),
      responses: {
        200: z.custom<typeof cars.$inferSelect>(),
        400: errorSchemas.validation,
        404: errorSchemas.notFound,
        401: errorSchemas.unauthorized,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/cars/:id',
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
        401: errorSchemas.unauthorized,
      },
    },
  },
  bookings: {
    list: {
      method: 'GET' as const,
      path: '/api/bookings',
      responses: {
        200: z.array(z.custom<typeof bookings.$inferSelect & { car: typeof cars.$inferSelect }>()), // Include car details
        401: errorSchemas.unauthorized,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/bookings',
      input: z.object({
        carId: z.number(),
        startDate: z.string(), // ISO string
        endDate: z.string(),   // ISO string
      }),
      responses: {
        201: z.custom<typeof bookings.$inferSelect>(),
        400: errorSchemas.validation,
        401: errorSchemas.unauthorized,
      },
    },
    updateStatus: {
      method: 'PATCH' as const,
      path: '/api/bookings/:id/status',
      input: z.object({ status: z.string() }),
      responses: {
        200: z.custom<typeof bookings.$inferSelect>(),
        400: errorSchemas.validation,
        404: errorSchemas.notFound,
        401: errorSchemas.unauthorized,
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
