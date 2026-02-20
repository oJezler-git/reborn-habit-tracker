// ----------------------------------------------------------------------------
// Enumerations
// ----------------------------------------------------------------------------

export enum TimeWindow {
  EARLY_MORNING = "EARLY_MORNING", // 06:00–09:00
  MORNING = "MORNING", // 09:00–12:00
  AFTERNOON = "AFTERNOON", // 12:00–17:00
  EVENING = "EVENING", // 17:00–21:00
  NIGHT = "NIGHT", // 21:00–23:59
  ANY = "ANY", // 06:00–23:59
}

export enum QualityRating {
  FAIL = 0,
  HARD = 1,
  GOOD = 2,
  EASY = 3,
}

export enum IntegrationMethod {
  EULER = "Euler",
  RK4 = "RK4",
}

export enum NotificationChannel {
  EMAIL = "email",
  PUSH = "push",
  IN_APP = "in-app",
}

export enum DayOfWeek {
  SUNDAY = 0,
  MONDAY = 1,
  TUESDAY = 2,
  WEDNESDAY = 3,
  THURSDAY = 4,
  FRIDAY = 5,
  SATURDAY = 6,
}

// ----------------------------------------------------------------------------
// User Preferences Schema
// ----------------------------------------------------------------------------

export interface SchedulingPreferences {
  dailyStartTime: string; // HH:mm format
  dailyEndTime: string; // HH:mm format
  timeSlotGranularity: 5 | 15 | 30; // minutes
}

export interface PredictionPreferences {
  coldStartThreshold: number; // days; [1, 30]
  recentWindowSize: number; // days; [3, 30]
  riskThreshold: number; // [0.0, 1.0]
}

export interface AdaptiveFrequencyPreferences {
  enableSM2: boolean;
  minInterval: number; // days; [1, 7]
  maxInterval: number; // days; [7, 365]
}

export interface SimulationPreferences {
  enabled: boolean;
  integrationMethod: IntegrationMethod;
  timeStep: number; // seconds; [0.01, 0.2]
}

export interface NotificationPreferences {
  enableInterventionAlerts: boolean;
  alertThreshold: number; // [0.0, 1.0]
  channels: NotificationChannel[];
}

export interface UserPreferences {
  scheduling: SchedulingPreferences;
  prediction: PredictionPreferences;
  adaptiveFrequency: AdaptiveFrequencyPreferences;
  simulation: SimulationPreferences;
  notifications: NotificationPreferences;
  [key: string]: any; // Allow additional UI-specific properties
}

// ----------------------------------------------------------------------------
// Core Domain Objects
// ----------------------------------------------------------------------------

export interface User {
  userID: string; // UUID format
  email: string; // Max 255 chars, valid email format
  passwordHash: string; // Bcrypt hash, min 60 chars
  timezone: string; // IANA timezone identifier
  preferences: UserPreferences;
  createdAt: string; // ISO 8601 DateTime
}

export interface Habit {
  habitID: string; // UUID format
  userID: string; // Foreign key to User
  name: string; // 1-100 chars
  duration: number; // Minutes; [5, 240]; multiple of 5
  priority: 1 | 2 | 3 | 4 | 5; // 1=lowest, 5=highest
  difficulty: 1 | 2 | 3 | 4 | 5; // 1=easiest, 5=hardest
  preferredTimeWindows: TimeWindow[];
  easinessFactor: number; // [1.3, 3.0]; SM-2 parameter
  interval: number; // Days; [1, 365]
  repetitions: number; // [0, ∞)
  streak: number; // [0, ∞)
  createdDate: string; // ISO 8601 Date (YYYY-MM-DD)
}

export interface FixedCommitment {
  commitmentID: string; // UUID format
  userID: string; // Foreign key to User
  startTime: number; // Minutes since midnight; [0, 1439]
  endTime: number; // Minutes since midnight; [0, 1439]
  dayOfWeek: DayOfWeek; // [0, 6]
  description?: string;
}

export interface CheckIn {
  checkInID: string; // UUID format
  habitID: string; // Foreign key to Habit
  date: string; // ISO 8601 Date (YYYY-MM-DD)
  success: boolean; // true=completed, false=missed
  qualityRating: QualityRating | null; // null if success=false
  timestamp: string; // ISO 8601 DateTime
}

export interface Schedule {
  scheduleID: string; // UUID format
  userID: string; // Foreign key to User
  date: string; // ISO 8601 Date (YYYY-MM-DD)
  slots: ScheduledSlot[]; // Max 50 slots
  generatedTimestamp: string; // ISO 8601 DateTime
}

export interface ScheduledSlot {
  slotID: string; // UUID format
  scheduleID: string; // Foreign key to Schedule
  habitID: string; // Foreign key to Habit
  startTime: number; // Minutes since midnight; [0, 1439]; multiple of 15
  endTime: number; // Minutes since midnight; [0, 1439]
}

export interface Prediction {
  predictionID: string; // UUID format
  habitID: string; // Foreign key to Habit
  date: string; // ISO 8601 Date (YYYY-MM-DD)
  failureProbability: number; // [0.0, 1.0]
  features: PredictionFeatures; // Feature vector for explainability
  computedAt: string; // ISO 8601 DateTime
}

export interface PredictionFeatures {
  x1: number; // Feature 1
  x2: number; // Feature 2
  x3: number; // Feature 3
  x4: number; // Feature 4
  x5: number; // Feature 5
  x6: number; // Feature 6
}

export interface SimulationSnapshot {
  snapshotID: string; // UUID format
  habitID: string; // Foreign key to Habit
  timestamp: string; // ISO 8601 DateTime
  radius: number; // [0.0, ∞)
  velocity: number; // (-∞, ∞)
  drag: number; // [0.0, 1.0]
  eventHorizonDistance: number; // [0.0, ∞); negative indicates crossed threshold
  interventionTriggered: boolean;
}

// ----------------------------------------------------------------------------
// API Request/Response Types
// ----------------------------------------------------------------------------

export interface CreateUserRequest {
  email: string;
  password: string;
  timezone?: string;
  preferences?: Partial<UserPreferences>;
}

export interface CreateHabitRequest {
  name: string;
  duration: number;
  priority?: 1 | 2 | 3 | 4 | 5;
  difficulty?: 1 | 2 | 3 | 4 | 5;
  preferredTimeWindows?: TimeWindow[];
}

export interface UpdateHabitRequest {
  name?: string;
  duration?: number;
  priority?: 1 | 2 | 3 | 4 | 5;
  difficulty?: 1 | 2 | 3 | 4 | 5;
  preferredTimeWindows?: TimeWindow[];
}

export interface CreateCheckInRequest {
  habitID: string;
  date: string;
  success: boolean;
  qualityRating?: QualityRating | null;
}

export interface GenerateScheduleRequest {
  date: string;
}

export interface GenerateScheduleResponse {
  schedule: Schedule;
  predictions: Prediction[];
}

// ----------------------------------------------------------------------------
// Validation Helper Types
// ----------------------------------------------------------------------------

export type UUID = string; // Format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
export type ISO8601Date = string; // Format: YYYY-MM-DD
export type ISO8601DateTime = string; // Format: YYYY-MM-DDTHH:mm:ss.sssZ
export type TimeFormat = string; // Format: HH:mm

// ----------------------------------------------------------------------------
// Type Guards
// ----------------------------------------------------------------------------

export function isTimeWindow(value: string): value is TimeWindow {
  return Object.values(TimeWindow).includes(value as TimeWindow);
}

export function isQualityRating(value: number): value is QualityRating {
  return value >= 0 && value <= 3 && Number.isInteger(value);
}

export function isIntegrationMethod(value: string): value is IntegrationMethod {
  return value === "Euler" || value === "RK4";
}

export function isNotificationChannel(
  value: string,
): value is NotificationChannel {
  return Object.values(NotificationChannel).includes(
    value as NotificationChannel,
  );
}

export function isDayOfWeek(value: number): value is DayOfWeek {
  return value >= 0 && value <= 6 && Number.isInteger(value);
}

// ----------------------------------------------------------------------------
// Validation Functions
// ----------------------------------------------------------------------------

export function validateTimeWindow(windows: TimeWindow[]): TimeWindow[] {
  if (windows.length === 0) return [TimeWindow.ANY];

  // Remove duplicates
  const unique = Array.from(new Set(windows));

  // "ANY" overrides all other values
  if (unique.includes(TimeWindow.ANY)) return [TimeWindow.ANY];

  return unique;
}

export function validateCheckIn(checkIn: Partial<CheckIn>): boolean {
  if (checkIn.success === false) {
    return (
      checkIn.qualityRating === null ||
      checkIn.qualityRating === QualityRating.FAIL
    );
  }
  if (checkIn.success === true && typeof checkIn.qualityRating === "number") {
    return checkIn.qualityRating >= 1 && checkIn.qualityRating <= 3;
  }
  return false;
}

export function validateSlotDuration(
  slot: ScheduledSlot,
  habit: Habit,
): boolean {
  return slot.endTime - slot.startTime === habit.duration;
}

export function validateNoSlotOverlap(slots: ScheduledSlot[]): boolean {
  for (let i = 0; i < slots.length; i++) {
    for (let j = i + 1; j < slots.length; j++) {
      const s1 = slots[i];
      const s2 = slots[j];
      // Check if slots overlap
      const noOverlap =
        s1.endTime <= s2.startTime || s2.endTime <= s1.startTime;
      if (!noOverlap) return false;
    }
  }
  return true;
}

// ----------------------------------------------------------------------------
// Default Values
// ----------------------------------------------------------------------------

export const DEFAULT_USER_PREFERENCES: UserPreferences = {
  scheduling: {
    dailyStartTime: "06:00",
    dailyEndTime: "23:00",
    timeSlotGranularity: 15,
  },
  prediction: {
    coldStartThreshold: 7,
    recentWindowSize: 7,
    riskThreshold: 0.8,
  },
  adaptiveFrequency: {
    enableSM2: true,
    minInterval: 1,
    maxInterval: 90,
  },
  simulation: {
    enabled: false,
    integrationMethod: IntegrationMethod.EULER,
    timeStep: 0.05,
  },
  notifications: {
    enableInterventionAlerts: true,
    alertThreshold: 0.8,
    channels: [NotificationChannel.IN_APP],
  },
};
