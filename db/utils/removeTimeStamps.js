export default function removeTimeStampsColumns(knex, name) {
  return knex.schema.table(name, t => {
    t.dropColumn("created_at");
    t.dropColumn("updated_at");
  });
}
