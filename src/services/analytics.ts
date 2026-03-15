// Prosta analityka bez zewnętrznych usług
export class AnalyticsService {
  static trackEvent(eventName: string, properties?: Record<string, any>) {
    try {
      // Log do konsoli (w development)
      if (process.env.NODE_ENV === "development") {
        console.log("📊 Analytics Event:", eventName, properties);
        return;
      }

      // W produkcji można wysłać do własnego API lub zewnętrznej usługi
      const event = {
        event: eventName,
        properties: properties || {},
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent,
      };

      // Przykład wysyłania do własnego API
      fetch("/api/analytics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(event),
      }).catch(() => {
        // Silent fail - nie blokujemy UI
      });
    } catch (error) {
      console.error("Analytics error:", error);
    }
  }

  static trackPageView(page: string) {
    this.trackEvent("page_view", { page });
  }

  static trackCoursePurchase(courseId: string, price: number) {
    this.trackEvent("course_purchase", { courseId, price });
  }

  static trackCourseStart(courseId: string) {
    this.trackEvent("course_start", { courseId });
  }

  static trackCourseComplete(courseId: string) {
    this.trackEvent("course_complete", { courseId });
  }
}

// Hook do śledzenia w React
export function useAnalytics() {
  return {
    trackEvent: AnalyticsService.trackEvent,
    trackPageView: AnalyticsService.trackPageView,
    trackCoursePurchase: AnalyticsService.trackCoursePurchase,
    trackCourseStart: AnalyticsService.trackCourseStart,
    trackCourseComplete: AnalyticsService.trackCourseComplete,
  };
}
