-- note the following tables are intended to get you started
-- `you` should definitely add more association / columns as you see fit



CREATE TABLE users (
  user_id serial NOT NULL,
  user_username character varying(128),
  user_password character varying(128),
  user_access_type character varying(64),
  user_suspended boolean DEFAULT false,
  CONSTRAINT user_pk PRIMARY KEY (user_id),
  CONSTRAINT user_unique UNIQUE (user_username)
);

CREATE TABLE branches (
  branch_id serial NOT NULL,
  branch_name character varying(128),
  branch_ip character varying(64),
  branch_service_type character varying(64),
  branch_access_type character varying(64),
  branch_bandwidth character varying(16),
  branch_service_number character varying(32),
  CONSTRAINT branch_pk PRIMARY KEY (branch_id),
  CONSTRAINT branch_unique UNIQUE (branch_name, branch_service_type)
);

CREATE TABLE reports (
  report_id serial NOT NULL,
  report_timestamp_open timestamp with time zone DEFAULT now(),
  report_alert boolean DEFAULT false,
  report_branch integer,
  report_ticket character varying(15),
  report_timestamp_close timestamp with time zone,
  report_status boolean DEFAULT false,
  report_reporter character varying(128),
  CONSTRAINT report_pk PRIMARY KEY (report_id),
  CONSTRAINT report_unique UNIQUE (report_ticket)
);

CREATE TABLE log (
  log_id serial NOT NULL,
  log_msg character varying(1000),
  log_timestamp timestamp with time zone DEFAULT now(),
  CONSTRAINT log_pk PRIMARY KEY (log_id)
);
