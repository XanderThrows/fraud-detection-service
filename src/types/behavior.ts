export interface BehaviorAnalysisRequest {
  userId: string;
  sessionId: string;
  typingSpeed: number; // characters per minute
  mouseMovement: number; // distance in pixels
  clickPattern: number[]; // milliseconds between clicks
  navigationTime: number; // seconds spent on sensitive page
  pagesVisited: string[]; // array of page names
}

export interface BehaviorAnalysisResponse {
  sessionId: string;
  intentRiskScore: number; // A score from 0.00 (low risk) to 1.00 (high risk)
  behaviorFlags: string[]; // Contextual flags
}

