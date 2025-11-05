const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkDatabase() {
  try {
    console.log('Checking database connection...');
    
    // Check users
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        role: true,
        isActive: true
      }
    });
    console.log('Users count:', users.length);
    console.log('Users:', users);
    
    // Check departments
    const departments = await prisma.department.findMany();
    console.log('Departments count:', departments.length);
    console.log('Departments:', departments.map(d => ({ id: d.id, name: d.name })));
    
    // Check wards
    const wards = await prisma.ward.findMany({
      include: {
        department: true
      }
    });
    console.log('Wards count:', wards.length);
    console.log('Wards:', wards.map(w => ({ 
      id: w.id, 
      name: w.name, 
      wardNumber: w.wardNumber, 
      type: w.type,
      department: w.department?.name 
    })));
    
  } catch (error) {
    console.error('Database error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase();