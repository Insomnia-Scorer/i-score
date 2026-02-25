CREATE TABLE `matches` (
	`id` text PRIMARY KEY NOT NULL,
	`opponent` text NOT NULL,
	`date` text NOT NULL,
	`location` text,
	`match_type` text NOT NULL,
	`batting_order` text NOT NULL,
	`status` text DEFAULT 'scheduled' NOT NULL,
	`created_at` integer DEFAULT (strftime('%s', 'now')) NOT NULL
);
