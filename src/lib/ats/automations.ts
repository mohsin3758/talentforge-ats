import { db } from "@/lib/db";
import type { Application } from "@prisma/client";

interface AutomationApp extends Application {
  job?: { title: string; hiringManager: string };
  candidate?: { fullName: string; email: string };
}

/**
 * Evaluate all enabled automations against the application that just changed.
 * Fire-and-forget side effects (we don't block the request).
 */
export async function triggerAutomations(app: AutomationApp): Promise<void> {
  const automations = await db.automation.findMany({
    where: { enabled: true, trigger: "stage_changed" },
  });

  for (const auto of automations) {
    let cfg: Record<string, unknown> = {};
    try {
      cfg = JSON.parse(auto.triggerConfig);
    } catch {
      cfg = {};
    }
    const toStage = cfg.toStage as string | undefined;
    if (toStage && app.stage !== toStage) continue;

    // Increment run count
    await db.automation.update({
      where: { id: auto.id },
      data: { runCount: { increment: 1 } },
    });

    // For demo purposes, log the action. In a production system this would dispatch
    // to an email sender, task queue, or in-app notification system.
    console.log(
      `[automation:${auto.name}] fired for application ${app.id} (${app.candidate?.fullName ?? "?"}) → stage ${app.stage}`,
    );
  }
}
