const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
const prisma = require("../config/prisma");

async function main() {
  try {
    const courses = await prisma.course.findMany({
      include: {
        category: true,
        instructor: true,
      }
    });
    
    console.log("=== COURSES IN DATABASE ===");
    courses.forEach(c => {
      console.log(`- Name: "${c.courseName}"`);
      console.log(`  ID: ${c.id}`);
      console.log(`  Status: ${c.status}`);
      console.log(`  Category: ${c.category ? c.category.name : "None"} (ID: ${c.categoryId})`);
      console.log(`  Instructor: ${c.instructor ? c.instructor.email : "None"}`);
      console.log("------------------------");
    });
    
    await prisma.$disconnect();
  } catch (error) {
    console.error("Error querying database:", error);
    process.exit(1);
  }
}

main();
