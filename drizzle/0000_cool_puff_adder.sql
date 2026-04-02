CREATE TABLE `account` (
	`id` text PRIMARY KEY NOT NULL,
	`account_id` text NOT NULL,
	`provider_id` text NOT NULL,
	`user_id` text NOT NULL,
	`access_token` text,
	`refresh_token` text,
	`id_token` text,
	`access_token_expires_at` integer,
	`refresh_token_expires_at` integer,
	`scope` text,
	`password` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `session` (
	`id` text PRIMARY KEY NOT NULL,
	`expires_at` integer NOT NULL,
	`token` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`ip_address` text,
	`user_agent` text,
	`user_id` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `session_token_unique` ON `session` (`token`);--> statement-breakpoint
CREATE TABLE `user` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`email_verified` integer NOT NULL,
	`image` text,
	`role` text DEFAULT 'GUEST' NOT NULL,
	`banned` integer,
	`ban_reason` text,
	`ban_expires` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_email_unique` ON `user` (`email`);--> statement-breakpoint
CREATE TABLE `verification` (
	`id` text PRIMARY KEY NOT NULL,
	`identifier` text NOT NULL,
	`value` text NOT NULL,
	`expires_at` integer NOT NULL,
	`created_at` integer,
	`updated_at` integer
);
--> statement-breakpoint
CREATE TABLE `lineup_templates` (
	`id` text PRIMARY KEY NOT NULL,
	`team_id` text NOT NULL,
	`name` text NOT NULL,
	`lineup_data` text NOT NULL,
	`created_at` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	FOREIGN KEY (`team_id`) REFERENCES `teams`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_lineup_templates_team_id` ON `lineup_templates` (`team_id`);--> statement-breakpoint
CREATE TABLE `organization_members` (
	`id` text PRIMARY KEY NOT NULL,
	`organization_id` text NOT NULL,
	`user_id` text NOT NULL,
	`role` text NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`created_at` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_org_members_org_id` ON `organization_members` (`organization_id`);--> statement-breakpoint
CREATE INDEX `idx_org_members_user_id` ON `organization_members` (`user_id`);--> statement-breakpoint
CREATE TABLE `organizations` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`short_name` text,
	`logo_image_url` text,
	`description` text,
	`founded_year` integer,
	`category` text DEFAULT 'other' NOT NULL,
	`created_at` integer DEFAULT (strftime('%s', 'now')) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `players` (
	`id` text PRIMARY KEY NOT NULL,
	`team_id` text NOT NULL,
	`name` text NOT NULL,
	`uniform_number` text NOT NULL,
	`nickname` text,
	`primary_position` text,
	`sub_positions` text,
	`throws` text,
	`bats` text,
	`height` integer,
	`weight` integer,
	`profile_image_url` text,
	`notes` text,
	`is_active` integer DEFAULT true,
	`created_at` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	FOREIGN KEY (`team_id`) REFERENCES `teams`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_players_team_id` ON `players` (`team_id`);--> statement-breakpoint
CREATE TABLE `team_members` (
	`id` text PRIMARY KEY NOT NULL,
	`team_id` text NOT NULL,
	`user_id` text NOT NULL,
	`role` text NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`joined_at` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	FOREIGN KEY (`team_id`) REFERENCES `teams`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_team_members_team_id` ON `team_members` (`team_id`);--> statement-breakpoint
CREATE INDEX `idx_team_members_user_id` ON `team_members` (`user_id`);--> statement-breakpoint
CREATE TABLE `teams` (
	`id` text PRIMARY KEY NOT NULL,
	`organization_id` text,
	`name` text NOT NULL,
	`year` integer DEFAULT 2026 NOT NULL,
	`manager_name` text,
	`captain_id` text,
	`home_ground` text,
	`tier` text,
	`team_type` text DEFAULT 'regular',
	`created_by` text NOT NULL,
	`created_at` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`created_by`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `match_lineups` (
	`id` text PRIMARY KEY NOT NULL,
	`match_id` text NOT NULL,
	`player_id` text NOT NULL,
	`batting_order` integer NOT NULL,
	`position` text NOT NULL,
	`is_starting` integer DEFAULT true NOT NULL,
	`inning_entered` integer DEFAULT 1,
	FOREIGN KEY (`match_id`) REFERENCES `matches`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`player_id`) REFERENCES `players`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_match_lineups_match_id` ON `match_lineups` (`match_id`);--> statement-breakpoint
CREATE TABLE `matches` (
	`id` text PRIMARY KEY NOT NULL,
	`team_id` text NOT NULL,
	`tournament_id` text,
	`opponent` text NOT NULL,
	`date` text NOT NULL,
	`match_type` text NOT NULL,
	`batting_order` text NOT NULL,
	`venue_id` text,
	`surface_details` text,
	`innings` integer DEFAULT 9 NOT NULL,
	`status` text DEFAULT 'scheduled' NOT NULL,
	`my_score` integer DEFAULT 0 NOT NULL,
	`opponent_score` integer DEFAULT 0 NOT NULL,
	`my_inning_scores` text DEFAULT '[]',
	`opponent_inning_scores` text DEFAULT '[]',
	`weather` text,
	`created_at` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	FOREIGN KEY (`team_id`) REFERENCES `teams`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`tournament_id`) REFERENCES `tournaments`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`venue_id`) REFERENCES `venues`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_matches_team_id` ON `matches` (`team_id`);--> statement-breakpoint
CREATE INDEX `idx_matches_tournament_id` ON `matches` (`tournament_id`);--> statement-breakpoint
CREATE INDEX `idx_matches_date` ON `matches` (`date`);--> statement-breakpoint
CREATE TABLE `tournaments` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`season` text NOT NULL,
	`organizer` text,
	`bracket_url` text,
	`time_limit` text,
	`cold_game_rule` text,
	`tiebreaker_rule` text,
	`start_date` text,
	`end_date` text,
	`created_at` integer DEFAULT (strftime('%s', 'now')) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `venues` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`short_name` text,
	`address` text,
	`map_url` text,
	`surface_type` text,
	`dimensions` text,
	`notes` text,
	`created_at` integer DEFAULT (strftime('%s', 'now')) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `at_bats` (
	`id` text PRIMARY KEY NOT NULL,
	`match_id` text NOT NULL,
	`inning` integer NOT NULL,
	`is_top` integer NOT NULL,
	`batter_id` text,
	`pitcher_id` text,
	`result` text,
	`created_at` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	FOREIGN KEY (`match_id`) REFERENCES `matches`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`batter_id`) REFERENCES `players`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`pitcher_id`) REFERENCES `players`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_at_bats_match_id` ON `at_bats` (`match_id`);--> statement-breakpoint
CREATE INDEX `idx_at_bats_batter_id` ON `at_bats` (`batter_id`);--> statement-breakpoint
CREATE INDEX `idx_at_bats_pitcher_id` ON `at_bats` (`pitcher_id`);--> statement-breakpoint
CREATE TABLE `base_advances` (
	`id` text PRIMARY KEY NOT NULL,
	`match_id` text NOT NULL,
	`at_bat_id` text NOT NULL,
	`pitch_id` text,
	`runner_id` text NOT NULL,
	`from_base` integer NOT NULL,
	`to_base` integer NOT NULL,
	`reason` text NOT NULL,
	`is_out` integer DEFAULT false NOT NULL,
	`created_at` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	FOREIGN KEY (`match_id`) REFERENCES `matches`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`at_bat_id`) REFERENCES `at_bats`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`pitch_id`) REFERENCES `pitches`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`runner_id`) REFERENCES `players`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_base_advances_match_id` ON `base_advances` (`match_id`);--> statement-breakpoint
CREATE INDEX `idx_base_advances_at_bat_id` ON `base_advances` (`at_bat_id`);--> statement-breakpoint
CREATE TABLE `pitches` (
	`id` text PRIMARY KEY NOT NULL,
	`at_bat_id` text NOT NULL,
	`pitch_number` integer NOT NULL,
	`result` text NOT NULL,
	`balls_before` integer DEFAULT 0 NOT NULL,
	`strikes_before` integer DEFAULT 0 NOT NULL,
	`zone_x` real,
	`zone_y` real,
	`pitch_type` text,
	`pitch_speed` integer,
	`created_at` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	FOREIGN KEY (`at_bat_id`) REFERENCES `at_bats`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_pitches_at_bat_id` ON `pitches` (`at_bat_id`);--> statement-breakpoint
CREATE TABLE `play_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`match_id` text NOT NULL,
	`inning_text` text NOT NULL,
	`result_type` text NOT NULL,
	`description` text NOT NULL,
	`created_at` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	FOREIGN KEY (`match_id`) REFERENCES `matches`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_play_logs_match_id` ON `play_logs` (`match_id`);