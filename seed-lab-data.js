const { PrismaClient, Priority, LabOrderStatus } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting lab data seeding...');

  try {
    // Step 1: Create Lab Departments
    console.log('\n📋 Creating lab departments...');
    
    const departments = [
      {
        code: 'HEMA',
        name: 'Hematology',
        description: 'Blood analysis and disorders',
      },
      {
        code: 'BIOC',
        name: 'Biochemistry',
        description: 'Chemical analysis of body fluids',
      },
      {
        code: 'MICR',
        name: 'Microbiology',
        description: 'Study of microorganisms and infections',
      },
      {
        code: 'IMMU',
        name: 'Immunology',
        description: 'Immune system and antibody testing',
      },
      {
        code: 'PATH',
        name: 'Pathology',
        description: 'Tissue and cellular examination',
      },
      {
        code: 'CLIN',
        name: 'Clinical Chemistry',
        description: 'Routine chemistry panels',
      },
    ];

    for (const dept of departments) {
      await prisma.labDepartment.upsert({
        where: { code: dept.code },
        update: {},
        create: dept,
      });
    }
    console.log(`✅ Created ${departments.length} lab departments`);

    // Step 2: Create Lab Tests
    console.log('\n🧪 Creating lab tests...');
    
    const tests = [
      // Hematology Tests
      {
        code: 'CBC',
        name: 'Complete Blood Count',
        department: 'HEMA',
        category: 'Blood Work',
        description: 'Measures blood cell counts including RBC, WBC, platelets',
        price: 450.00,
        normalRange: 'WBC: 4.0-11.0, RBC: 4.2-5.4, Hgb: 12.0-16.0, Hct: 36-46',
        unit: '10³/μL, 10⁶/μL, g/dL, %',
        methodology: 'Automated hematology analyzer',
        sampleType: 'Whole Blood',
        sampleVolume: '2-3 mL',
        duration: '2-4 hours',
        fasting: false,
      },
      {
        code: 'ESR',
        name: 'Erythrocyte Sedimentation Rate',
        department: 'HEMA',
        category: 'Inflammation',
        description: 'Measures rate at which red blood cells settle',
        price: 200.00,
        normalRange: 'Male: 0-15 mm/hr, Female: 0-20 mm/hr',
        unit: 'mm/hr',
        methodology: 'Westergren method',
        sampleType: 'Whole Blood',
        sampleVolume: '2 mL',
        duration: '1 hour',
        fasting: false,
      },
      {
        code: 'PT',
        name: 'Prothrombin Time',
        department: 'HEMA',
        category: 'Coagulation',
        description: 'Measures blood clotting time',
        price: 350.00,
        normalRange: '11-13.5 seconds',
        unit: 'seconds',
        methodology: 'Automated coagulation analyzer',
        sampleType: 'Plasma',
        sampleVolume: '2 mL',
        duration: '2 hours',
        fasting: false,
      },
      // Biochemistry Tests
      {
        code: 'BMP',
        name: 'Basic Metabolic Panel',
        department: 'BIOC',
        category: 'Chemistry',
        description: 'Tests kidney function, blood sugar, and electrolytes',
        price: 650.00,
        normalRange: 'Glucose: 70-100, BUN: 7-20, Creatinine: 0.6-1.2, Na: 136-145, K: 3.5-5.0',
        unit: 'mg/dL, mg/dL, mg/dL, mEq/L, mEq/L',
        methodology: 'Automated chemistry analyzer',
        sampleType: 'Serum',
        sampleVolume: '3 mL',
        duration: '2-3 hours',
        fasting: true,
      },
      {
        code: 'LFT',
        name: 'Liver Function Test',
        department: 'BIOC',
        category: 'Chemistry',
        description: 'Tests liver enzymes and function',
        price: 800.00,
        normalRange: 'ALT: 7-56 U/L, AST: 10-40 U/L, Albumin: 3.5-5.5 g/dL',
        unit: 'U/L, g/dL',
        methodology: 'Automated chemistry analyzer',
        sampleType: 'Serum',
        sampleVolume: '3 mL',
        duration: '3-4 hours',
        fasting: false,
      },
      {
        code: 'LIPID',
        name: 'Lipid Panel',
        department: 'CLIN',
        category: 'Chemistry',
        description: 'Measures cholesterol and triglycerides',
        price: 550.00,
        normalRange: 'Total Cholesterol <200 mg/dL, LDL <100 mg/dL, HDL >40 mg/dL, Triglycerides <150 mg/dL',
        unit: 'mg/dL',
        methodology: 'Enzymatic colorimetric',
        sampleType: 'Serum',
        sampleVolume: '3 mL',
        duration: '3-4 hours',
        fasting: true,
      },
      {
        code: 'HBA1C',
        name: 'Hemoglobin A1c',
        department: 'CLIN',
        category: 'Diabetes',
        description: 'Measures average blood sugar over 3 months',
        price: 700.00,
        normalRange: '<5.7% (Normal), 5.7-6.4% (Prediabetes), ≥6.5% (Diabetes)',
        unit: '%',
        methodology: 'HPLC',
        sampleType: 'Whole Blood',
        sampleVolume: '2 mL',
        duration: '4-6 hours',
        fasting: false,
      },
      // Immunology Tests
      {
        code: 'TSH',
        name: 'Thyroid Stimulating Hormone',
        department: 'IMMU',
        category: 'Endocrinology',
        description: 'Tests thyroid function',
        price: 850.00,
        normalRange: '0.4-4.0 mIU/L',
        unit: 'mIU/L',
        methodology: 'Chemiluminescent immunoassay',
        sampleType: 'Serum',
        sampleVolume: '3 mL',
        duration: '4-6 hours',
        fasting: false,
      },
      {
        code: 'FT3',
        name: 'Free T3',
        department: 'IMMU',
        category: 'Endocrinology',
        description: 'Measures active thyroid hormone',
        price: 900.00,
        normalRange: '2.3-4.2 pg/mL',
        unit: 'pg/mL',
        methodology: 'Chemiluminescent immunoassay',
        sampleType: 'Serum',
        sampleVolume: '3 mL',
        duration: '4-6 hours',
        fasting: false,
      },
      {
        code: 'FT4',
        name: 'Free T4',
        department: 'IMMU',
        category: 'Endocrinology',
        description: 'Measures free thyroxine',
        price: 900.00,
        normalRange: '0.8-1.8 ng/dL',
        unit: 'ng/dL',
        methodology: 'Chemiluminescent immunoassay',
        sampleType: 'Serum',
        sampleVolume: '3 mL',
        duration: '4-6 hours',
        fasting: false,
      },
      // Microbiology Tests
      {
        code: 'URINE',
        name: 'Urinalysis',
        department: 'MICR',
        category: 'Microbiology',
        description: 'Examines urine for various substances',
        price: 250.00,
        normalRange: 'pH: 4.5-8.0, Specific Gravity: 1.005-1.030',
        unit: 'Various',
        methodology: 'Dipstick and microscopy',
        sampleType: 'Urine',
        sampleVolume: '10-50 mL',
        duration: '1-2 hours',
        fasting: false,
      },
      {
        code: 'CULTURE',
        name: 'Urine Culture',
        department: 'MICR',
        category: 'Microbiology',
        description: 'Tests for bacterial infection in urine',
        price: 600.00,
        normalRange: '<10,000 CFU/mL',
        unit: 'CFU/mL',
        methodology: 'Culture and sensitivity',
        sampleType: 'Urine',
        sampleVolume: '10 mL',
        duration: '24-48 hours',
        fasting: false,
      },
      // More tests
      {
        code: 'CRP',
        name: 'C-Reactive Protein',
        department: 'IMMU',
        category: 'Inflammation',
        description: 'Measures inflammation marker',
        price: 500.00,
        normalRange: '<3.0 mg/L (Low risk), 3.0-10.0 mg/L (Moderate), >10.0 mg/L (High)',
        unit: 'mg/L',
        methodology: 'Immunoturbidimetric',
        sampleType: 'Serum',
        sampleVolume: '2 mL',
        duration: '3-4 hours',
        fasting: false,
      },
      {
        code: 'VITD',
        name: 'Vitamin D (25-OH)',
        department: 'IMMU',
        category: 'Vitamins',
        description: 'Measures vitamin D levels',
        price: 1200.00,
        normalRange: '30-100 ng/mL (Sufficient), 20-30 ng/mL (Insufficient), <20 ng/mL (Deficient)',
        unit: 'ng/mL',
        methodology: 'Chemiluminescent immunoassay',
        sampleType: 'Serum',
        sampleVolume: '3 mL',
        duration: '4-6 hours',
        fasting: false,
      },
      {
        code: 'VITB12',
        name: 'Vitamin B12',
        department: 'IMMU',
        category: 'Vitamins',
        description: 'Measures vitamin B12 levels',
        price: 800.00,
        normalRange: '200-900 pg/mL',
        unit: 'pg/mL',
        methodology: 'Chemiluminescent immunoassay',
        sampleType: 'Serum',
        sampleVolume: '3 mL',
        duration: '4-6 hours',
        fasting: false,
      },
    ];

    for (const test of tests) {
      await prisma.labTest.upsert({
        where: { code: test.code },
        update: {},
        create: test,
      });
    }
    console.log(`✅ Created ${tests.length} lab tests`);

    // Step 3: Create Lab Templates (Common Panels)
    console.log('\n📦 Creating lab templates...');
    
    const templates = [
      {
        name: 'Complete Checkup Panel',
        description: 'Comprehensive health screening',
        testIds: JSON.stringify(['CBC', 'BMP', 'LIPID', 'LFT', 'TSH']),
        totalCost: 3650.00,
      },
      {
        name: 'Diabetes Monitoring',
        description: 'Tests for diabetes management',
        testIds: JSON.stringify(['BMP', 'HBA1C', 'LIPID']),
        totalCost: 1900.00,
      },
      {
        name: 'Thyroid Panel',
        description: 'Complete thyroid function tests',
        testIds: JSON.stringify(['TSH', 'FT3', 'FT4']),
        totalCost: 2650.00,
      },
      {
        name: 'Basic Health Screen',
        description: 'Essential routine tests',
        testIds: JSON.stringify(['CBC', 'BMP', 'URINE']),
        totalCost: 1350.00,
      },
    ];

    for (const template of templates) {
      const existing = await prisma.labTemplate.findFirst({
        where: { name: template.name },
      });
      
      if (!existing) {
        await prisma.labTemplate.create({
          data: template,
        });
      }
    }
    console.log(`✅ Created ${templates.length} lab templates`);

    // Step 4: Get patients and doctors for creating orders
    console.log('\n👥 Fetching patients and doctors...');
    const patients = await prisma.patient.findMany({ take: 5 });
    const doctors = await prisma.doctor.findMany({ take: 3 });
    
    if (patients.length === 0 || doctors.length === 0) {
      console.log('⚠️  No patients or doctors found. Skipping order creation.');
      console.log('   Run patient and doctor seed scripts first.');
      return;
    }

    // Step 5: Create Sample Lab Orders
    console.log('\n📋 Creating sample lab orders...');
    
    const testsInDb = await prisma.labTest.findMany();
    const testIds = testsInDb.map(t => t.id);
    
    const sampleOrders = [
      {
        patientId: patients[0].id,
        doctorId: doctors[0].id,
        testIds: [testIds[0], testIds[3]], // CBC + BMP
        priority: Priority.NORMAL,
        status: LabOrderStatus.COMPLETED,
        clinicalNotes: 'Routine health checkup',
        requestedBy: `Dr. ${doctors[0].firstName} ${doctors[0].lastName}`,
      },
      {
        patientId: patients[1]?.id || patients[0].id,
        doctorId: doctors[1]?.id || doctors[0].id,
        testIds: [testIds[5], testIds[6]], // Lipid + HbA1c
        priority: Priority.HIGH,
        status: LabOrderStatus.IN_PROGRESS,
        clinicalNotes: 'Diabetes follow-up',
        requestedBy: doctors[1] ? `Dr. ${doctors[1].firstName} ${doctors[1].lastName}` : `Dr. ${doctors[0].firstName} ${doctors[0].lastName}`,
      },
      {
        patientId: patients[2]?.id || patients[0].id,
        doctorId: doctors[0].id,
        testIds: [testIds[7], testIds[8], testIds[9]], // TSH + FT3 + FT4
        priority: Priority.URGENT,
        status: LabOrderStatus.PENDING,
        clinicalNotes: 'Suspected thyroid disorder',
        requestedBy: `Dr. ${doctors[0].firstName} ${doctors[0].lastName}`,
      },
      {
        patientId: patients[3]?.id || patients[0].id,
        doctorId: doctors[2]?.id || doctors[0].id,
        testIds: [testIds[10]], // Urinalysis
        priority: Priority.NORMAL,
        status: LabOrderStatus.COMPLETED,
        clinicalNotes: 'UTI symptoms',
        requestedBy: doctors[2] ? `Dr. ${doctors[2].firstName} ${doctors[2].lastName}` : `Dr. ${doctors[0].firstName} ${doctors[0].lastName}`,
      },
    ];

    let orderCount = await prisma.labOrder.count();
    
    for (const orderData of sampleOrders) {
      orderCount++;
      const orderId = `LAB${orderCount.toString().padStart(6, '0')}`;
      
      // Calculate total cost
      const selectedTests = testsInDb.filter(t => orderData.testIds.includes(t.id));
      const totalCost = selectedTests.reduce((sum, test) => sum + test.price, 0);
      
      const order = await prisma.labOrder.create({
        data: {
          orderId,
          patientId: orderData.patientId,
          doctorId: orderData.doctorId,
          testIds: JSON.stringify(orderData.testIds),
          priority: orderData.priority,
          status: orderData.status,
          clinicalNotes: orderData.clinicalNotes,
          requestedBy: orderData.requestedBy,
          totalCost,
          orderedAt: new Date(),
          ...(orderData.status === LabOrderStatus.IN_PROGRESS && {
            collectedAt: new Date(Date.now() - 3600000), // 1 hour ago
            processingAt: new Date(Date.now() - 1800000), // 30 min ago
          }),
          ...(orderData.status === LabOrderStatus.COMPLETED && {
            collectedAt: new Date(Date.now() - 7200000), // 2 hours ago
            processingAt: new Date(Date.now() - 5400000), // 1.5 hours ago
            completedAt: new Date(Date.now() - 1800000), // 30 min ago
          }),
        },
      });

      // Create results for completed orders
      if (orderData.status === LabOrderStatus.COMPLETED) {
        // First try to get a lab technician, otherwise use a doctor
        let technicianId;
        const labTech = await prisma.user.findFirst({ 
          where: { role: 'LAB_TECHNICIAN' },
        });
        
        if (labTech) {
          technicianId = labTech.id;
        } else {
          // Use the doctor's userId if lab tech doesn't exist
          const doctor = await prisma.doctor.findUnique({
            where: { id: orderData.doctorId },
          });
          technicianId = doctor?.userId || doctors[0].userId;
        }
        
        // Only create results if we have a valid technician ID
        if (technicianId) {
          for (const testId of orderData.testIds) {
            const test = testsInDb.find(t => t.id === testId);
            if (test) {
              await prisma.labResult.create({
                data: {
                  orderId: order.id,
                  testId: test.id,
                  value: test.normalRange?.split(',')[0] || '--- Normal ---',
                  unit: test.unit || '',
                  normalRange: test.normalRange || '',
                  status: 'NORMAL',
                  notes: 'Results within normal range',
                  technician: technicianId,
                  method: test.methodology || 'Standard',
                  instrument: 'Automated Analyzer',
                  testedAt: new Date(Date.now() - 1800000),
                },
              });
            }
          }
        }
      }

      console.log(`  ✅ Created order ${orderId}`);
    }
    
    console.log(`✅ Created ${sampleOrders.length} lab orders`);

    console.log('\n✅ Lab data seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   - Departments: ${departments.length}`);
    console.log(`   - Tests: ${tests.length}`);
    console.log(`   - Templates: ${templates.length}`);
    console.log(`   - Orders: ${sampleOrders.length}`);
    
  } catch (error) {
    console.error('❌ Error seeding lab data:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
