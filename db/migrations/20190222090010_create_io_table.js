exports.up = knex => {
  return knex.raw(`
        
        CREATE TABLE insertion_orders_current (
            id VARCHAR PRIMARY KEY NOT NULL,
            timestamp TIMESTAMP NOT NULL DEFAULT now(),
            client_id uuid REFERENCES clients(id) NOT NULL, 
            created_by uuid REFERENCES users(id) NOT NULL,
            attribution VARCHAR NOT NULL,
            campaign_name VARCHAR NOT NULL,
            campaign_description TEXT,
            program_phase VARCHAR NOT NULL,
            commission_rate NUMERIC NOT NULL
        );
        
        CREATE SEQUENCE revision_id_seq;
        
        CREATE TABLE insertion_orders_revisions (
            revision_id INTEGER PRIMARY KEY DEFAULT nextval('revision_id_seq'),
            timestamp TIMESTAMP NOT NULL DEFAULT now(),
            insertion_order_id VARCHAR NOT NULL,
            client_id uuid REFERENCES clients(id) NOT NULL, 
            created_by uuid REFERENCES users(id) NOT NULL,
            attribution VARCHAR NOT NULL,
            campaign_name VARCHAR NOT NULL,
            campaign_description TEXT,
            program_phase VARCHAR NOT NULL,
            commission_rate NUMERIC NOT NULL
        );
        
        CREATE FUNCTION update_io_content() RETURNS trigger AS $$
            BEGIN
                INSERT INTO insertion_orders_current (
                    id, 
                    client_id, 
                    created_by, 
                    attribution,
                    campaign_name, 
                    campaign_description, 
                    program_phase, 
                    commission_rate
                ) VALUES (
                    NEW.insertion_order_id,
                    NEW.client_id,
                    NEW.created_by,
                    NEW.attribution,
                    NEW.campaign_name, 
                    NEW.campaign_description, 
                    NEW.program_phase, 
                    NEW.commission_rate
                ) ON CONFLICT (id) DO NOTHING;
                UPDATE insertion_orders_current
                    SET 
                        client_id = rev.client_id,
                        created_by = rev.created_by,
                        attribution = rev.attribution,
                        campaign_name = rev.campaign_name,
                        campaign_description = rev.campaign_description,
                        program_phase = rev.program_phase,
                        commission_rate = rev.commission_rate
                    FROM insertion_orders_revisions AS rev
                    WHERE rev.insertion_order_id = insertion_orders_current.id
                        AND rev.revision_id = NEW.revision_id;
                RETURN NEW;
            END;
        $$ LANGUAGE plpgsql;
        
        CREATE TRIGGER update_io_content
        AFTER INSERT ON insertion_orders_revisions
        FOR EACH ROW EXECUTE PROCEDURE update_io_content();
        
    `);
};

exports.down = knex => {
  return knex.raw(`
        DROP TRIGGER IF EXISTS update_io_content ON insertion_orders_revisions;
        DROP FUNCTION IF EXISTS update_io_content;
        DROP TABLE IF EXISTS insertion_orders_revisions;
        DROP SEQUENCE IF EXISTS revision_id_seq CASCADE;
        DROP TABLE IF EXISTS insertion_orders_current;
    `);
};
