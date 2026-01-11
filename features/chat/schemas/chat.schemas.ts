import { z } from "zod";

const uuidSchema = z.string();
const contentSchema = z
  .string()
  .min(1, "El mensaje no puede estar vacío")
  .max(1000, "El mensaje no puede exceder los 1000 caracteres")
  .trim();

export const sendMessageSchema = z.object({
  recipientId: uuidSchema,
  content: contentSchema,
});

export const incomingMessageSchema = z.object({
  type: z.literal("MESSAGE").default("MESSAGE"),
  id: uuidSchema,
  conversationId: uuidSchema,
  senderId: z.string(),
  content: z.string(),
  status: z.string(),
  liked: z.boolean().default(false),
  deliveredAt: z
    .string()
    .nullable()
    .optional()
    .transform(val => val ?? null),
  readAt: z
    .string()
    .nullable()
    .optional()
    .transform(val => val ?? null),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const messageStatusUpdateSchema = z.object({
  type: z.literal("MESSAGE_STATUS_UPDATE"),
  messageId: z.union([uuidSchema, z.literal("ALL")]).optional(),
  conversationId: uuidSchema.optional(),
  status: z.string(),
});

export const markAsReadAckSchema = z.object({
  type: z.literal("MARK_AS_READ_ACK"),
  conversationId: uuidSchema,
  affectedCount: z.number().optional(),
});

export const wsIncomingPayloadSchema = z.discriminatedUnion("type", [
  incomingMessageSchema.extend({ type: z.literal("MESSAGE") }),
  messageStatusUpdateSchema,
  markAsReadAckSchema,
]);

export const webSocketErrorSchema = z.object({
  error: z.string(),
  details: z
    .array(
      z.object({
        field: z.string(),
        message: z.string(),
      }),
    )
    .optional(),
});

export type wsIncomingPayload = z.infer<typeof wsIncomingPayloadSchema>;
export type SendMessageSchema = z.infer<typeof sendMessageSchema>;
export type IncomingMessageSchema = z.infer<typeof incomingMessageSchema>;
export type MessageStatusUpdateSchema = z.infer<typeof messageStatusUpdateSchema>;
