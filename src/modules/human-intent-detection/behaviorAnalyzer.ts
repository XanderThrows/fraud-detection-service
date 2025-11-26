import { BehaviorAnalysisRequest, BehaviorAnalysisResponse } from '../../types/behavior';

/**
 * Human-Intent Detection Module
 * Analyzes user behavior patterns to determine if actions are being performed
 * by the legitimate user or under coercion/manipulation
 */
export class BehaviorAnalyzer {
  // Thresholds for normal behavior (can be configured)
  // Made more sensitive to detect anomalies earlier
  private readonly TYPING_SPEED_THRESHOLD_LOW = 180; // characters per minute (raised from 150)
  private readonly TYPING_SPEED_THRESHOLD_HIGH = 350; // lowered from 400
  private readonly MOUSE_MOVEMENT_THRESHOLD_LOW = 800; // pixels (raised from 500)
  private readonly MOUSE_MOVEMENT_THRESHOLD_HIGH = 2500; // lowered from 3000
  private readonly CLICK_PATTERN_VARIANCE_THRESHOLD = 150; // milliseconds (lowered from 200)
  private readonly NAVIGATION_TIME_THRESHOLD = 20; // seconds (lowered from 50 for more sensitivity)
  private readonly SENSITIVE_PAGES = ['transfer', 'confirmation', 'payment', 'withdrawal'];

  /**
   * Analyzes behavioral data and calculates intent risk score
   */
  public analyzeBehavior(request: BehaviorAnalysisRequest): BehaviorAnalysisResponse {
    const flags: string[] = [];
    let riskScore = 0.0;

    // Analyze typing speed
    const typingRisk = this.analyzeTypingSpeed(request.typingSpeed);
    if (typingRisk > 0) {
      flags.push('typing_slow');
      riskScore += typingRisk * 0.28; // Increased from 25% to 28% weight
    }

    // Analyze mouse movement
    const mouseRisk = this.analyzeMouseMovement(request.mouseMovement);
    if (mouseRisk > 0) {
      flags.push('unusual_mouse_pattern');
      riskScore += mouseRisk * 0.22; // Increased from 20% to 22% weight
    }

    // Analyze click patterns
    const clickRisk = this.analyzeClickPattern(request.clickPattern);
    if (clickRisk > 0) {
      flags.push('irregular_click_timing');
      riskScore += clickRisk * 0.22; // Increased from 20% to 22% weight
    }

    // Analyze navigation time on sensitive pages
    const navigationRisk = this.analyzeNavigationTime(
      request.navigationTime,
      request.pagesVisited
    );
    if (navigationRisk > 0) {
      flags.push('long_navigation_time');
      riskScore += navigationRisk * 0.28; // Increased from 25% to 28% weight
    }

    // Analyze page visit patterns
    const pageVisitRisk = this.analyzePageVisits(request.pagesVisited);
    if (pageVisitRisk > 0) {
      flags.push('unusual_page_sequence');
      riskScore += pageVisitRisk * 0.12; // Increased from 10% to 12% weight
    }

    // Ensure risk score is between 0.00 and 1.00
    riskScore = Math.min(1.0, Math.max(0.0, riskScore));

    return {
      sessionId: request.sessionId,
      intentRiskScore: Math.round(riskScore * 100) / 100, // Round to 2 decimal places
      behaviorFlags: flags,
    };
  }

  /**
   * Analyzes typing speed - slow typing may indicate coercion or hesitation
   * Made more sensitive with additional detection tiers
   */
  private analyzeTypingSpeed(typingSpeed: number): number {
    if (typingSpeed < this.TYPING_SPEED_THRESHOLD_LOW * 0.7) {
      // Extremely slow typing - very high risk
      return 0.95;
    } else if (typingSpeed < this.TYPING_SPEED_THRESHOLD_LOW) {
      // Very slow typing - high risk
      return 0.85; // Increased from 0.8
    } else if (typingSpeed < this.TYPING_SPEED_THRESHOLD_LOW * 1.15) {
      // Moderately slow typing - medium-high risk
      return 0.65; // Increased from 0.5
    } else if (typingSpeed < this.TYPING_SPEED_THRESHOLD_LOW * 1.3) {
      // Slightly slow typing - low-medium risk (new tier)
      return 0.35;
    } else if (typingSpeed > this.TYPING_SPEED_THRESHOLD_HIGH * 1.2) {
      // Extremely fast typing - might indicate automation
      return 0.5; // Increased from 0.3
    } else if (typingSpeed > this.TYPING_SPEED_THRESHOLD_HIGH) {
      // Unusually fast typing - might indicate automation
      return 0.4; // Increased from 0.3
    }
    return 0.0;
  }

  /**
   * Analyzes mouse movement patterns - unusual patterns may indicate manipulation
   * Made more sensitive with additional detection tiers
   */
  private analyzeMouseMovement(mouseMovement: number): number {
    if (mouseMovement < this.MOUSE_MOVEMENT_THRESHOLD_LOW * 0.5) {
      // Extremely little mouse movement - very high risk
      return 0.85; // New tier
    } else if (mouseMovement < this.MOUSE_MOVEMENT_THRESHOLD_LOW) {
      // Very little mouse movement - might indicate keyboard-only or automation
      return 0.7; // Increased from 0.6
    } else if (mouseMovement < this.MOUSE_MOVEMENT_THRESHOLD_LOW * 1.2) {
      // Low mouse movement - medium risk (new tier)
      return 0.45;
    } else if (mouseMovement > this.MOUSE_MOVEMENT_THRESHOLD_HIGH * 1.3) {
      // Extremely excessive mouse movement - high risk (new tier)
      return 0.6;
    } else if (mouseMovement > this.MOUSE_MOVEMENT_THRESHOLD_HIGH) {
      // Excessive mouse movement - might indicate hesitation or confusion
      return 0.5; // Increased from 0.4
    }
    return 0.0;
  }

  /**
   * Analyzes click patterns - irregular timing may indicate hesitation or coercion
   * Made more sensitive with lower variance thresholds
   */
  private analyzeClickPattern(clickPattern: number[]): number {
    if (clickPattern.length < 2) {
      return 0.0; // Not enough data
    }

    // Calculate variance in click timing
    const mean = clickPattern.reduce((a, b) => a + b, 0) / clickPattern.length;
    const variance =
      clickPattern.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) /
      clickPattern.length;
    const stdDev = Math.sqrt(variance);

    if (stdDev > this.CLICK_PATTERN_VARIANCE_THRESHOLD * 1.5) {
      // Extremely high variance - very high risk
      return 0.9; // New tier
    } else if (stdDev > this.CLICK_PATTERN_VARIANCE_THRESHOLD) {
      // High variance indicates irregular clicking
      return 0.8; // Increased from 0.7
    } else if (stdDev > this.CLICK_PATTERN_VARIANCE_THRESHOLD * 0.6) {
      // Moderate variance
      return 0.55; // Increased from 0.4, threshold lowered from 0.7
    } else if (stdDev > this.CLICK_PATTERN_VARIANCE_THRESHOLD * 0.4) {
      // Slight variance - low-medium risk (new tier)
      return 0.3;
    }
    return 0.0;
  }

  /**
   * Analyzes time spent on sensitive pages - long time may indicate hesitation or coercion
   * Made more sensitive with lower time thresholds and additional tiers
   */
  private analyzeNavigationTime(
    navigationTime: number,
    pagesVisited: string[]
  ): number {
    const hasSensitivePage = pagesVisited.some((page) =>
      this.SENSITIVE_PAGES.some((sensitive) =>
        page.toLowerCase().includes(sensitive.toLowerCase())
      )
    );

    if (hasSensitivePage && navigationTime > this.NAVIGATION_TIME_THRESHOLD) {
      // Long time on sensitive page - high risk
      if (navigationTime > this.NAVIGATION_TIME_THRESHOLD * 3) {
        // Extremely long time - very high risk
        return 0.95; // New tier
      } else if (navigationTime > this.NAVIGATION_TIME_THRESHOLD * 2) {
        return 0.9;
      } else if (navigationTime > this.NAVIGATION_TIME_THRESHOLD * 1.5) {
        // Moderately long time - medium-high risk
        return 0.75; // New tier, increased sensitivity
      } else {
        return 0.65; // Increased from 0.6
      }
    } else if (hasSensitivePage && navigationTime > this.NAVIGATION_TIME_THRESHOLD * 0.7) {
      // Approaching threshold - low-medium risk (new tier)
      return 0.35;
    }
    return 0.0;
  }

  /**
   * Analyzes page visit sequence - unusual sequences may indicate fraud
   * Made more sensitive with additional checks
   */
  private analyzePageVisits(pagesVisited: string[]): number {
    // Check if user skipped important pages (e.g., went directly to confirmation)
    const hasLogin = pagesVisited.some((page) =>
      page.toLowerCase().includes('login')
    );
    const hasConfirmation = pagesVisited.some((page) =>
      page.toLowerCase().includes('confirmation')
    );
    const hasTransfer = pagesVisited.some((page) =>
      page.toLowerCase().includes('transfer')
    );
    const hasPayment = pagesVisited.some((page) =>
      page.toLowerCase().includes('payment')
    );

    // If user reached sensitive pages without login, it's very suspicious
    if ((hasTransfer || hasConfirmation || hasPayment) && !hasLogin) {
      return 0.9; // Increased from 0.8
    }

    // If user reached confirmation without going through transfer/payment page, it's suspicious
    if (hasConfirmation && !hasTransfer && !hasPayment) {
      return 0.65; // Increased from 0.5
    }

    // If user jumps directly to sensitive pages (new check)
    if ((hasTransfer || hasConfirmation || hasPayment) && pagesVisited.length <= 2) {
      return 0.5; // New check for suspiciously short navigation paths
    }

    return 0.0;
  }
}

