import { z } from "zod";

export const createHouseholdSchema = z.object({
  name: z.string().min(2, "Haushaltsname muss mindestens 2 Zeichen lang sein.").max(255),
});

export const joinHouseholdSchema = z.object({
  inviteCode: z.string().length(10, "Der Einladungscode muss genau 10 Zeichen lang sein."),
});
