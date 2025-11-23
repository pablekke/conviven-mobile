// Enums de Sistema

export enum UserRole {
  USER = "USER",
  PROVIDER = "PROVIDER",
  ADMIN = "ADMIN",
}

export enum UserStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  SUSPENDED = "SUSPENDED",
  DISCARDED = "DISCARDED",
  DELETED = "DELETED",
}

export enum SwipeAction {
  LIKE = "LIKE",
  PASS = "PASS",
  SUPER_LIKE = "SUPER_LIKE",
}

export enum UnmatchReason {
  NOT_INTERESTED = "NOT_INTERESTED",
  FOUND_ROOMMATE = "FOUND_ROOMMATE",
  INAPPROPRIATE = "INAPPROPRIATE",
  SPAM = "SPAM",
  OTHER = "OTHER",
}

export enum MessageStatus {
  SENT = "sent",
  DELIVERED = "delivered",
  READ = "read",
}
