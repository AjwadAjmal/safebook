import { z } from "zod";

export const registerSchema = z.object({
  username: z
    .string()
    .min(3, "Benutzername muss mindestens 3 Zeichen lang sein.")
    .max(50, "Benutzername darf maximal 50 Zeichen lang sein."),
  password: z
    .string()
    .min(8, "Passwort muss mindestens 8 Zeichen lang sein."),
});

export type RegisterInput = z.infer<typeof registerSchema>;
