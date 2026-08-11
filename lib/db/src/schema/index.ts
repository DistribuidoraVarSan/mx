import {
pgTable,
serial,
text,
timestamp,
} from "drizzle-orm/pg-core";

export const newsletterSubscribersTable = pgTable(
"newsletter_subscribers",
{
id: serial("id").primaryKey(),

email: text("email").notNull().unique(),

status: text("status")
.notNull()
.default("subscribed"),

source: text("source")
.notNull()
.default("website_footer"),

unsubscribeToken: text("unsubscribe_token")
.notNull()
.unique(),

subscribedAt: timestamp("subscribed_at", {
withTimezone: true,
})
.notNull()
.defaultNow(),

unsubscribedAt: timestamp("unsubscribed_at", {
withTimezone: true,
}),

welcomeEmailSentAt: timestamp("welcome_email_sent_at", {
withTimezone: true,
}),
},
);
