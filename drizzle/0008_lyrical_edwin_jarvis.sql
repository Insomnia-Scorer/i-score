ALTER TABLE `matches` ADD `my_score` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `matches` ADD `opponent_score` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `matches` ADD `my_inning_scores` text DEFAULT '[]';--> statement-breakpoint
ALTER TABLE `matches` ADD `opponent_inning_scores` text DEFAULT '[]';