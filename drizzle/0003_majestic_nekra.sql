CREATE TABLE `at_bats` (
	`id` text PRIMARY KEY NOT NULL,
	`match_id` text NOT NULL,
	`inning` integer NOT NULL,
	`is_top` integer NOT NULL,
	`batter_name` text,
	`result` text,
	`created_at` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	FOREIGN KEY (`match_id`) REFERENCES `matches`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `pitches` (
	`id` text PRIMARY KEY NOT NULL,
	`at_bat_id` text NOT NULL,
	`pitch_number` integer NOT NULL,
	`result` text NOT NULL,
	`balls_before` integer DEFAULT 0 NOT NULL,
	`strikes_before` integer DEFAULT 0 NOT NULL,
	`created_at` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	FOREIGN KEY (`at_bat_id`) REFERENCES `at_bats`(`id`) ON UPDATE no action ON DELETE cascade
);
