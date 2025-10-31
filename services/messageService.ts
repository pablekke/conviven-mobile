import { Message } from "../types/message";
import { resilientRequest } from "./apiClient";
import { API } from "@/constants";
import { HttpError } from "./http";
import { HttpMethod } from "@/core/enums/http.enums";

const MIN_MESSAGE_LENGTH = 1;
const MAX_MESSAGE_LENGTH = 1000;

function mapMessage(payload: any): Message {
  if (!payload || typeof payload !== "object") {
    throw new Error("Respuesta de mensaje inválida");
  }

  return {
    id: String(payload.id ?? ""),
    conversationId: String(payload.conversationId ?? payload.conversation_id ?? ""),
    senderId: String(payload.senderId ?? payload.sender_id ?? ""),
    content: String(payload.content ?? ""),
    createdAt: String(payload.createdAt ?? payload.created_at ?? ""),
    updatedAt: String(payload.updatedAt ?? payload.updated_at ?? payload.createdAt ?? ""),
  };
}

function validateMessageContent(content: string): string {
  const normalized = content?.trim();

  if (!normalized || normalized.length < MIN_MESSAGE_LENGTH) {
    throw new HttpError(400, "El mensaje debe tener al menos un carácter", null);
  }

  if (normalized.length > MAX_MESSAGE_LENGTH) {
    throw new HttpError(400, "El mensaje no puede superar los 1000 caracteres", null);
  }

  return normalized;
}

export default class MessageService {
  static async listConversation(userId: string): Promise<Message[]> {
    if (!userId) {
      throw new Error("Se requiere el identificador del usuario para obtener la conversación");
    }

    const data = await resilientRequest<any[]>({
      endpoint: `${API.MESSAGES}/${userId}`,
      method: HttpMethod.GET,
      useCache: true,
    });

    if (!Array.isArray(data)) {
      throw new Error("Formato de mensajes inesperado");
    }

    return data.map(mapMessage);
  }

  static async sendMessage(userId: string, content: string): Promise<Message> {
    if (!userId) {
      throw new Error("Se requiere el identificador del usuario para enviar un mensaje");
    }

    const normalizedContent = validateMessageContent(content);
    const data = await resilientRequest<any>({
      endpoint: `${API.MESSAGES}/${userId}`,
      method: HttpMethod.POST,
      headers: {
        "Content-Type": "application/json",
      },
      body: { content: normalizedContent },
      allowQueue: true,
    });
    return mapMessage(data);
  }
}
