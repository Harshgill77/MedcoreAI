const { neon } = require('@neondatabase/serverless');
const sql = neon('postgresql://neondb_owner:npg_1rVuyCBc2NiZ@ep-lucky-wildflower-aiv62f8n-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require');
async function testInsert() {
    try {
        const userId = "test-user-id";
        // We expect this might fail because userId is a foreign key to "User" table
        const res = await sql`
        INSERT INTO "ChatSession" (id, "userId", title, "createdAt", "updatedAt")
       VALUES (gen_random_uuid()::text, ${userId}, 'test', NOW(), NOW())
       RETURNING id, "userId", title, "createdAt", "updatedAt"
    `;
        console.log("Success:", res);
    } catch (e) {
        console.error("Error inserting ChatSession:", e.message);
    }
}
testInsert();
