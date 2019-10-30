-- ballot mailed
UPDATE shared.voter_file vf
SET 
	vo_ab_requested_general=true, 
	vo_ab_requested_date_general=subquery.ballot_mailed
FROM (
	SELECT 
		state_file_id, 
		ballot_mailed::DATE as ballot_mailed 
	FROM daily_file_staging.lindsay_mailed_format 
	WHERE ballot_mailed IS NOT NULL
) AS subquery
WHERE vf.state_file_id=subquery.state_file_id
AND vf.vo_ab_requested_general = false;


-- mail in voted
UPDATE shared.voter_file vf
SET 
	vo_voted_general=true, 
	vo_voted_date_general=subquery.ballot_received, 
	vo_voted_method_general='mail-in-ballot'
FROM (
	SELECT 
		state_file_id, 
		ballot_received::DATE as ballot_received 
		FROM daily_file_staging.lindsay_mailed_format 
		WHERE ballot_received IS NOT NULL
) AS subquery
WHERE vf.state_file_id=subquery.state_file_id
AND vf.vo_voted_general = false;

-- in person
UPDATE shared.voter_file vf
SET 
	vo_voted_general=true, 
	vo_voted_date_general=subquery.early_voted,
	vo_voted_method_general='in-person'
FROM (
	SELECT 
		state_file_id, 
		early_voted::DATE as early_voted 
	FROM daily_file_staging.lindsay_mailed_format 
	WHERE early_voted IS NOT NULL
) AS subquery
WHERE vf.state_file_id=subquery.state_file_id
AND vf.vo_voted_general = false;
