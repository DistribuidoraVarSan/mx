import { pgTable, text, timestamp, uuid, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

// Un suscriptor puede estar activo o haber cancelado. Nunca borramos el
// registro al cancelar: así evitamos reenviar el correo de bienvenida si
// la persona se vuelve a suscribir y conservamos el historial.
export const newsletterSubscriberStatus = pgEnum("newsletter_subscriber_status", [
  "subscribed",
  "unsubscribed",
]);

export const newsletterSubscribersTable = pgTable("newsletter_subscribers", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  status: newsletterSubscriberStatus("status").notNull().default("subscribed"),
  // Token opaco usado en el enlace de cancelación de los correos. No requiere
  // que la persona inicie sesión para darse de baja.
  unsubscribeToken: uuid("unsubscribe_token").notNull().defaultRandom(),
  // De dónde vino la suscripción (por ahora solo el footer del sitio, pero
  // deja espacio para otros puntos de entrada en el futuro).
  source: text("source").notNull().default("website_footer"),
  subscribedAt: timestamp("subscribed_at", { withTimezone: true }).notNull().defaultNow(),
  unsubscribedAt: timestamp("unsubscribed_at", { withTimezone: true }),
  welcomeEmailSentAt: timestamp("welcome_email_sent_at", { withTimezone: true }),
});

export const insertNewsletterSubscriberSchema = createInsertSchema(newsletterSubscribersTable).omit({
  id: true,
  status: true,
  unsubscribeToken: true,
  subscribedAt: true,
  unsubscribedAt: true,
  welcomeEmailSentAt: true,
});

export type InsertNewsletterSubscriber = z.infer<typeof insertNewsletterSubscriberSchema>;
export type NewsletterSubscriber = typeof newsletterSubscribersTable.$inferSelect;
