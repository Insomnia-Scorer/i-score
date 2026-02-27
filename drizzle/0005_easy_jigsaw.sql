ALTER TABLE `matches` ADD `opponent_team_id` text REFERENCES teams(id);--> statement-breakpoint
ALTER TABLE `matches` ADD `season` text NOT NULL;--> statement-breakpoint
ALTER TABLE `team_members` ADD `opponent_team_id` text REFERENCES teams(id);--> statement-breakpoint
ALTER TABLE `teams` ADD `created_by` text NOT NULL REFERENCES user(id);