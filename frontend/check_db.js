const { neon } = require('@neondatabase/serverless');
const sql = neon('postgresql://neondb_owner:npg_1rVuyCBc2NiZ@ep-lucky-wildflower-aiv62f8n-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require');
async function check() {
    try {
        const res = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'ChatSession';
    `;
        console.log("ChatSession columns:");
        console.table(res);
    } catch (e) {
        console.error(e);
    }
}
check();
