exports.up = knex => {
  return knex.raw(`
          
          CREATE TABLE insertion_orders_line_items_current (
              id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
              insertion_order_id VARCHAR REFERENCES insertion_orders_current (id) NOT NULL,
              timestamp TIMESTAMP NOT NULL DEFAULT now(),
              category VARCHAR NOT NULL,
              platform VARCHAR NOT NULL,
              objective VARCHAR NOT NULL,
              active_dates DATERANGE,
              cost_gross NUMERIC NOT NULL,
              cost_net  NUMERIC NOT NULL,
              commission_rate NUMERIC NOT NULL,
              created_by uuid REFERENCES users(id) NOT NULL
          );
                    
          CREATE TABLE insertion_orders_line_items_revisions (
              revision_id INTEGER PRIMARY KEY DEFAULT nextval('revision_id_seq'),
              timestamp TIMESTAMP NOT NULL DEFAULT now(),
              insertion_order_line_item_id uuid DEFAULT uuid_generate_v4() NOT NULL,
              insertion_order_id VARCHAR REFERENCES insertion_orders_current (id) NOT NULL,
              category VARCHAR NOT NULL,
              platform VARCHAR NOT NULL,
              objective VARCHAR NOT NULL,
              active_dates DATERANGE,
              cost_gross NUMERIC NOT NULL,
              cost_net  NUMERIC NOT NULL,
              commission_rate NUMERIC NOT NULL,
              created_by uuid REFERENCES users(id) NOT NULL
          );
          
          CREATE FUNCTION update_io_li_content() RETURNS trigger AS $$
              BEGIN
                  INSERT INTO insertion_orders_line_items_current (
                        id, 
                        insertion_order_id,
                        category,
                        platform,
                        objective,
                        active_dates,
                        cost_gross,
                        cost_net,
                        commission_rate,
                        created_by
                  ) VALUES (
                        NEW.insertion_order_line_item_id, 
                        NEW.insertion_order_id,
                        NEW.category,
                        NEW.platform,
                        NEW.objective,
                        NEW.active_dates,
                        NEW.cost_gross,
                        NEW.cost_net,
                        NEW.commission_rate,
                        NEW.created_by
                  ) ON CONFLICT (id) DO NOTHING;
                  UPDATE insertion_orders_line_items_current
                      SET 
                        insertion_order_id = REV.insertion_order_id,
                        category = REV.category,
                        platform = REV.platform,
                        objective = REV.objective,
                        active_dates = REV.active_dates,
                        cost_gross = REV.cost_gross,
                        cost_net = REV.cost_net,
                        commission_rate = REV.commission_rate,
                        created_by = REV.created_by
                      FROM insertion_orders_line_items_revisions AS rev
                      WHERE rev.insertion_order_line_item_id = insertion_orders_line_items_current.id
                          AND rev.revision_id = NEW.revision_id;
                  RETURN NEW;
              END;
          $$ LANGUAGE plpgsql;
          
          CREATE TRIGGER update_io_li_content
          AFTER INSERT ON insertion_orders_line_items_revisions
          FOR EACH ROW EXECUTE PROCEDURE update_io_li_content();
          
      `);
};

exports.down = knex => {
  return knex.raw(`
          DROP TRIGGER IF EXISTS update_io_li_content ON insertion_orders_line_items_revisions;
          DROP FUNCTION IF EXISTS update_io_li_content;
          DROP TABLE IF EXISTS insertion_orders_line_items_revisions;
          DROP TABLE IF EXISTS insertion_orders_line_items_current;
      `);
};
