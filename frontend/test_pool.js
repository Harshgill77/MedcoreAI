require('dotenv').config({ path: '.env' });
const { Pool } = require('@neondatabase/serverless');

const url = process.env.DATABASE_URL;
const pool = new Pool({ connectionString: url, max: 10 });

async function testPool() {
    try {
        const { rows } = await pool.query(
            `INSERT INTO "ChatSession" (id, "userId", title, "createdAt", "updatedAt")
       VALUES (gen_random_uuid()::text, $1, $2, NOW(), NOW())
       RETURNING id, "userId", title, "createdAt", "updatedAt"`,
            ["test-user-id", "test pool"]
        );
        console.log("Success:", rows);
    } catch (err) {
        console.error("Pool Insert Error:", err.message);
    } finally {
        await pool.end();
    }
}
testPool();
