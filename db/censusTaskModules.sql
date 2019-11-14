-- colins user id is 210fbf91-858f-4a8c-8334-b8c24e227caf

INSERT INTO "public"."forms"("id","user_id","title","button_text","fields","redirect_route","description")
VALUES
(E'053ce509-aedc-4d73-ba4a-0ce388ec5bc6',E'210fbf91-858f-4a8c-8334-b8c24e227caf',E'Module 7: Post Census follow-up.',E'Submit',E'[{"name": "completed", "type": "radio", "label": "Did this person complete the Census Form?", "selectOptions": [{"label": "Yes", "value": "yes"}, {"label": "No", "value": "no"}, {"label": "Unassesed", "value": "unassesed"}, {"label": "Refused", "value": "refused"}], "validationTests": "[[\\"yup.string\\"],[\\"yup.required\\"]]"}, {"name": "why_complete", "type": "checkbox", "label": "What was the primary reason that the person gave for completing the form? (Check all that apply)", "selectOptions": [{"label": "Legally required", "value": "legally_required"}, {"label": "Civic duty or responsibility", "value": "civic_duty"}, {"label": "Bring more financial resources into the communitye", "value": "financial_resources"}, {"label": "Political representation", "value": "representation"}, {"label": "Act of resistance", "value": "resistance"}, {"label": "Other", "value": "other"}], "validationTests": "[[\\"yup.string\\"],[\\"yup.required\\"]]"}, {"name": "why_complete_other_specified", "type": "text", "label": "Specify other completion reasons not listed above (if applicable):", "placeholder": "Specify other completion reasons not listed above (if applicable)"}]',NULL,E'In this final module, Trusted Messengers will reconnect with all households to inquire about final disposition (e.g. whether or not they completed the form) as well as the main reasons for that particular outcome.'),
(E'43721d9e-71d1-4309-914b-c035cea37cb4',E'210fbf91-858f-4a8c-8334-b8c24e227caf',E'Module 4: Develop a Census plan',E'Submit',E'[{"name": "made_a_plan", "type": "radio", "label": "Did this person create a plan to fill out the census?", "selectOptions": [{"label": "Yes", "value": "yes"}, {"label": "No", "value": "no"}, {"label": "Unassesed", "value": "unassesed"}, {"label": "Refused", "value": "refused"}], "validationTests": "[[\\"yup.string\\"],[\\"yup.required\\"]]"}, {"name": "method", "type": "radio", "label": "What method does this person prefer to fill out the form?", "selectOptions": [{"label": "Online - at home", "value": "online_at_home"}, {"label": "Online - at a Census Assistance Center", "value": "online_at_center"}, {"label": "On the phone", "value": "phone"}, {"label": "Using a paper form", "value": "paper"}], "validationTests": "[[\\"yup.string\\"],[\\"yup.required\\"]]"}, {"name": "require_assistance", "type": "radio", "label": "Will this person require in-person assistance to fill out the form?", "selectOptions": [{"label": "Yes", "value": "yes"}, {"label": "No", "value": "no"}, {"label": "Unassesed", "value": "unassesed"}, {"label": "Refused", "value": "refused"}], "validationTests": "[[\\"yup.string\\"],[\\"yup.required\\"]]"}, {"name": "require_lanuage_assistance", "type": "radio", "label": "Will this person require language assistance to fill out the form?", "selectOptions": [{"label": "Yes", "value": "yes"}, {"label": "No", "value": "no"}, {"label": "Unassesed", "value": "unassesed"}, {"label": "Refused", "value": "refused"}], "validationTests": "[[\\"yup.string\\"],[\\"yup.required\\"]]"}, {"name": "specified_assistance_language", "type": "radio", "label": "If yes, what language?", "selectOptions": [{"label": "English", "value": "eng"}, {"label": "Spanish", "value": "spa"}, {"label": "Russian", "value": "rus"}, {"label": "Vietnamese", "value": "vie"}, {"label": "Somali", "value": "som"}, {"label": "Arabic", "value": "ara"}, {"label": "Ukranian", "value": "ukr"}, {"label": "Tagalog", "value": "tgl"}, {"label": "Marshallese", "value": "mah"}, {"label": "Korean", "value": "kor"}, {"label": "Punjabi", "value": "pan"}], "validationTests": "[[\\"yup.string\\"],[\\"yup.required\\"]]"}]',NULL,E'Building off of best practices in nonpartisan get-out-the-vote work, this module will focus on encouraging householders to articulate a plan to complete the census form - whether it be online at home, via phone, going to a library, etc.'),
(E'4c4c27dd-e4d1-49d1-9012-e26759dc6a60',E'210fbf91-858f-4a8c-8334-b8c24e227caf',E'Module 6: Direct technical assistance to complete form.',E'Submit',E'[{"name": "completed", "type": "radio", "label": "Did this person complete the Census Form?", "selectOptions": [{"label": "Yes", "value": "yes"}, {"label": "No", "value": "no"}, {"label": "Unassesed", "value": "unassesed"}, {"label": "Refused", "value": "refused"}], "validationTests": "[[\\"yup.string\\"],[\\"yup.required\\"]]"}, {"name": "completion_method", "type": "radio", "label": "How did this person use to fill out the form?", "selectOptions": [{"label": "Online - at home", "value": "online_at_home"}, {"label": "Online - at a Census Assistance Center", "value": "online_at_center"}, {"label": "On the phone", "value": "phone"}, {"label": "Using a paper form", "value": "paper"}, {"label": "Other", "value": "other"}], "validationTests": "[[\\"yup.string\\"],[\\"yup.required\\"]]"}, {"name": "completion_method_other_specified", "type": "text", "label": "Specify other completion methods not listed above (if applicable):", "placeholder": "Specify other completion methods not listed above (if applicable)"}, {"name": "provide_assistance", "type": "radio", "label": "Did you provide assistance to this person to fill out the form?", "selectOptions": [{"label": "Yes", "value": "yes"}, {"label": "No", "value": "no"}, {"label": "Other (please specify)", "value": "other"}], "validationTests": "[[\\"yup.string\\"],[\\"yup.required\\"]]"}, {"name": "completion_method_other_specified", "type": "text", "label": "Specify other methods not listed above (if applicable):", "placeholder": "Specify other methods not listed above (if applicable)"}, {"name": "how_assist", "type": "checkbox", "label": "What type of assistance did you provide? (Check all that apply)", "selectOptions": [{"label": "Transportation", "value": "transportation"}, {"label": "Answered basic questions about how to complete the form", "value": "answered_questions"}, {"label": "Language Assistance", "value": "language"}, {"label": "Other", "value": "other"}], "validationTests": "[[\\"yup.string\\"],[\\"yup.required\\"]]"}, {"name": "how_assist_other_specified", "type": "text", "label": "Specify other assistance methods not listed above (if applicable):", "placeholder": "Specify other assistance methods not listed above (if applicable)"}]',NULL,E'For this module, Trusted Messengers will be trained to provide support to households to fill out the form. This could include submission through a wifi-enabled tablet, transportation to a public library, or assistance with a paper form.'),
(E'651b4aec-b900-4253-8682-b1d30b606cc9',E'210fbf91-858f-4a8c-8334-b8c24e227caf',E'Module 3: Pledge-to-be-counted house party.',E'Submit',E'[{"name": "attend_house_party", "type": "radio", "label": "Did this person attend a house party?", "selectOptions": [{"label": "Yes", "value": "yes"}, {"label": "No", "value": "no"}, {"label": "Unknown", "value": "unknown"}], "validationTests": "[[\\"yup.string\\"],[\\"yup.required\\"]]"}, {"name": "sign_pledge_card", "type": "radio", "label": "Did this person sign a pledge-to-be-counted card?", "selectOptions": [{"label": "Yes", "value": "yes"}, {"label": "No", "value": "no"}, {"label": "Unknown", "value": "unknown"}], "validationTests": "[[\\"yup.string\\"],[\\"yup.required\\"]]"}]',NULL,E'This social event will serve as an opportunity to get households to come together and fill out pledge cards. This introduces an element of positive social pressure. These cards will be mailed back (where appropriate) around April 1, 2020.'),
(E'70930133-dcc6-4fe0-b935-715a598e22c1',E'210fbf91-858f-4a8c-8334-b8c24e227caf',E'Module 2: Know Your Rights',E'Submit',E'[{"name": "express_concern", "type": "radio", "label": "Did this person express concern about filling out the 2020 Census?", "selectOptions": [{"label": "Yes", "value": "yes"}, {"label": "No", "value": "no"}, {"label": "Unassessed or Refused", "value": "unassessed_or_refused"}], "validationTests": "[[\\"yup.string\\"],[\\"yup.required\\"]]"}, {"name": "express_concern_reasons", "type": "checkbox", "label": "If yes, what are their primary concern(s)? (Check all that apply)", "selectOptions": [{"label": "Fear of deportation for themselves, family, or members of the community", "value": "fear_deportation"}, {"label": "Distrust of government", "value": "distrust_government"}, {"label": "Privacy", "value": "privacy"}, {"label": "Fear that data is not secure/can be hacked", "value": "data_not_secure"}, {"label": "Busy/Inconvenient", "value": "busy"}, {"label": "Does not impact them", "value": "no_impact"}, {"label": "Believes they are ineligible to participate", "value": "ineligible"}, {"label": "Other (Please Specify Below)", "value": "other"}]}, {"name": "other_concern", "type": "text", "label": "Specify other concerns not listed above (if applicable):", "placeholder": "Specify other concerns not listed above (if applicable)"}, {"name": "likelihood", "type": "linear", "label": "After providing more information about the census, and their rights, how likely is this person to fill out the census?", "selectOptions": [{"label": "0 - Unassessed or Refused", "value": "unassessed_or_refused"}, {"label": "1 - Highly likely", "value": "highly_likely"}, {"label": "2 - Likely", "value": "likely"}, {"label": "3 - Undecided", "value": "undecided"}, {"label": "4 - Unlikely", "value": "unlikely"}, {"label": "5 - Highly unlikely", "value": "highly_unlikely"}], "validationTests": "[[\\"yup.string\\"],[\\"yup.required\\"]]"}]',NULL,E'Though the citizenship question will not appear on the form, there are lingering doubts about safety. This module will encourage household members to voice their concerns and learn about current legal protections in place.'),
(E'b08ae83a-8696-4137-a62d-2469128d77b2',E'210fbf91-858f-4a8c-8334-b8c24e227caf',E'Module 0: Intake. Please enter basic information about your household contact here:',E'Submit',E'[{"name": "reliable_internet", "type": "radio", "label": "Does this person have reliable access to the internet at their home, on a cell phone, or on a mobile device?", "selectOptions": [{"label": "Yes", "value": "yes"}, {"label": "No", "value": "no"}, {"label": "Unassessed or Refused", "value": "UORR"}], "validationTests": "[[\\"yup.string\\"],[\\"yup.required\\"]]"}, {"name": "english_comfort", "type": "radio", "label": "What is this person''s level of comfort with speaking, reading, and writing in English?", "selectOptions": [{"label": "1- Is comfortable speaking, reading, and writing in English", "value": "1"}, {"label": "2- Is comfortable speaking English but has difficulty reading and writing", "value": "2"}, {"label": "3- Is somewhat comfortable speaking, reading and writing in English, but is more comfortable speaking in another language.", "value": "3"}, {"label": "4- Is not comfortable speaking, reading, or writing in English", "value": "4"}], "validationTests": "[[\\"yup.string\\"],[\\"yup.required\\"]]"}, {"name": "english_comfort_other", "type": "text", "label": "Other Comfort Level: Please describe", "placeholder": "Other Comfort Level: Please describe"}, {"name": "non_english_languages", "type": "checkbox", "label": "What non-english languages does this person speak and read or write?", "selectOptions": [{"label": "Spanish", "value": "spanish"}, {"label": "Chinese", "value": "chinese"}, {"label": "Vietnamese", "value": "vietnamese"}, {"label": "Russian", "value": "russian"}, {"label": "Tagalog", "value": "tagalog"}, {"label": "Korean", "value": "korean"}]}, {"name": "non_english_languages_other", "type": "text", "label": "Additional languages or languages not listed above:", "placeholder": "Additional languages or languages not listed above:"}]',NULL,E''),
(E'becfbbc9-bc4e-40a3-8b5c-3c7d096ffbd5',E'210fbf91-858f-4a8c-8334-b8c24e227caf',E'Module 5: Share information with others.',E'Submit',E'[{"name": "reach_out_others", "type": "radio", "label": "Is this person willing to reach out to others to educate them about the census?", "selectOptions": [{"label": "Yes", "value": "yes"}, {"label": "No", "value": "no"}, {"label": "Unassesed", "value": "unassesed"}, {"label": "Refused", "value": "refused"}], "validationTests": "[[\\"yup.string\\"],[\\"yup.required\\"]]"}, {"name": "outreach_method", "type": "checkbox", "label": "What methods will this person use to reach out to others? Check all that apply", "selectOptions": [{"label": "Text or messaging platform", "value": "sms"}, {"label": "Email", "value": "email"}, {"label": "Social Media (Facebook, Instagram, Snapchat, Twitter)", "value": "social_media"}, {"label": "Phone call", "value": "phone"}, {"label": "In-person gathering", "value": "in_person_gathering"}, {"label": "Volunteering with a local organization", "value": "volunteering_org"}, {"label": "Other (please specify below)", "value": "other"}], "validationTests": "[[\\"yup.string\\"],[\\"yup.required\\"]]"}, {"name": "outreach_method_other_specified", "type": "text", "label": "Specify other outreach methods not listed above (if applicable):", "placeholder": "Specify other outreach methods not listed above (if applicable)"}]',NULL,E'In this module, Trusted Messengers will conduct a mini-training and encourage households to reach out to their networks and educate them about the Census, with an emphasis on social media.'),
(E'f6a2beda-6a38-4ca8-a64d-02b7b961e498',E'210fbf91-858f-4a8c-8334-b8c24e227caf',E'Module 1: Census 101.',E'Submit',E'[{"name": "heard_about", "type": "radio", "label": "Has this person heard about the 2020 Census?", "placeholder": "Has this person heard about the 2020 Census?", "selectOptions": [{"label": "Yes", "value": "yes"}, {"label": "No", "value": "no"}, {"label": "Unassessed or Refused", "value": "unassessed_or_refused"}], "validationTests": "[[\\"yup.string\\"],[\\"yup.required\\"]]"}, {"name": "likelihood", "type": "linear", "label": "How likely is this person to fill out the census?", "placeholder": "How likely is this person to fill out the census?", "selectOptions": [{"label": "0 - Unassessed or Refused", "value": "unassessed_or_refused"}, {"label": "1 - Highly likely", "value": "highly_likely"}, {"label": "2 - Likely", "value": "likely"}, {"label": "3 - Undecided", "value": "undecided"}, {"label": "4 - Unlikely", "value": "unlikely"}, {"label": "5 - Highly unlikely", "value": "highly_unlikely"}], "validationTests": "[[\\"yup.string\\"],[\\"yup.required\\"]]"}]',E'null',E'Trusted Messengers will provide each household with a basic understanding of the decennial Census, its history, impact on federal funding distribution, and implications for political representation. Further, this module will cover the current controversy surrounding the citizenship question.');


INSERT INTO "public"."task_definitions"("id","active","form_id","created_by","last_edited_by","points","is_globally_available","created_at","updated_at","auto_add_new_teams","auto_add_sort_value")
VALUES
(E'10cadb7e-670f-4f85-93c1-fb2a7b842bc5',TRUE,E'651b4aec-b900-4253-8682-b1d30b606cc9',E'210fbf91-858f-4a8c-8334-b8c24e227caf',NULL,0,FALSE,E'2019-10-04 14:28:46.811971+00',E'2019-11-14 19:07:06.489708+00',TRUE,3),
(E'4567d2a8-61db-41d2-b9c1-46ebe85752dc',TRUE,E'43721d9e-71d1-4309-914b-c035cea37cb4',E'210fbf91-858f-4a8c-8334-b8c24e227caf',NULL,0,FALSE,E'2019-10-04 14:28:46.811971+00',E'2019-11-14 19:07:06.489708+00',TRUE,4),
(E'68dfe977-727a-411f-8448-d2f4f80a5f35',TRUE,E'b08ae83a-8696-4137-a62d-2469128d77b2',E'210fbf91-858f-4a8c-8334-b8c24e227caf',NULL,0,FALSE,E'2019-11-14 19:07:06.489708+00',E'2019-11-14 19:07:06.489708+00',TRUE,0),
(E'768b5fec-a661-4ae5-b899-c41a6d135e3e',TRUE,E'4c4c27dd-e4d1-49d1-9012-e26759dc6a60',E'210fbf91-858f-4a8c-8334-b8c24e227caf',NULL,0,FALSE,E'2019-10-04 14:28:46.811971+00',E'2019-11-14 19:07:06.489708+00',TRUE,6),
(E'7f9d1954-4998-449a-8989-f91026f0855e',TRUE,E'becfbbc9-bc4e-40a3-8b5c-3c7d096ffbd5',E'210fbf91-858f-4a8c-8334-b8c24e227caf',NULL,0,FALSE,E'2019-10-04 14:28:46.811971+00',E'2019-11-14 19:07:06.489708+00',TRUE,5),
(E'8ae13a94-b563-4b6a-ac95-201b986081f1',TRUE,E'053ce509-aedc-4d73-ba4a-0ce388ec5bc6',E'210fbf91-858f-4a8c-8334-b8c24e227caf',NULL,0,FALSE,E'2019-10-04 14:28:46.811971+00',E'2019-11-14 19:07:06.489708+00',TRUE,7),
(E'd6a2beda-6a38-4ca8-a64d-02b7b961e498',TRUE,E'f6a2beda-6a38-4ca8-a64d-02b7b961e498',E'210fbf91-858f-4a8c-8334-b8c24e227caf',NULL,0,FALSE,E'2019-10-04 14:28:46.811971+00',E'2019-11-14 19:07:06.489708+00',TRUE,1),
(E'f9af66e4-1171-4652-a7d4-12cd223b5636',TRUE,E'70930133-dcc6-4fe0-b935-715a598e22c1',E'210fbf91-858f-4a8c-8334-b8c24e227caf',NULL,0,FALSE,E'2019-10-04 14:28:46.811971+00',E'2019-11-14 19:07:06.489708+00',TRUE,2);


-- module 0
INSERT INTO "public"."task_assignments"("team_id","task_definition_id","active","task_required_roles","not_until_completion_of","not_available_before_ts","not_available_after_ts","sort_value")
SELECT id,'68dfe977-727a-411f-8448-d2f4f80a5f35',TRUE,8,NULL,NULL,NULL,0 FROM teams
WHERE NOT EXISTS (
	SELECT 1 from task_assignments 
	WHERE task_definition_id = '68dfe977-727a-411f-8448-d2f4f80a5f35'
	AND team_id = teams.id
);

-- module 1
INSERT INTO "public"."task_assignments"("team_id","task_definition_id","active","task_required_roles","not_until_completion_of","not_available_before_ts","not_available_after_ts","sort_value")
SELECT id,'d6a2beda-6a38-4ca8-a64d-02b7b961e498',TRUE,8,NULL,NULL,NULL,1 FROM teams
WHERE NOT EXISTS (
	SELECT 1 from task_assignments 
	WHERE task_definition_id = 'd6a2beda-6a38-4ca8-a64d-02b7b961e498'
	AND team_id = teams.id
);

-- module 2
INSERT INTO "public"."task_assignments"("team_id","task_definition_id","active","task_required_roles","not_until_completion_of","not_available_before_ts","not_available_after_ts","sort_value")
SELECT id,'f9af66e4-1171-4652-a7d4-12cd223b5636',TRUE,8,NULL,NULL,NULL,2 FROM teams
WHERE NOT EXISTS (
	SELECT 1 from task_assignments 
	WHERE task_definition_id = 'f9af66e4-1171-4652-a7d4-12cd223b5636'
	AND team_id = teams.id
);

-- module 3
INSERT INTO "public"."task_assignments"("team_id","task_definition_id","active","task_required_roles","not_until_completion_of","not_available_before_ts","not_available_after_ts","sort_value")
SELECT id,'10cadb7e-670f-4f85-93c1-fb2a7b842bc5',TRUE,8,NULL,NULL,NULL,3 FROM teams
WHERE NOT EXISTS (
	SELECT 1 from task_assignments 
	WHERE task_definition_id = '10cadb7e-670f-4f85-93c1-fb2a7b842bc5'
	AND team_id = teams.id
);

-- module 4
INSERT INTO "public"."task_assignments"("team_id","task_definition_id","active","task_required_roles","not_until_completion_of","not_available_before_ts","not_available_after_ts","sort_value")
SELECT id,'4567d2a8-61db-41d2-b9c1-46ebe85752dc',TRUE,8,NULL,NULL,NULL,4 FROM teams
WHERE NOT EXISTS (
	SELECT 1 from task_assignments 
	WHERE task_definition_id = '14567d2a8-61db-41d2-b9c1-46ebe85752dc'
	AND team_id = teams.id
);

-- module 5
INSERT INTO "public"."task_assignments"("team_id","task_definition_id","active","task_required_roles","not_until_completion_of","not_available_before_ts","not_available_after_ts","sort_value")
SELECT id,'7f9d1954-4998-449a-8989-f91026f0855e',TRUE,8,NULL,NULL,NULL,5 FROM teams
WHERE NOT EXISTS (
	SELECT 1 from task_assignments 
	WHERE task_definition_id = '7f9d1954-4998-449a-8989-f91026f0855e'
	AND team_id = teams.id
);

-- module 6
INSERT INTO "public"."task_assignments"("team_id","task_definition_id","active","task_required_roles","not_until_completion_of","not_available_before_ts","not_available_after_ts","sort_value")
SELECT id,'768b5fec-a661-4ae5-b899-c41a6d135e3e',TRUE,8,NULL,NULL,NULL,6 FROM teams
WHERE NOT EXISTS (
	SELECT 1 from task_assignments 
	WHERE task_definition_id = '768b5fec-a661-4ae5-b899-c41a6d135e3e'
	AND team_id = teams.id
);

-- module 7
INSERT INTO "public"."task_assignments"("team_id","task_definition_id","active","task_required_roles","not_until_completion_of","not_available_before_ts","not_available_after_ts","sort_value")
SELECT id,'8ae13a94-b563-4b6a-ac95-201b986081f1',TRUE,8,NULL,NULL,NULL,7 FROM teams
WHERE NOT EXISTS (
	SELECT 1 from task_assignments 
	WHERE task_definition_id = '8ae13a94-b563-4b6a-ac95-201b986081f1'
	AND team_id = teams.id
);
