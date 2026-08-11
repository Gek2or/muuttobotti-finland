CREATE TABLE `bookings` (
	`id` text PRIMARY KEY NOT NULL,
	`service` text NOT NULL,
	`customer_name` text NOT NULL,
	`phone` text NOT NULL,
	`email` text NOT NULL,
	`pickup` text NOT NULL,
	`destination` text NOT NULL,
	`preferred_date` text NOT NULL,
	`preferred_time` text NOT NULL,
	`notes` text DEFAULT '' NOT NULL,
	`photo_count` integer DEFAULT 0 NOT NULL,
	`status` text DEFAULT 'new' NOT NULL,
	`notification_status` text DEFAULT 'queued' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
