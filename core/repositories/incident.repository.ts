import { Incident } from "../domain/incident";

export interface IncidentRepository {
    findAll(): Promise<Incident[]>;
    findById(id: string): Promise<Incident | null>;
    create(incident: Incident): Promise<Incident>;
    update(id: string, incident: Partial<Incident>): Promise<Incident | null>;
    delete(id: string): Promise<boolean>;
}
