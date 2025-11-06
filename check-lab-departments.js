const { PrismaClient } = require('@prisma/client');

async function checkLabDepartments() {
  const prisma = new PrismaClient();

  try {
    console.log('🔍 Checking lab departments...');
    
    const departments = await prisma.labDepartment.findMany();
    console.log(`📊 Found ${departments.length} lab departments:`);
    
    if (departments.length === 0) {
      console.log('❌ No lab departments found in database');
      console.log('💡 Creating default lab departments...');
      
      const defaultDepartments = [
        {
          name: 'Hematology',
          code: 'HEMA',
          description: 'Blood and blood-forming organs analysis'
        },
        {
          name: 'Biochemistry',
          code: 'BIOC',
          description: 'Chemical analysis of biological specimens'
        },
        {
          name: 'Microbiology',
          code: 'MICR',
          description: 'Microbial infections and antimicrobial testing'
        },
        {
          name: 'Immunology',
          code: 'IMMU',
          description: 'Immune system and antibody testing'
        },
        {
          name: 'Clinical Pathology',
          code: 'CLIP',
          description: 'General clinical laboratory services'
        },
        {
          name: 'Cytology',
          code: 'CYTO',
          description: 'Cellular analysis and cancer screening'
        },
        {
          name: 'Histopathology',
          code: 'HIST',
          description: 'Tissue analysis and biopsy examination'
        }
      ];

      for (const dept of defaultDepartments) {
        const created = await prisma.labDepartment.create({
          data: dept
        });
        console.log(`✅ Created department: ${created.name} (${created.code})`);
      }
      
      console.log('🎉 Successfully created default lab departments');
    } else {
      departments.forEach(dept => {
        console.log(`  - ${dept.name} (${dept.code}) - ${dept.isActive ? 'Active' : 'Inactive'}`);
      });
    }
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkLabDepartments();