-- A test user
INSERT INTO "public"."users"("id","first_name","last_name","phone","address","city","state","zip5","email","active","created_at","updated_at")
VALUES
(E'0d6246ae-78c7-4960-843c-9977fd7f2ef9',E'Buster',E'Will',E'+14554434383',E'6311 Allen Trail',E'Greenfort',E'South Carolina',E'25842',E'Victoria57@yahoo.com',TRUE,E'2019-09-19 09:06:28.316334-05',E'2019-09-19 09:06:28.316334-05');

-- a test team
INSERT INTO "public"."teams"("id","name","description","slug","active","created_at","updated_at")
VALUES
(E'dfeb48f2-b463-4284-acb8-ddc62a3c5bae',E'Rice, Bayer and Hagenes',NULL,E'maxime-in-et',TRUE,E'2019-09-19 09:06:28.322612-05',E'2019-09-19 09:06:28.322612-05');

-- user is global admin to team
INSERT INTO "public"."global_permissions"("user_id","permission","created_at","updated_at")
VALUES
(E'0d6246ae-78c7-4960-843c-9977fd7f2ef9',E'ADMIN',E'2019-09-19 09:06:28.319872-05',E'2019-09-19 09:06:28.319872-05');

-- a simple form 
INSERT INTO "public"."forms"("id","user_id","title","button_text","fields","redirect_route")
VALUES
(E'fbe10c70-dcf8-4b92-936c-d53e622b69b0',E'0d6246ae-78c7-4960-843c-9977fd7f2ef9',E'This is form title',E'Button Text',E'[{"name": "alpha", "type": "text", "label": "I am the label text", "placeholder": "I am a place holder", "selectOptions": [{"label": "alpha", "value": "alpha"}, {"label": "beta", "value": "beta"}], "validationTests": "[[\\"yup.number\\"],[\\"yup.required\\"],[\\"yup.min\\",50],[\\"yup.max\\",500]]"}, {"name": "beta", "type": "text", "label": "I am the label text", "placeholder": "I am a place holder", "selectOptions": [{"label": "alpha", "value": "alpha"}, {"label": "beta", "value": "beta"}], "validationTests": "[[\\"yup.number\\"],[\\"yup.required\\"],[\\"yup.min\\",50],[\\"yup.max\\",500]]"}]',E'/someRoute');

-- Create a task Definition
INSERT INTO "public"."task_definitions"("id","active","form_id","created_by","last_edited_by","points","is_globally_available","created_at","updated_at")
VALUES
(E'1d7d8305-bcd0-4bab-bee6-e01d5df6899a',TRUE,E'fbe10c70-dcf8-4b92-936c-d53e622b69b0',E'0d6246ae-78c7-4960-843c-9977fd7f2ef9',NULL,0,FALSE,E'2019-09-19 09:06:28.331191-05',E'2019-09-19 09:06:28.331191-05');

-- Assign above task definition to the team with a permission profile of members only
INSERT INTO "public"."task_assignments"("id","team_id","task_definition_id","active","task_required_roles","not_until_completion_of","not_available_before_ts","not_available_after_ts","created_at","updated_at")
VALUES
(E'604f264e-7621-4e92-a554-cc3d35172746',E'dfeb48f2-b463-4284-acb8-ddc62a3c5bae',E'1d7d8305-bcd0-4bab-bee6-e01d5df6899a',TRUE,8,NULL,NULL,NULL,E'2019-09-19 09:06:28.334661-05',E'2019-09-19 09:06:28.334661-05');

-- a test target
INSERT INTO "public"."targets"("id","first_name","last_name","active","address","city","state","zip5","twitter_handle","facebook_profile","email","household_size","phone","user_id","team_id","created_at","updated_at","census_tract","retain_address")
VALUES
(E'8b6f0d5b-79a9-426b-9267-420f856bc3b5',E'Casper',E'Hilpert',TRUE,E'54772 Armstrong Underpass',E'Baileyton',E'Nevada',E'32774',E'@Plastic',E'interfaces',E'Pearline.Rogahn87@gmail.com',9,E'+11045199448',E'0d6246ae-78c7-4960-843c-9977fd7f2ef9',E'dfeb48f2-b463-4284-acb8-ddc62a3c5bae',E'2019-09-19 09:06:28.326156-05',E'2019-09-19 09:06:28.326156-05',NULL,TRUE);

-- indicating the task has been completed for above person
INSERT INTO "public"."task_assignment_status"("target_id","task_assignment_id","completed_by","complete","created_at","updated_at")
VALUES
(E'8b6f0d5b-79a9-426b-9267-420f856bc3b5',E'604f264e-7621-4e92-a554-cc3d35172746',E'0d6246ae-78c7-4960-843c-9977fd7f2ef9',TRUE,E'2019-09-19 09:06:28.356359-05',E'2019-09-19 09:06:28.356359-05');

-- Stores a value for alpha field of above form
INSERT INTO "public"."form_values"("form_id","user_id","target_id","name","value","created_at","updated_at")
VALUES
(E'fbe10c70-dcf8-4b92-936c-d53e622b69b0',E'0d6246ae-78c7-4960-843c-9977fd7f2ef9',E'8b6f0d5b-79a9-426b-9267-420f856bc3b5',E'alpha',E'TEST VALUE',E'2019-09-19 09:21:25.547452-05',E'2019-09-19 09:21:25.547452-05');
