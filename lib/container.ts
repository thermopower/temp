import { MemoryIncidentRepository } from "@/core/repositories/memory-incident.repo";
import { IncidentService } from "@/core/services/incident.service";
import { NotificationService } from "@/core/services/notification.service";

// Singleton Instances
const incidentRepo = new MemoryIncidentRepository();
const notificationService = new NotificationService();

export const incidentService = new IncidentService(incidentRepo, notificationService);
